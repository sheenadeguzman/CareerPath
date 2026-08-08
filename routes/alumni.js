/**
 * @file alumni.js
 * @description Router para sa pag-sync ng database collections, pati na rin ang pag-save, pag-delete, at bulk import ng alumni profiles.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, encrypt } from '../db.js';
import { authenticateToken } from './middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bsc_careerpath_super_secret_key';
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
 * Ito ang ginagamit ng frontend app pagka-login para makuha agad ang buong state ng dashboard.
 */
router.get('/data', async (req, res) => {
  try {
    // Kuhanin ang bawat table isa-isa mula sa MySQL
    const [usersRows] = await pool.query('SELECT * FROM users');
    
    // I-query ang alumni profiles na may kasamang is_initial_password_needed at avatar galing sa users table
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
    // Parse JWT to filter notifications per user
    let notificationRows = [];
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let decodedUser = null;
    if (token) {
      try {
        decodedUser = jwt.verify(token, JWT_SECRET);
      } catch (err) {}
    }

    if (decodedUser) {
      if (decodedUser.role === 'Administrator' || decodedUser.role === 'Super Admin') {
        const [rows] = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
        notificationRows = rows;
      } else {
        const [rows] = await pool.query(
          'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY date DESC',
          [decodedUser.id]
        );
        notificationRows = rows;
      }
    } else {
      const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id IS NULL ORDER BY date DESC');
      notificationRows = rows;
    }

    const [responseRows] = await pool.query('SELECT * FROM survey_responses ORDER BY submitted_at DESC');

    // I-return ang lahat ng data pagkatapos i-map gamit ang helper functions para maging camelCase ang keys
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
 * Endpoint para sa pag-save o pag-update ng profile details ng isang alumni.
 */
router.post('/save-alumni', authenticateToken, async (req, res) => {
  try {
    const { profile, activeUserId } = req.body;

    // Kuhanin ang active user details para sa logging audit trail
    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    // I-check muna kung may existing profile na para sa student ID na ito
    const [existing] = await pool.query('SELECT * FROM alumni_profiles WHERE student_id = ?', [profile.studentId]);
    let careerHistory = profile.careerHistory || [];

    // Kung mayroon nang existing profile, titingnan natin kung nagbago ang kanilang trabaho.
    // Kapag nagbago (halimbawa, naging Unemployed o lumipat ng kumpanya), ia-archive natin ang lumang trabaho sa history list.
    if (existing.length > 0) {
      const oldProfile = existing[0];
      const oldJobExists = oldProfile.employer_name && oldProfile.job_title;
      const hasJobChanged = oldJobExists && (
        profile.employmentStatus === 'Unemployed' ||
        (profile.employerName && profile.jobTitle && (profile.employerName !== oldProfile.employer_name || profile.jobTitle !== oldProfile.job_title))
      );

      if (hasJobChanged) {
        // Siguraduhing hindi duplicate sa listahan ng archives ang dating kumpanya at posisyon
        const alreadyExists = careerHistory.some(
          h => h.company && h.company.toLowerCase() === oldProfile.employer_name.toLowerCase() &&
               h.title && h.title.toLowerCase() === oldProfile.job_title.toLowerCase()
        );

        if (!alreadyExists) {
          const startYear = oldProfile.job_start_year || oldProfile.year_graduated || '';
          const currentYear = new Date().getFullYear();
          const yearsStr = startYear ? `${startYear} - ${currentYear}` : `${currentYear}`;
          
          careerHistory = [
            ...careerHistory,
            {
              title: oldProfile.job_title,
              company: oldProfile.employer_name,
              years: yearsStr
            }
          ];
        }
      }
    }

    // I-serialize ang array objects (skills, career history, at education history) para maging JSON string sa database
    const skillsStr = JSON.stringify(profile.skills || []);
    const historyStr = JSON.stringify(careerHistory);
    const dob = profile.dateOfBirth ? profile.dateOfBirth : null;
    const usefulSkillsStr = JSON.stringify(profile.usefulSkills || []);
    const educationStr = JSON.stringify(profile.educationHistory || []);

    if (existing.length > 0) {
      // Mag-execute ng UPDATE query kung may profile na
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
          useful_skills = ?, reasons_unemployment = ?, job_start_year = ?, education_history = ?,
          about_me = ?, languages = ?,
          last_updated = CURRENT_TIMESTAMP
         WHERE student_id = ?`,
        [
          encrypt(profile.firstName), encrypt(profile.middleName || null), encrypt(profile.lastName), profile.suffix || null, profile.email, profile.phone || null, profile.gender, profile.civilStatus,
          dob, profile.address || null, profile.program, profile.yearEnrolled || null, profile.yearGraduated, profile.honors || 'None',
          profile.professionalExamPassed || 'None', profile.isBoardPasser || 'N/A', profile.licensureExamDate || null, profile.licenseNo || null,
          profile.alumniAssociationStatus || 'Non-Member', profile.employmentStatus, profile.jobTitle || '', profile.jobDescription || null,
          profile.employerName || '', profile.employmentType || '', profile.sector || 'N/A', profile.monthlyIncome || '', profile.jobIndustry || null,
          profile.jobRelatedToCourse || 'No', profile.firstJobRelatedToCourse || 'No', profile.timeToFirstJob || '', skillsStr, profile.profileCompleteness || 0,
          profile.locationRegion || 'Local (Batanes)', historyStr,
          profile.reasonsPursuingProgram || null, profile.findFirstJob || null, profile.reasonsAcceptingJob || null,
          usefulSkillsStr, profile.reasonsUnemployment || null, profile.jobStartYear || null, educationStr,
          profile.aboutMe || null, profile.languages || null,
          profile.studentId
        ]
      );
      
      // I-sync din ang pangalan, email, at avatar ng alumni sa user credentials (users table)
      await pool.query(
        'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
        [
          encrypt([profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ')),
          profile.email,
          profile.avatar || null,
          profile.studentId
        ]
      );
    } else {
      // Kung walang existing profile, ibig sabihin bago ito.
      // 1. I-check muna kung may user na para sa student_id na ito. Kung wala, gagawan natin ito ng user login profile
      const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ?', [profile.studentId]);
      if (userCheck.length === 0) {
        // Ang password by default ay ang kanilang student_id (na naka-encrypt gamit ang bcrypt)
        const hashedPassword = await bcrypt.hash(profile.studentId, 10);
        await pool.query(
          `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            profile.studentId, 
            profile.studentId, 
            hashedPassword, 
            encrypt([profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ')), 
            profile.email, 
            'Alumni', 
            1, 
            profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
          ]
        );
      } else {
        // Kung may user na pero walang profile, i-sync lang natin ang name, email, at avatar
        await pool.query(
          'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
          [
            encrypt([profile.firstName, profile.middleName, profile.lastName, profile.suffix].filter(Boolean).join(' ')),
            profile.email,
            profile.avatar || null,
            profile.studentId
          ]
        );
      }

      // 2. I-insert ang bagong data sa alumni_profiles table
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
          useful_skills, reasons_unemployment, job_start_year, education_history,
          about_me, languages
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.studentId, encrypt(profile.firstName), encrypt(profile.middleName || null), encrypt(profile.lastName), profile.suffix || null, profile.email, profile.phone || null, profile.gender, profile.civilStatus,
          dob, profile.address || null, profile.program, profile.yearEnrolled || null, profile.yearGraduated, profile.honors || 'None',
          profile.professionalExamPassed || 'None', profile.isBoardPasser || 'N/A', profile.licensureExamDate || null, profile.licenseNo || null,
          profile.alumniAssociationStatus || 'Non-Member', profile.employmentStatus, profile.jobTitle || '', profile.jobDescription || null,
          profile.employerName || '', profile.employmentType || '', profile.sector || 'N/A', profile.monthlyIncome || '', profile.jobIndustry || null,
          profile.jobRelatedToCourse || 'No', profile.firstJobRelatedToCourse || 'No', profile.timeToFirstJob || '', skillsStr, profile.profileCompleteness || 0,
          profile.locationRegion || 'Local (Batanes)', historyStr,
          profile.reasonsPursuingProgram || null, profile.findFirstJob || null, profile.reasonsAcceptingJob || null,
          usefulSkillsStr, profile.reasonsUnemployment || null, profile.jobStartYear || null, educationStr,
          profile.aboutMe || null, profile.languages || null
        ]
      );
    }

    // Gawan ng activity audit log ang pagbabagong ito
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

    // Kuhanin ang pinakabagong listahan ng alumni at ibalik sa client
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
 * Endpoint para burahin ang alumni profile. Tanging mga Admins, Super Admins, at Chairperson lang ang pwede rito.
 */
router.post('/delete-alumni', authenticateToken, async (req, res) => {
  try {
    const { studentId, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    // Pigilan kung hindi admin, super admin, o chairperson ang nagbubura
    if (!activeUser || (activeUser.role !== 'Super Admin' && activeUser.role !== 'Administrator' && activeUser.role !== 'Department Chairperson')) {
      return res.status(403).json({ error: 'Permission denied: Only Administrators, Super Admins, and Department Chairpersons can delete profiles.' });
    }

    const [alumniRows] = await pool.query('SELECT * FROM alumni_profiles WHERE student_id = ?', [studentId]);
    if (alumniRows.length === 0) {
      return res.status(404).json({ error: 'Alumnus not found' });
    }
    const alumnus = mapAlumniFromDB(alumniRows[0]);

    // Burahin ang user account. Dahil sa CASCADE delete relationship, mabubura rin ang mismong record sa alumni_profiles table.
    await pool.query('DELETE FROM users WHERE id = ?', [studentId]);

    // Itala ang pagbura sa logs
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

    // Kuhanin ang pinakabagong record sets at ibalik sa frontend
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
 * Endpoint para sa bulk importing ng alumni records mula sa CSV o Excel upload file ng admin.
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
    
    // Isa-isahing i-verify at i-save ang bawat record row na ipinasa
    for (const row of rows) {
      const studentId = row.studentId || `BSC-2026-${Math.floor(100 + Math.random() * 900)}`;
      const name = row.name || `${row.firstName || 'First'} ${row.lastName || 'Last'}`;
      const email = row.email || `${studentId.toLowerCase()}@example.com`;
      const program = row.program || 'BS Information Technology';
      const yearGraduated = parseInt(row.yearGraduated) || 2026;

      // I-check kung may active account na para sa student id na ito para hindi maging duplicate user credentials
      const [existing] = await pool.query('SELECT id FROM users WHERE id = ? OR user_id = ?', [studentId, studentId]);
      if (existing.length === 0) {
        // Gawan ng initial credentials gamit ang default password na 'bsc123'
        const hashedPassword = await bcrypt.hash('bsc123', 10);
        await pool.query(
          `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, studentId, hashedPassword, encrypt(name), email, 'Alumni', 1, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120']
        );

        // Map and validate enum columns to prevent strict mode DB errors
        const validGenders = ['Male', 'Female', 'Other'];
        let genderVal = null;
        if (row.gender && validGenders.includes(row.gender)) {
          genderVal = row.gender;
        } else if (row.gender === 'Others') {
          genderVal = 'Other';
        }

        const validCivilStatus = ['Single', 'Married', 'Single Parent', 'Widowed'];
        const civilStatusVal = (row.civilStatus && validCivilStatus.includes(row.civilStatus)) 
          ? row.civilStatus 
          : null;

        const validEmploymentStatus = ['Employed', 'Self-Employed', 'Unemployed'];
        let employmentStatusVal = 'Unemployed';
        if (row.employmentStatus && validEmploymentStatus.includes(row.employmentStatus)) {
          employmentStatusVal = row.employmentStatus;
        }

        // I-parse at i-serialize ang lists (tulad ng skills array)
        const skillsArr = row.skills ? (typeof row.skills === 'string' ? row.skills.split(', ').filter(Boolean) : row.skills) : [];
        const skillsStr = JSON.stringify(skillsArr);

        // Idagdag ang detalye sa alumni_profiles table
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
            studentId, encrypt(row.firstName || name.split(' ')[0]), encrypt(row.lastName || name.split(' ').slice(1).join(' ')),
            email, row.phone || '', genderVal, civilStatusVal,
            row.dateOfBirth ? row.dateOfBirth : null, row.address || '', program, yearGraduated,
            row.honors || '', row.professionalExamPassed || '', employmentStatusVal,
            row.jobTitle || '', row.jobDescription || '', row.employerName || '', row.employmentType || '',
            row.sector || 'N/A', row.monthlyIncome || '', row.jobRelatedToCourse || 'No', row.timeToFirstJob || '',
            skillsStr, 40,
            row.locationRegion || '', JSON.stringify(row.careerHistory || [])
          ]
        );

        countImported++;
      }
    }

    // Mag-create ng log event kung may kahit isa mang profile na naimport
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

    // Ibalik ang kumpletong bagong listahan ng users at alumni sa admin client
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
