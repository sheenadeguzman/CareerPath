/**
 * @file auth.js
 * @description Authentication router para sa login, password recovery, at password change.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { mapUserFromDB } from '../mappers.js';
import { transporter } from './mailer.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bsc_careerpath_super_secret_key';

// In-memory record ng password reset codes
const resetCodes = new Map();

/**
 * POST /api/login
 */
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(user_id) = ?', [userId.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const user = mapUserFromDB(rows[0]);

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {}

    if (isMatch || password === user.password) {
      const token = jwt.sign(
        { id: user.id, userId: user.userId, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
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

    res.status(401).json({ error: 'Incorrect Password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account registered with this email address' });
    }

    const user = mapUserFromDB(rows[0]);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetCodes.set(email.trim().toLowerCase(), { code, expires });

    const subject = 'Password Recovery | Batanes State College CareerPath';
    const body = `Hello ${user.name},\n\nYour temporary password verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nRespectfully,\nOffice of Tracer Programs & Administrative Analytics\nBatanes State College`;

    let emailStatusDetail = `Verification code generated for ${user.name}`;
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
      console.log(`[Forgot Pass Code Log] Reset code for ${user.name} (${email}): ${code}`);
    }

    // Save sa notifications table
    const notifyId = `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await pool.query(
      `INSERT INTO notifications (id, title, text, date, \`read\`) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
       [notifyId, subject, `Verification code: ${code}. Sent to ${user.name} (${email}).`]
    );

    // I-audit ang recovery request log
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
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const record = resetCodes.get(email.trim().toLowerCase());
    if (!record) {
      return res.status(400).json({ error: 'No verification code request found for this email' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (Date.now() > record.expires) {
      resetCodes.delete(email.trim().toLowerCase());
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = mapUserFromDB(rows[0]);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ?, is_initial_password_needed = 0 WHERE id = ?', [hashedPassword, user.id]);

    resetCodes.delete(email.trim().toLowerCase());

    // I-log ang recovery confirmation
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
 */
router.post('/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(user_id) = ?', [userId.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = mapUserFromDB(rows[0]);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ?, is_initial_password_needed = 0 WHERE id = ?', [hashedPassword, user.id]);

    // I-log ang pag-unlock ng initial credentials
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

export default router;
