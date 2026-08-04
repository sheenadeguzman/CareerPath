/**
 * @file auth.js
 * @description Authentication router para sa login, password recovery, at password change ng CareerPath platform.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { mapUserFromDB } from '../mappers.js';
import { transporter } from './mailer.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bsc_careerpath_super_secret_key';

// In-memory record ng password reset codes. Naka-map ito mula email patungong {code, expires}
const resetCodes = new Map();

/**
 * POST /api/login
 * Endpoint para sa pag-log in ng mga user (Admin, Chairperson, Alumni, o Employer).
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Hanapin muna ang user sa database gamit ang case-insensitive match sa user_id (LOWER)
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(user_id) = ?', [userId.trim().toLowerCase()]);

    // Pag walang nahanap na tugmang user_id, mag-return agad ng 401 Unauthorized error
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    // I-map ang database record patungo sa malinis na JavaScript camelCase object format
    const user = mapUserFromDB(rows[0]);

    // I-validate ang password gamit ang bcrypt.compare
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) { }

    // Kung match ang password (o kung match sa default plaintext para sa mga bagong gawang account)
    if (isMatch || password === user.password) {
      // Gagawa ng JWT token na may expiration na 24 hours para sa authentication middleware validation
      const token = jwt.sign(
        { id: user.id, userId: user.userId, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // I-return ang token at mga kailangang user details sa frontend client
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          isInitialPasswordNeeded: user.isInitialPasswordNeeded,
          avatar: user.avatar,
          program: user.program,
          companyId: user.companyId
        }
      });
    }

    // Pag mali ang nilagay na password, ibalik ay 401 response code
    res.status(401).json({ error: 'Incorrect Password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/forgot-password
 * Endpoint para sa pag-request ng password reset code kapag nakalimutan ng user ang kanilang password.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Siguraduhing may nakarehistrong account para sa binigay na email address
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    const user = mapUserFromDB(rows[0]);

    // Gumawa ng random 6-digit code at magtakda ng 10 minutes expiration duration
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes mula ngayon

    // I-store muna sa memory (resetCodes map) para ma-validate mamaya pag nilagay na ng user sa form
    resetCodes.set(email.trim().toLowerCase(), { code, expires });

    const subject = 'Password Recovery | Batanes State College CareerPath';
    const body = `Hello ${user.name},\n\nYour temporary password verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nRespectfully,\nOffice of Tracer Programs & Administrative Analytics\nBatanes State College`;

    let emailStatusDetail = `Verification code generated for ${user.name}`;

    // Ipadala ang verification code sa email ng user kung configured ang nodemailer transporter
    if (transporter && user.email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"BSC CareerPath" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: subject,
          text: body
        });
        emailStatusDetail = `Reset code emailed to ${user.name} (${user.email})`;
      } catch (mailErr) {
        emailStatusDetail = `Failed to email reset code to ${user.name}: ${mailErr.message}`;
        console.error(`[Forgot Pass Mail Error]`, mailErr);
      }
    } else {
      // Fallback kung offline/testing at walang active mail settings, i-log na lang sa console
      console.log(`[Forgot Pass Code Log] Reset code for ${user.name} (${email}): ${code}`);
    }

    // Mag-save rin ng abiso sa notifications table ng database
    const notifyId = `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO notifications (id, title, text, date, \`read\`) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
      [notifyId, subject, `Verification code: ${code}. Sent to ${user.name} (${email}).`]
    );

    // I-audit ang recovery request na ito sa activity logs para sa trace history ng admin
    const logId = `log-${Date.now()}`;
    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [logId, new Date().toISOString().slice(0, 19).replace('T', ' '), user.id, user.email, user.name, user.role, 'Requested Password Recovery', 'Security / Authentication', `Reset code generated: ${code} for ${email}`]
    );

    res.json({ success: true, message: 'Verification code sent successfully.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/reset-password
 * Dito pina-process ang bagong password matapos ma-verify ang nilagay na 6-digit recovery code.
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Kunin ang in-memory reset validation record para sa email na ito
    const record = resetCodes.get(email.trim().toLowerCase());
    if (!record) {
      return res.status(400).json({ error: 'No verification code request found for this email' });
    }

    // I-check kung tama ang nilagay na verification code ng user
    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // I-check kung lumagpas na sa 10 minutes expiration threshold
    if (Date.now() > record.expires) {
      resetCodes.delete(email.trim().toLowerCase());
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = mapUserFromDB(rows[0]);

    // I-encrypt ang bagong password gamit ang bcrypt bago i-save sa db
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ?, is_initial_password_needed = 0 WHERE id = ?', [hashedPassword, user.id]);

    // Burahin na sa memory ang reset code dahil matagumpay na itong nagamit
    resetCodes.delete(email.trim().toLowerCase());

    // I-log ang matagumpay na pag-reset ng password sa activity logs
    const logId = `log-${Date.now()}`;
    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [logId, new Date().toISOString().slice(0, 19).replace('T', ' '), user.id, user.email, user.name, user.role, 'Reset Password via Recovery', 'Security / Authentication', `Password successfully reset for account ${user.name}`]
    );

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/change-password
 * Endpoint para sa unang beses na pag-login ng bagong rehistrong user para palitan ang default password.
 */
