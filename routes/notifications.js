/**
 * @file notifications.js
 * @description Router para sa user invitations, batch email dispatches, at notification settings updates.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapAlumniFromDB, mapNotificationFromDB } from '../mappers.js';
import { transporter } from './mailer.js';

const router = express.Router();

/**
 * POST /api/invite-user
 * Nag-e-email/pre-invite ng mga bagong user (Alumni/Employer/Chairperson) at nag-se-setup ng default password.
 */
router.post('/invite-user', authenticateToken, async (req, res) => {
  try {
    const { email, role, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const cleanEmail = email.trim();
    const parts = cleanEmail.split('@');
    const nameSeed = parts[0];
    const customUserId = role === 'Alumni' ? `BSC-2026-${Math.floor(100 + Math.random() * 900)}` : nameSeed;

    const newUser = {
      id: `bsc-invited-${Date.now()}`,
      userId: customUserId,
      name: nameSeed.split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
      email: cleanEmail,
      role: role,
      isInitialPasswordNeeded: true,
      password: 'bsc123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      companyId: null
    };

    // Kapag ang role ay Employer, i-initialize ang kumpanya nito
    if (role === 'Employer') {
      const companyId = `employer-${Date.now()}`;
      const defaultCompanyName = nameSeed.split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ' Partners';
      await pool.query(
        `INSERT INTO employers (
          id, company_name, industry, address, email, phone, contact_person, position, company_size, is_verified, vacancies_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId, defaultCompanyName, 'Information Technology', 'Basco, Batanes', cleanEmail, '', 
          newUser.name, 'Representative', '11-50', 0, 0
        ]
      );
      newUser.companyId = companyId;
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    await pool.query(
      `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar, company_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.userId, hashedPassword, newUser.name, newUser.email, newUser.role, newUser.isInitialPasswordNeeded ? 1 : 0, newUser.avatar, newUser.companyId]
    );

    // Kapag ang role ay Alumni, i-initialize ang isang walang lamang profile
    if (role === 'Alumni') {
      const defaultFirstName = nameSeed.split('.')[0] || nameSeed;
      const defaultLastName = nameSeed.split('.')[1] || 'Grad';
      await pool.query(
        `INSERT INTO alumni_profiles (
          student_id, first_name, last_name, email, phone, gender, civil_status, 
          date_of_birth, address, program, year_graduated, honors, 
          professional_exam_passed, employment_status, job_title, job_description, 
          employer_name, employment_type, sector, monthly_income, 
          job_related_to_course, time_to_first_job, skills, profile_completeness
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id, defaultFirstName, defaultLastName, cleanEmail, '', 'Male', 'Single',
          null, '', 'BS Information Technology', 2026, 'None', 'None', 'Unemployed', '', '', '', '', '', '', 'No', '', '[]', 30
        ]
      );
    }

    // Awtomatikong mag-send ng email invitation kung may active SMTP transporter
    const emailSubject = 'Portal Access Invitation | Batanes State College CareerPath';
    const emailBody = `Hello,\n\nYou have been invited by Batanes State College to register and access the CareerPath Graduate Tracer & Employability Analytics System as an ${role}.\n\nBelow are your initial portal credentials:\nPortal URL: http://localhost:3000/\nUser ID: ${newUser.userId}\nTemporary Password: bsc123\n\nPlease log in and update your password immediately upon your first access.\n\nRespectfully,\nOffice of Tracer Programs & Administrative Analytics\nBatanes State College`;

    if (transporter && cleanEmail) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"BSC CareerPath" <${process.env.SMTP_USER}>`,
          to: cleanEmail,
          subject: emailSubject,
          text: emailBody
        });
        console.log(`[Invite SMTP Success] Invitation email safely dispatched to: ${cleanEmail}`);
      } catch (mailErr) {
        console.error(`[Invite SMTP Error] Failed to dispatch email to: ${cleanEmail}`, mailErr);
      }
    } else {
      console.log(`[Invite Fallback Mode] Logged credentials: UserID: ${newUser.userId} / Pass: bsc123`);
    }

    // Isulat ang notification para sa fallback visual check sa admin panel
    const notifyId = `notify-invite-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id, title, text, date, \`read\`) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
       [notifyId, emailSubject, `Invitation sent to ${newUser.name} (${cleanEmail}) as ${role}. UserID: ${newUser.userId}, Pass: bsc123`]
    );

    // I-log ang pag-invite ng bagong user
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUserId || 'system',
      userEmail: activeUser?.email || 'admin@bsc.edu.ph',
      userName: activeUser?.name || 'Administrator',
      userRole: activeUser?.role || 'Administrator',
      action: 'Invited New Portal User / Created Credentials',
      module: 'Settings / Security',
      details: `Pre-invited '${newUser.name}' with role '${role}'. Assigned UserID: '${newUser.userId}' & Pass: 'bsc123'`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [usersRows] = await pool.query('SELECT * FROM users');
    const [alumniRows] = await pool.query(`
      SELECT ap.*, u.is_initial_password_needed 
      FROM alumni_profiles ap 
      LEFT JOIN users u ON ap.student_id = u.id 
      ORDER BY ap.last_updated DESC
    `);

    res.json({ success: true, users: usersRows.map(mapUserFromDB), alumni: alumniRows.map(mapAlumniFromDB) });
  } catch (err) {
    console.error('Invite user error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/send-email
 * Nagpapadala ng automated email alerts/nudges gamit ang SMTP. May kasamang database fallback logic kapag offline.
 */
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { activeUserId, targetAlumniIds, customSubject, customBody } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    let sentCount = 0;
    for (const studentId of targetAlumniIds) {
      const [alRows] = await pool.query('SELECT * FROM alumni_profiles WHERE student_id = ?', [studentId]);
      if (alRows.length > 0) {
        const alumni = mapAlumniFromDB(alRows[0]);
        const customEmailSubject = customSubject || 'Profile Incomplete Notice | Batanes State College Tracer Program';
        const customEmailBody = (customBody || `Hello ${alumni.name},\n\nWe noticed that your Batanes State College Graduate Tracer profile is currently at ${alumni.profileCompleteness}% completion.\n\nTo align with official Commission on Higher Education (CHED) Memorandum Orders, please log in with your credentials and update your current employment status and matching skill inventory.\n\nRespectfully,\nOffice of Tracer Programs & Administrative Analytics\nBatanes State College`).replace('{name}', alumni.name);

        let emailStatusDetail = `Message dispatched to ${alumni.name}`;
        if (transporter && alumni.email) {
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"BSC CareerPath" <${process.env.SMTP_USER}>`,
              to: alumni.email,
              subject: customEmailSubject,
              text: customEmailBody
            });
            emailStatusDetail = `Email sent successfully to ${alumni.name} (${alumni.email})`;
            console.log(`[Mail Dispatch] Dispatched real email to ${alumni.email}`);
          } catch (mailErr) {
            emailStatusDetail = `Failed to send email to ${alumni.name}: ${mailErr.message}`;
            console.error(`[Mail Dispatch Error] Failed to send to ${alumni.email}:`, mailErr);
          }
        } else {
          console.log(`[Mail Dispatch Log] Fallback logged notification for ${alumni.name} (No active SMTP server).`);
        }

        const notifyId = `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await pool.query(
          `INSERT INTO notifications (id, title, text, date, \`read\`) 
           VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
          [notifyId, customEmailSubject, `${emailStatusDetail}: ${customEmailBody.substring(0, 100)}...`]
        );
        sentCount++;
      }
    }

    if (sentCount > 0) {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        userId: activeUserId || 'bsc-admin-1',
        userEmail: activeUser?.email || 'admin@bsc.edu.ph',
        userName: activeUser?.name || 'Sheena De Guzman',
        userRole: activeUser?.role || 'Administrator',
        action: 'Batch Dispatched Tracer Reminder Emails',
        module: 'Notification Center / Settings',
        details: `Dispatched ${sentCount} reminder letters requesting profile completes sent from Batanes State College.`
      };

      await pool.query(
        'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
      );
    }

    const [notificationRows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
    res.json({ success: true, notifications: notificationRows.map(mapNotificationFromDB) });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/toggle-notification-read
 * Nagpapalit ng notification status (read / unread).
 */
router.post('/toggle-notification-read', authenticateToken, async (req, res) => {
  try {
    const { id, read } = req.body;
    await pool.query('UPDATE notifications SET `read` = ? WHERE id = ?', [read ? 1 : 0, id]);
    const [notificationRows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
    res.json({ success: true, notifications: notificationRows.map(mapNotificationFromDB) });
  } catch (err) {
    console.error('Toggle notification error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
