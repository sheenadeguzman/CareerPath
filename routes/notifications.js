/**
 * @file notifications.js
 * @description Router para sa pag-manage ng invitations, batch emails (tracer nudge reminders), at notification settings updates.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { pool, encrypt, decrypt } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapAlumniFromDB, mapNotificationFromDB } from '../mappers.js';
import { transporter } from './mailer.js';

const router = express.Router();

//Helper function upang makuha ang opisyal na Department name mula sa email ng Chairperson.
function getDepartmentFromEmail(email) {
  const emailLower = email.toLowerCase();
  if (emailLower.includes('it') || emailLower.includes('ict')) {
    return 'Information and Communication Technology Department';
  } else if (emailLower.includes('htm')) {
    return 'Hospitality and Tourism Management Department';
  } else if (emailLower.includes('educ')) {
    return 'Teacher Education Department';
  } else if (emailLower.includes('agri')) {
    return 'Agriculture Department';
  } else if (emailLower.includes('tech') || emailLower.includes('industech')) {
    return 'Industrial Technology Department';
  }
  return 'General Department';
}

// Helper function upang makuha ang maikling Department username/user_id mula sa email ng Chairperson.

function getDepartmentAbbreviation(email) {
  const emailLower = email.toLowerCase();
  if (emailLower.includes('it') || emailLower.includes('ict')) {
    return 'ICT Department';
  } else if (emailLower.includes('htm')) {
    return 'HTM Department';
  } else if (emailLower.includes('educ')) {
    return 'Teacher Education Department';
  } else if (emailLower.includes('agri')) {
    return 'Agriculture Department';
  } else if (emailLower.includes('tech') || emailLower.includes('industech')) {
    return 'Industrial Technology Department';
  }
  return 'Department';
}

//POST /api/invite-user
//Endpoint para mag-invite ng bagong user (Alumni, Employer, o Chairperson).
//Awtomatiko nitong ginagawan ng user account na may default password na 'bsc123'.
//Gagawa rin ito ng company record kung Employer ang in-invite, at empty profile stub naman kung Alumni.

router.post('/invite-user', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    const activeUser = req.user;

    // Only Super Admin and Administrator can invite users
    if (!activeUser || (activeUser.role !== 'Super Admin' && activeUser.role !== 'Administrator')) {
      return res.status(403).json({ error: 'Permission denied: Only Administrators and Super Admins can issue portal invitations.' });
    }

    const cleanEmail = email.trim();
    const parts = cleanEmail.split('@');
    const nameSeed = parts[0];
    
    // Matutukoy ang custom login user_id base sa role: 
    // Kung Alumni, random student ID template. Kung Employer, ang email. Kung Chairperson, ang department mismo.
    const customUserId = role === 'Alumni' 
      ? `BSC-2026-${Math.floor(100 + Math.random() * 900)}` 
      : (role === 'Employer' 
          ? cleanEmail 
          : (role === 'Department Chairperson' 
              ? getDepartmentAbbreviation(cleanEmail) 
              : nameSeed));

    const newUser = {
      id: `bsc-invited-${Date.now()}`,
      userId: customUserId,
      name: nameSeed.split('.').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
      email: cleanEmail,
      role: role,
      isInitialPasswordNeeded: true,
      password: 'bsc123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      companyId: null,
      program: role === 'Department Chairperson' ? getDepartmentFromEmail(cleanEmail) : null
    };

    // Kung Employer ang in-invite, gumawa din ng stub company record sa employers table
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

    // I-hash ang default password na 'bsc123' at i-save ang bagong user credentials
    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    await pool.query(
      `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar, company_id, program) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.userId, hashedPassword, encrypt(newUser.name), newUser.email, newUser.role, newUser.isInitialPasswordNeeded ? 1 : 0, newUser.avatar, newUser.companyId, newUser.program || null]
    );

    // Kung Alumni ang in-invite, gumawa din ng blangkong record sa alumni_profiles
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
          newUser.id, encrypt(defaultFirstName), encrypt(defaultLastName), cleanEmail, '', null, null,
          null, '', newUser.program || 'Bachelor of Science in Information Technology', 2026, '', '', 'Unemployed', '', '', '', '', 'N/A', '', 'No', '', '[]', 30
        ]
      );
    }

    // Magpadala ng email invitation details gamit ang nodemailer SMTP transporter
    const portalUrl = process.env.APP_URL || (req.protocol + '://' + req.get('host'));
    const emailSubject = 'Portal Access Invitation | Batanes State College CareerPath';
    const emailBody = `Hello,\n\nYou have been invited by Batanes State College to register and access the CareerPath Graduate Tracer & Employability Analytics System as an ${role}.\n\nBelow are your initial portal credentials:\nPortal URL: ${portalUrl}/\nUser ID: ${newUser.userId}\nTemporary Password: bsc123\n\nPlease log in and update your password immediately upon your first access.\n\nRespectfully,\nBatanes State College`;

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

    // Mag-save din ng alert sa notifications table ng system
    const notifyId = `notify-invite-${Date.now()}`;
    await pool.query(
      `INSERT INTO notifications (id, title, text, date, \`read\`, user_id) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, ?)`,
       [notifyId, emailSubject, `Invitation sent to ${newUser.name} (${cleanEmail}) as ${role}. UserID: ${newUser.userId}, Pass: bsc123`, activeUserId || 'bsc-super-admin']
    );

    // Itala ang pag-invite sa activity logs para sa trace history ng admin
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

    // Kuhanin ang pinakabagong users at alumni records para i-refresh ang UI sa admin dashboard
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

//POST /api/send-email
//Endpoint para sa pagpapadala ng custom email/advisory sa mga Alumni, Department Chair, o Employers.
router.post('/send-email', authenticateToken, async (req, res) => {
  try {
    const { targetAlumniIds, customSubject, customBody, recipients } = req.body;
    const activeUser = req.user;

    // Only Super Admin and Administrator can broadcast emails
    if (!activeUser || (activeUser.role !== 'Super Admin' && activeUser.role !== 'Administrator')) {
      return res.status(403).json({ error: 'Permission denied: Only Administrators and Super Admins can broadcast emails.' });
    }

    let finalRecipients = [];

    // 1. Kung nagpasa ng tahasang recipients list (array ng { id, email, name, role })
    if (Array.isArray(recipients) && recipients.length > 0) {
      finalRecipients = recipients.filter(r => r && (r.email || r.id));
    }

    // 2. Kung nagpasa ng targetAlumniIds (backward compatibility para sa alumni batching)
    if (Array.isArray(targetAlumniIds) && targetAlumniIds.length > 0) {
      for (const studentId of targetAlumniIds) {
        if (!finalRecipients.some(r => r.id === studentId || r.studentId === studentId)) {
          const [alRows] = await pool.query('SELECT * FROM alumni_profiles WHERE student_id = ?', [studentId]);
          if (alRows.length > 0) {
            const alumni = mapAlumniFromDB(alRows[0]);
            finalRecipients.push({
              id: studentId,
              studentId: studentId,
              name: alumni.name,
              email: alumni.email,
              role: 'Alumni'
            });
          }
        }
      }
    }

    if (finalRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid recipients selected. Please select at least one recipient.' });
    }

    let sentCount = 0;
    const dispatchResults = [];
    
    // Ipadala ang custom email sa bawat isa sa napiling target list
    for (const rec of finalRecipients) {
      const recipientName = rec.name ? decrypt(rec.name) : 'Valued Member';
      const recipientEmail = rec.email;
      const recipientRole = rec.role || 'Member';
      const recipientId = rec.id || rec.userId || rec.studentId || 'system';

      const emailSubject = customSubject || 'Official Communication | Batanes State College CareerPath';
      
      // I-replace ang placeholder tags tulad ng '{name}' at '{role}' gamit ang aktwal na detalye ng recipient
      const emailBody = (customBody || `Hello {name},\n\nGreetings from Batanes State College CareerPath.\n\nRespectfully,\nOffice of the Portal Administrator\nBatanes State College`)
        .replace(/{name}/g, recipientName)
        .replace(/{role}/g, recipientRole);

      let sendSuccess = true;
      let errorMessage = '';
      
      // Ipadala gamit ang SMTP kung configured
      if (transporter && recipientEmail) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"BSC CareerPath" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            subject: emailSubject,
            text: emailBody
          });
          console.log(`[Mail Dispatch] Dispatched real email to ${recipientEmail} (${recipientRole})`);
        } catch (mailErr) {
          sendSuccess = false;
          errorMessage = mailErr.message;
          console.error(`[Mail Dispatch Error] Failed to send to ${recipientEmail}:`, mailErr);
        }
      } else {
        sendSuccess = false;
        errorMessage = transporter ? 'Missing recipient email' : 'SMTP configuration is missing (Logged as in-app alert)';
        console.log(`[Mail Dispatch Log] In-app notification logged for ${recipientName} (${recipientRole})`);
      }

      dispatchResults.push({
        id: recipientId,
        name: recipientName,
        email: recipientEmail,
        role: recipientRole,
        success: sendSuccess,
        error: errorMessage
      });

      // I-record din ang abiso sa notifications table para makita sa notification bell ng recipient
      const notifyId = `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await pool.query(
        `INSERT INTO notifications (id, title, text, date, \`read\`, user_id) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0, ?)`,
        [notifyId, emailSubject, emailBody, recipientId]
      );
      sentCount++;
    }

    // Mag-create ng log event para sa dispatch operation na ito
    if (sentCount > 0) {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        userId: activeUser?.id || 'bsc-admin',
        userEmail: activeUser?.email || 'admin@bsc.edu.ph',
        userName: activeUser?.name || 'Administrator',
        userRole: activeUser?.role || 'Administrator',
        action: 'Dispatched Portal Communication Email',
        module: 'Message / Email Hub',
        details: `Dispatched communication "${customSubject || 'Advisory'}" to ${sentCount} recipient(s).`
      };

      await pool.query(
        'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
      );
    }

    // Kunin ang mga bagong notifications at ibalik sa client
    const [notificationRows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
    res.json({ success: true, count: sentCount, results: dispatchResults, notifications: notificationRows.map(mapNotificationFromDB) });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//POST /api/toggle-notification-read
//Endpoint para baguhin ang estado ng notification (Read / Unread) batay sa ID nito.
router.post('/toggle-notification-read', authenticateToken, async (req, res) => {
  try {
    const { id, read } = req.body;
    await pool.query('UPDATE notifications SET `read` = ? WHERE id = ?', [read ? 1 : 0, id]);
    
    let notificationRows = [];
    if (req.user.role === 'Administrator' || req.user.role === 'Super Admin') {
      const [rows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
      notificationRows = rows;
    } else {
      const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY date DESC',
        [req.user.id]
      );
      notificationRows = rows;
    }
    res.json({ success: true, notifications: notificationRows.map(mapNotificationFromDB) });
  } catch (err) {
    console.error('Toggle notification error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