router.post('/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(user_id) = ?', [userId.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = mapUserFromDB(rows[0]);

    // I-hash at palitan ang password sa database, at i-set ang is_initial_password_needed sa 0 (ibig sabihin pinalitan na ang default)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ?, is_initial_password_needed = 0 WHERE id = ?', [hashedPassword, user.id]);

    // I-log ang security event na ito
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: 'Changed Initial Password',
      module: 'Security / Authentication',
      details: `User successfully replaced credentials to private password, unlocking portal access.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    // Kuhanin ang pinakabagong updated data mula sa DB at gumawa ng bagong JWT token session
    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
    const updatedUser = mapUserFromDB(updatedRows[0]);
    const token = jwt.sign(
      { id: updatedUser.id, userId: updatedUser.userId, role: updatedUser.role, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token, user: updatedUser });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/delete-user
 * Endpoint para burahin ang isang user sa system. Super Admin lamang ang may pahintulot na gawin ito.
 */
router.post('/delete-user', authenticateToken, async (req, res) => {
  try {
    const { userId, activeUserId } = req.body;

    // Kunin ang kasalukuyang nag-aaksyong user at siguraduhing may dynamic role checks
    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    // Pag hindi Super Admin, harangan ang access (403 Forbidden)
    if (!activeUser || activeUser.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Permission denied: Only Super Administrators can delete system users.' });
    }

    // Hindi pwedeng burahin ng Super Admin ang kanyang sariling account habang naka-login
    if (userId === activeUser.id) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    // Burahin ang user sa db. Dahil may CASCADE delete relation sa schema, mabubura rin ang foreign profiles.
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUser.id,
      userEmail: activeUser.email,
      userName: activeUser.name,
      userRole: activeUser.role,
      action: 'Deleted System User',
      module: 'User Management / Settings',
      details: `Deleted user account: ID '${userId}'`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    // Ibalik ang bagong listahan ng users pagkatapos ng deletion
    const [usersRows] = await pool.query('SELECT * FROM users');
    res.json({ success: true, users: usersRows.map(mapUserFromDB) });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/update-username
 * Endpoint para sa pagpapalit ng login user_id ng kasalukuyang user. May limitasyon na isang beses lang kada 30 days.
 */
router.post('/update-username', authenticateToken, async (req, res) => {
  try {
    const { newUsername, activeUserId } = req.body;

    if (!newUsername || !newUsername.trim()) {
      return res.status(400).json({ error: 'Username cannot be empty.' });
    }

    const trimmedUsername = newUsername.trim();

    // I-verify kung may ganitong active user account sa database
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = mapUserFromDB(userRows[0]);

    // Siguraduhing iba talaga ang bagong ilalagay na username kumpara sa kasalukuyang gamit
    if (user.userId.toLowerCase() === trimmedUsername.toLowerCase()) {
      return res.status(400).json({ error: 'New username must be different from current username.' });
    }

    // Siguraduhing wala pang gumagamit ng bagong username na ito sa ibang account sa system
    const [existingRows] = await pool.query('SELECT id FROM users WHERE LOWER(user_id) = ? AND id != ?', [trimmedUsername.toLowerCase(), activeUserId]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // I-check ang minimum 30 days once-a-month constraint gamit ang last_username_change timestamp
    if (user.lastUsernameChange) {
      const lastChange = new Date(user.lastUsernameChange);
      const now = new Date();
      const timeDiff = now.getTime() - lastChange.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      if (daysDiff < 30) {
        const daysRemaining = Math.ceil(30 - daysDiff);
        return res.status(400).json({
          error: `You can only change your username once a month. Please wait ${daysRemaining} day(s) before trying again.`
        });
      }
    }

    // I-save ang bagong username at i-update ang timestamp sa DB
    await pool.query(
      'UPDATE users SET user_id = ?, last_username_change = CURRENT_TIMESTAMP WHERE id = ?',
      [trimmedUsername, activeUserId]
    );

    // Itala ang username change sa activity logs
    const logId = `log-${Date.now()}`;
    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        logId,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        user.id,
        user.email,
        user.name,
        user.role,
        'Changed Username',
        'Account Settings',
        `User changed username from '${user.userId}' to '${trimmedUsername}'`
      ]
    );

    // Kunin ulit ang pinakabagong updated data para mag-generate ng bagong JWT token
    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
    const updatedUser = mapUserFromDB(updatedRows[0]);

    // Dahil nagbago ang user_id, kailangang gawan ng bagong token ang user session
    const token = jwt.sign(
      { id: updatedUser.id, userId: updatedUser.userId, role: updatedUser.role, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Username updated successfully!',
      user: updatedUser,
      token
    });
  } catch (err) {
    console.error('Update username error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
