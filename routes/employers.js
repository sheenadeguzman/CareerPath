/**
 * @file employers.js
 * @description Router para sa pag-save at pag-verify ng partner employers.
 */

import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapEmployerFromDB } from '../mappers.js';

const router = express.Router();

/**
 * POST /api/save-employer
 */
router.post('/save-employer', authenticateToken, async (req, res) => {
  try {
    const { employer, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const empId = employer.id || `employer-${Date.now()}`;
    const [existing] = await pool.query('SELECT id FROM employers WHERE id = ?', [empId]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE employers SET 
          company_name = ?, industry = ?, address = ?, email = ?, phone = ?, 
          contact_person = ?, position = ?, company_size = ?, website = ?, 
          is_verified = ?, vacancies_count = ?
         WHERE id = ?`,
        [
          employer.companyName, employer.industry, employer.address, employer.email, employer.phone,
          employer.contactPerson, employer.position, employer.companySize, employer.website || null,
          employer.isVerified ? 1 : 0, employer.vacanciesCount || 0, empId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO employers (
          id, company_name, industry, address, email, phone, 
          contact_person, position, company_size, website, is_verified, vacancies_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          empId, employer.companyName, employer.industry, employer.address, employer.email, employer.phone,
          employer.contactPerson, employer.position, employer.companySize, employer.website || null,
          employer.isVerified ? 1 : 0, employer.vacanciesCount || 0
        ]
      );
    }

    // Magdagdag ng notification para sa audit ng verification
    const notifyId = `notify-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const statusText = employer.isVerified ? 'VERIFIED' : 'UNVERIFIED / PENDING';
    const notificationTitle = `Employer Verification Updated`;
    const notificationContent = `Partner Employer '${employer.companyName}' has been marked as ${statusText} by Administrator ${activeUser?.name || 'System'}.`;
    
    await pool.query(
      `INSERT INTO notifications (id, title, text, date, \`read\`) 
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
      [notifyId, notificationTitle, notificationContent]
    );

    // Mga detalye para sa audit log
    const isUpdate = existing.length > 0;
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUserId || 'system',
      userEmail: activeUser?.email || 'admin@bsc.edu.ph',
      userName: activeUser?.name || 'Administrator',
      userRole: activeUser?.role || 'Administrator',
      action: isUpdate ? 'Updated Employer details' : 'Added New Partner Company',
      module: 'Employer Management',
      details: `Employer '${employer.companyName}' status updated successfully.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [employersRows] = await pool.query('SELECT * FROM employers');
    res.json({ success: true, employers: employersRows.map(mapEmployerFromDB) });
  } catch (err) {
    console.error('Save employer error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
