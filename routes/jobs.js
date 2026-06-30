/**
 * @file jobs.js
 * @description Router para sa pag-save at pag-update ng mga bakanteng trabaho.
 */

import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapJobPostingFromDB } from '../mappers.js';

const router = express.Router();

/**
 * POST /api/save-job
 */
router.post('/save-job', authenticateToken, async (req, res) => {
  try {
    const { job, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const jobId = job.id || `job-${Date.now()}`;
    const [existing] = await pool.query('SELECT id FROM job_postings WHERE id = ?', [jobId]);
    const reqsStr = JSON.stringify(job.requirements || []);
    const deadline = job.deadline ? job.deadline : null;

    if (existing.length > 0) {
      await pool.query(
        `UPDATE job_postings SET 
          job_title = ?, employer_name = ?, description = ?, requirements = ?, 
          employment_type = ?, salary_range = ?, location = ?, slots = ?, 
          deadline = ?, status = ?
         WHERE id = ?`,
        [
          job.jobTitle, job.employerName, job.description, reqsStr,
          job.employmentType, job.salaryRange, job.location, job.slots || 1,
          deadline, job.status, jobId
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO job_postings (
          id, job_title, employer_name, description, requirements, 
          employment_type, salary_range, location, slots, deadline, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId, job.jobTitle, job.employerName, job.description, reqsStr,
          job.employmentType, job.salaryRange, job.location, job.slots || 1,
          deadline, job.status || 'Open'
        ]
      );
    }

    // I-update ang bilang ng mga bakanteng posisyon para sa reference list ng mga employer
    const [openJobs] = await pool.query('SELECT id FROM job_postings WHERE employer_name = ? AND status = "Open"', [job.employerName]);
    await pool.query('UPDATE employers SET vacancies_count = ? WHERE company_name = ?', [openJobs.length, job.employerName]);

    // I-log ang paggawa ng job posting
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUserId || 'system',
      userEmail: activeUser?.email || 'employer@bsc.edu.ph',
      userName: activeUser?.name || 'Partner Company Contact',
      userRole: activeUser?.role || 'Employer',
      action: 'Posted Vacant Position Job Alert',
      module: 'Employer Management / Job Postings',
      details: `Position '${job.jobTitle}' listed for Batanes State College graduates.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [jobRows] = await pool.query('SELECT * FROM job_postings ORDER BY created_at DESC');
    res.json({ success: true, jobPostings: jobRows.map(mapJobPostingFromDB) });
  } catch (err) {
    console.error('Save job error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
