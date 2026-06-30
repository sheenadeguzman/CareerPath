/**
 * @file alumni.js
 * @description Router para sa pag-sync ng database collections, save/delete/import ng alumni profiles.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import {
  mapUserFromDB,
  mapAlumniFromDB,
  mapEmployerFromDB,
  mapJobPostingFromDB,
  mapSurveyFromDB,
  mapFeedbackFromDB,
  mapLogFromDB,
  mapNotificationFromDB,
  mapSurveyResponseFromDB
} from '../mappers.js';

const router = express.Router();

/**
 * GET /api/data
 * Nagbabalik ng kumpletong sync ng lahat ng collections mula sa MySQL database.
 */
router.get('/data', async (req, res) => {
  try {
    const [usersRows] = await pool.query('SELECT * FROM users');
    const [alumniRows] = await pool.query(`
      SELECT ap.*, u.is_initial_password_needed, u.avatar as avatar 
      FROM alumni_profiles ap 
      LEFT JOIN users u ON ap.student_id = u.id 
      ORDER BY ap.last_updated DESC
    `);
    const [employersRows] = await pool.query('SELECT * FROM employers');
    const [jobRows] = await pool.query('SELECT * FROM job_postings ORDER BY created_at DESC');
    const [surveyRows] = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    const [feedbackRows] = await pool.query('SELECT * FROM feedbacks ORDER BY submitted_at DESC');
    const [logRows] = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
    const [notificationRows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
    const [responseRows] = await pool.query('SELECT * FROM survey_responses ORDER BY submitted_at DESC');

    res.json({
      users: usersRows.map(mapUserFromDB),
      alumni: alumniRows.map(mapAlumniFromDB),
      employers: employersRows.map(mapEmployerFromDB),
      jobPostings: jobRows.map(mapJobPostingFromDB),
      surveys: surveyRows.map(mapSurveyFromDB),
      feedbacks: feedbackRows.map(mapFeedbackFromDB),
      logs: logRows.map(mapLogFromDB),
      notifications: notificationRows.map(mapNotificationFromDB),
      surveyResponses: responseRows.map(mapSurveyResponseFromDB)
    });
  } catch (err) {
    console.error('Error fetching data from MySQL:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * POST /api/save-alumni
 */
router.post('/save-alumni', authenticateToken, async (req, res) => {
  try {
    const { profile, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const [existing] = await pool.query('SELECT student_id FROM alumni_profiles WHERE student_id = ?', [profile.studentId]);
    const skillsStr = JSON.stringify(profile.skills || []);
    const historyStr = JSON.stringify(profile.careerHistory || []);
    const dob = profile.dateOfBirth ? profile.dateOfBirth : null;
    const usefulSkillsStr = JSON.stringify(profile.usefulSkills || []);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE alumni_profiles SET 
          first_name = ?, middle_name = ?, last_name = ?, suffix = ?, email = ?, phone = ?, gender = ?, civil_status = ?, 
          date_of_birth = ?, address = ?, program = ?, year_enrolled = ?, year_graduated = ?, honors = ?, 
          professional_exam_passed = ?, is_board_passer = ?, licensure_exam_date = ?, license_no = ?,
          alumni_association_status = ?, employment_status = ?, job_title = ?, job_description = ?, 
          employer_name = ?, employment_type = ?, sector = ?, monthly_income = ?, job_industry = ?,
          job_related_to_course = ?, first_job_related_to_course = ?, time_to_first_job = ?, skills = ?, profile_completeness = ?, 
          location_region = ?, career_history = ?,
          reasons_pursuing_program = ?, find_first_job = ?, reasons_accepting_job = ?,
          useful_skills = ?, reasons_unemployment = ?,
          last_updated = CURRENT_TIMESTAMP
         WHERE student_id = ?`,
        [
          profile.firstName, profile.middleName || null, profile.lastName, profile.suffix || null, profile.email, profile.phone || null, profile.gender, profile.civilStatus,
          dob, profile.address || null, profile.program, profile.yearEnrolled || null, profile.yearGraduated, profile.honors || 'None',
          profile.professionalExamPassed || 'None', profile.isBoardPasser || 'N/A', profile.licensureExamDate || null, profile.licenseNo || null,
          profile.alumniAssociationStatus || 'Non-Member', profile.employmentStatus, profile.jobTitle || '', profile.jobDescription || null,
          profile.employerName || '', profile.employmentType || '', profile.sector || 'N/A', profile.monthlyIncome || '', profile.jobIndustry || null,
          profile.jobRelatedToCourse || 'No', profile.firstJobRelatedToCourse || 'No', profile.timeToFirstJob || '', skillsStr, profile.profileCompleteness || 0,
          profile.locationRegion || 'Local (Batanes)', historyStr,
          profile.reasonsPursuingProgram || null, profile.findFirstJob || null, profile.reasonsAcceptingJob || null,
          usefulSkillsStr, profile.reasonsUnemployment || null,
          profile.studentId
        ]
      );
      // I-sync ang avatar at name sa users table
      await pool.query(
        'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
        [
          [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' '),
          profile.email,
          profile.avatar || null,
          profile.studentId
        ]
      );
    } else {
      const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [profile.studentId]);
      if (userCheck.length === 0) {
        const hashedPassword = await bcrypt.hash(profile.studentId, 10);
        await pool.query(
          `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profile.studentId, 
            profile.studentId, 
            hashedPassword, 
            [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' '), 
            profile.email, 
            'Alumni', 
            1, 
            profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
          ]
        );
      } else {
        await pool.query(
          'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
          [
            [profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' '),
            profile.email,
            profile.avatar || null,
            profile.studentId
          ]
        );
      }

      await pool.query(
        `INSERT INTO alumni_profiles (
          student_id, first_name, middle_name, last_name, suffix, email, phone, gender, civil_status, 
          date_of_birth, address, program, year_enrolled, year_graduated, honors, 
          professional_exam_passed, is_board_passer, licensure_exam_date, license_no,
          alumni_association_status, employment_status, job_title, job_description, 
          employer_name, employment_type, sector, monthly_income, job_industry,
          job_related_to_course, first_job_related_to_course, time_to_first_job, skills, profile_completeness,
          location_region, career_history,
          reasons_pursuing_program, find_first_job, reasons_accepting_job,
          useful_skills, reasons_unemployment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.studentId, profile.firstName, profile.middleName || null, profile.lastName, profile.suffix || null, profile.email, profile.phone || null, profile.gender, profile.civilStatus,
          dob, profile.address || null, profile.program, profile.yearEnrolled || null, profile.yearGraduated, profile.honors || 'None',
          profile.professionalExamPassed || 'None', profile.isBoardPasser || 'N/A', profile.licensureExamDate || null, profile.licenseNo || null,
          profile.alumniAssociationStatus || 'Non-Member', profile.employmentStatus, profile.jobTitle || '', profile.jobDescription || null,
          profile.employerName || '', profile.employmentType || '', profile.sector || 'N/A', profile.monthlyIncome || '', profile.jobIndustry || null,
          profile.jobRelatedToCourse || 'No', profile.firstJobRelatedToCourse || 'No', profile.timeToFirstJob || '', skillsStr, profile.profileCompleteness || 0,
          profile.locationRegion || 'Local (Batanes)', historyStr,
          profile.reasonsPursuingProgram || null, profile.findFirstJob || null, profile.reasonsAcceptingJob || null,
          usefulSkillsStr, profile.reasonsUnemployment || null
        ]
      );
    }

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUserId || 'system',
      userEmail: activeUser?.email || 'alumni@bsc.edu.ph',
      userName: activeUser?.name || `${profile.firstName} ${profile.lastName}`,
      userRole: activeUser?.role || 'Alumni',
      action: 'Updated Alumni Credentials / Employment Tracker',
      module: 'Alumni Profiling / Employment Tracking',
      details: `Profile of '${profile.firstName} ${profile.lastName}' (${profile.studentId}) updated with status: ${profile.employmentStatus}.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [alumniRows] = await pool.query(`
      SELECT ap.*, u.is_initial_password_needed, u.avatar as avatar 
      FROM alumni_profiles ap 
      LEFT JOIN users u ON ap.student_id = u.id 
      ORDER BY ap.last_updated DESC
    `);
    res.json({ success: true, alumni: alumniRows.map(mapAlumniFromDB) });
  } catch (err) {
    console.error('Save alumni error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/delete-alumni
 */
router.post('/delete-alumni', authenticateToken, async (req, res) => {
  try {
    const { studentId, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    if (!activeUser || (activeUser.role !== 'Administrator' && activeUser.role !== 'Department Chairperson')) {
      return res.status(403).json({ error: 'Permission denied: Only Administrators and Department Chairpersons can delete profiles.' });
    }

    const [alumniRows] = await pool.query('SELECT * FROM alumni_profiles WHERE student_id = ?', [studentId]);
    if (alumniRows.length === 0) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }
    const alumnus = mapAlumniFromDB(alumniRows[0]);

    await pool.query('DELETE FROM users WHERE id = ?', [studentId]);

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUser.id,
      userEmail: activeUser.email,
      userName: activeUser.name,
      userRole: activeUser.role,
      action: 'Deleted Alumni Profile',
      module: 'Alumni Management',
      details: `Deleted alumnus: '${alumnus.name}' (ID: ${studentId})`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [updatedAlumniRows] = await pool.query(`
      SELECT ap.*, u.is_initial_password_needed, u.avatar as avatar 
      FROM alumni_profiles ap 
      LEFT JOIN users u ON ap.student_id = u.id 
      ORDER BY ap.last_updated DESC
    `);
    const [usersRows] = await pool.query('SELECT * FROM users');

    res.json({
      success: true,
      alumni: updatedAlumniRows.map(mapAlumniFromDB),
      users: usersRows.map(mapUserFromDB)
    });
  } catch (err) {
    console.error('Delete alumni error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/import-alumni
 */
router.post('/import-alumni', authenticateToken, async (req, res) => {
  try {
    const { rows, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    let countImported = 0;
    for (const row of rows) {
      const studentId = row.studentId || `BSC-2026-${Math.floor(100 + Math.random() * 900)}`;
      const name = row.name || `${row.firstName || 'First'} ${row.lastName || 'Last'}`;
      const email = row.email || `${studentId.toLowerCase()}@example.com`;
      const program = row.program || 'BS Information Technology';
      const yearGraduated = parseInt(row.yearGraduated) || 2026;

      const [existing] = await pool.query('SELECT id FROM users WHERE id = ? OR user_id = ?', [studentId, studentId]);
      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash('bsc123', 10);
        await pool.query(
          `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, studentId, hashedPassword, name, email, 'Alumni', 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120']
        );

        const skillsArr = row.skills ? (typeof row.skills === 'string' ? row.skills.split(', ').filter(Boolean) : row.skills) : [];
        const skillsStr = JSON.stringify(skillsArr);

        await pool.query(
          `INSERT INTO alumni_profiles (
            student_id, first_name, last_name, email, phone, gender, civil_status, 
            date_of_birth, address, program, year_graduated, honors, 
            professional_exam_passed, employment_status, job_title, job_description, 
            employer_name, employment_type, sector, monthly_income, 
            job_related_to_course, time_to_first_job, skills, profile_completeness,
            location_region, career_history
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            studentId, row.firstName || name.split(' ')[0], row.lastName || name.split(' ').slice(1).join(' '),
            email, row.phone || '', row.gender || 'Male', row.civilStatus || 'Single',
            row.dateOfBirth ? row.dateOfBirth : null, row.address || 'Basco, Batanes', program, yearGraduated,
            row.honors || 'None', row.professionalExamPassed || 'None', row.employmentStatus || 'Unemployed',
            row.jobTitle || '', row.jobDescription || '', row.employerName || '', row.employmentType || '',
            row.sector || 'N/A', row.monthlyIncome || '', row.jobRelatedToCourse || 'No', row.timeToFirstJob || '',
            skillsStr, 40,
            row.locationRegion || 'Local (Batanes)', JSON.stringify(row.careerHistory || [])
          ]
        );

        countImported++;
      }
    }

    if (countImported > 0) {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        userId: activeUserId || 'system',
        userEmail: activeUser?.email || 'admin@bsc.edu.ph',
        userName: activeUser?.name || 'Administrator',
        userRole: activeUser?.role || 'Administrator',
        action: 'Imported Alumni Records via Upload',
        module: 'Import/Export',
        details: `Bulk imported ${countImported} alumni registers. Initial accounts matching credentials active.`
      };

      await pool.query(
        'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
      );
    }

    const [usersRows] = await pool.query('SELECT * FROM users');
    const [alumniRows] = await pool.query(`
      SELECT ap.*, u.is_initial_password_needed, u.avatar as avatar 
      FROM alumni_profiles ap 
      LEFT JOIN users u ON ap.student_id = u.id 
      ORDER BY ap.last_updated DESC
    `);

    res.json({ success: true, users: usersRows.map(mapUserFromDB), alumni: alumniRows.map(mapAlumniFromDB) });
  } catch (err) {
    console.error('Import alumni error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
