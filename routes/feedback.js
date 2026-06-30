/**
 * @file feedback.js
 * @description Router para sa pagsusumite ng curriculum/system feedback mula sa stakeholders.
 */

import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapFeedbackFromDB } from '../mappers.js';

const router = express.Router();

/**
 * POST /api/submit-feedback
 */
router.post('/submit-feedback', authenticateToken, async (req, res) => {
  try {
    const { feedback, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const isLogEvent = feedback.message && feedback.message.startsWith('[LOG EVENT]');

    if (isLogEvent) {
      // It's a system log activity. Save ONLY to activity_logs table.
      const logId = `log-${Date.now()}`;
      const msg = feedback.message;
      const detailsMatch = msg.match(/^\[LOG EVENT\] (.*) \(Module: (.*)\)$/);
      const details = detailsMatch ? detailsMatch[1] : msg;
      const module = detailsMatch ? detailsMatch[2] : 'System';

      await pool.query(
        'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          logId,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          activeUserId || 'system',
          activeUser?.email || 'admin@bsc.edu.ph',
          activeUser?.name || feedback.submittedBy || 'System',
          activeUser?.role || 'Administrator',
          feedback.subject || 'System Action',
          module,
          details
        ]
      );
    } else {
      // It's actual feedback. Save to feedbacks table AND log it.
      const fbId = `fb-${Date.now()}`;
      await pool.query(
        `INSERT INTO feedbacks (id, subject, category, message, rating, submitted_by, alumni_student_id, alumni_name, company_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fbId, 
          feedback.subject, 
          feedback.category || 'Others', 
          feedback.message, 
          feedback.rating || 5, 
          feedback.submittedBy,
          feedback.alumniStudentId || null,
          feedback.alumniName || null,
          feedback.companyName || null
        ]
      );

      // I-log ang quality review feedback ng user
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        userId: activeUserId || 'guest',
        userEmail: activeUser?.email || 'guest@example.com',
        userName: activeUser?.name || feedback.submittedBy,
        userRole: activeUser?.role || 'Alumni',
        action: 'Submitted Quality Feedback Study',
        module: 'Feedback Module',
        details: `Submitted rating of ${feedback.rating}/5 for topic: '${feedback.subject}'.`
      };

      await pool.query(
        'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
      );
    }

    const [feedbackRows] = await pool.query('SELECT * FROM feedbacks ORDER BY submitted_at DESC');
    res.json({ success: true, feedbacks: feedbackRows.map(mapFeedbackFromDB) });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
