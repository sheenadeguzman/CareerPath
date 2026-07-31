/**
 * @file jobs.js
 * @description Router para sa pag-save, pag-update, at pag-track ng mga bakanteng trabaho (Job Postings) para sa mga alumni.
 */

import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapJobPostingFromDB } from '../mappers.js';

const router = express.Router();

/**
 * POST /api/save-job
 * Endpoint para mag-save o mag-update ng isang job posting.
 * Awtomatiko nitong kinakalkula ang bilang ng mga aktibong bakanteng trabaho ng employer sa employers table.
 */
router.post('/save-job', authenticateToken, async (req, res) => {
  try {
    const { job, activeUserId } = req.body;

    // Kunin ang data ng active user para sa pag-audit ng action logs
    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const jobId = job.id || `job-${Date.now()}`;
    
    // I-verify kung may ganito nang trabaho sa db gamit ang job ID
    const [existing] = await pool.query('SELECT id FROM job_postings WHERE id = ?', [jobId]);
    
    // I-serialize ang requirements array para maging JSON string
    const reqsStr = JSON.stringify(job.requirements || []);
    const deadline = job.deadline ? job.deadline : null;

    if (existing.length > 0) {
      // Mag-execute ng UPDATE query kapag ine-edit ang trabaho
      await pool.query(
        `UPDATE job_postings SET 
          job_title = ?, employer_name = ?, description = ?, requirements = ?, 
          employment_type = ?, salary_range = ?, location = ?, slots = ?, 
          deadline = ?, status = ?, contact_person = ?, contact_email = ?,
          contact_phone = ?, contact_website = ?
         WHERE id = ?`,
        [
          job.jobTitle, job.employerName, job.description, reqsStr,
          job.employmentType, job.salaryRange, job.location, job.slots || 1,
          deadline, job.status, job.contactPerson || null, job.contactEmail || null,
          job.contactPhone || null, job.contactWebsite || null, jobId
        ]
      );
    } else {
      // Mag-execute ng INSERT query para sa bagong lagay na trabaho
      await pool.query(
        `INSERT INTO job_postings (
          id, job_title, employer_name, description, requirements, 
          employment_type, salary_range, location, slots, deadline, status,
          contact_person, contact_email, contact_phone, contact_website
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          jobId, job.jobTitle, job.employerName, job.description, reqsStr,
          job.employmentType, job.salaryRange, job.location, job.slots || 1,
          deadline, job.status || 'Open', job.contactPerson || null, job.contactEmail || null,
          job.contactPhone || null, job.contactWebsite || null
        ]
      );
    }

    // Awtomatikong kalkulahin ang natitirang open jobs ng company at i-sync sa vacancies_count ng employers table
    const [openJobs] = await pool.query('SELECT id FROM job_postings WHERE employer_name = ? AND status = "Open"', [job.employerName]);
    await pool.query('UPDATE employers SET vacancies_count = ? WHERE company_name = ?', [openJobs.length, job.employerName]);

    // Gumawa at i-save ang activity audit log
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

    // Ibalik ang kumpletong bagong listahan ng jobs sa client
    const [jobRows] = await pool.query('SELECT * FROM job_postings ORDER BY created_at DESC');
    res.json({ success: true, jobPostings: jobRows.map(mapJobPostingFromDB) });
  } catch (err) {
    console.error('Save job error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
