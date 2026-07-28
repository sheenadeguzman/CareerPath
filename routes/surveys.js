/**
 * @file surveys.js
 * @description Router para sa pag-save ng surveys at pagsusumite ng survey responses ng alumni.
 */

import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from './middleware.js';
import { mapUserFromDB, mapSurveyFromDB, mapSurveyResponseFromDB } from '../mappers.js';
import { transporter } from './mailer.js';

const router = express.Router();

/**
 * POST /api/save-survey
 */
router.post('/save-survey', authenticateToken, async (req, res) => {
  try {
    const { survey, activeUserId } = req.body;

    let activeUser = null;
    if (activeUserId) {
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [activeUserId]);
      if (users.length > 0) activeUser = mapUserFromDB(users[0]);
    }

    const surveyId = survey.id || `survey-${Date.now()}`;
    const qStr = JSON.stringify(survey.questions || []);
    const startDate = survey.startDate ? survey.startDate : null;
    const endDate = survey.endDate ? survey.endDate : null;

    const [existingSurvey] = await pool.query('SELECT id FROM surveys WHERE id = ?', [surveyId]);
    const isNew = existingSurvey.length === 0;

    await pool.query(
      `INSERT INTO surveys (id, title, description, start_date, end_date, status, questions, responses_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
          title = VALUES(title), description = VALUES(description), 
          start_date = VALUES(start_date), end_date = VALUES(end_date), 
          status = VALUES(status), questions = VALUES(questions), responses_count = VALUES(responses_count)`,
      [
        surveyId, survey.title, survey.description, startDate, endDate,
        survey.status || 'Draft', qStr, survey.responsesCount || 0
      ]
    );

    // If it's a new active survey, notify all alumni
    if (isNew && (survey.status || 'Draft') === 'Active') {
      try {
        const [alumniUsers] = await pool.query("SELECT * FROM users WHERE role = 'Alumni'");
        for (const u of alumniUsers) {
          // Create an individual web notification record for each alumnus
          const notifyId = `notify-survey-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const notifyTitle = `New Tracer Survey Deployed`;
          const notifyText = `Hi ${u.name}, a new CHED Graduate Tracer survey "${survey.title}" has been deployed. Please complete this questionnaire before ${endDate}.`;

          await pool.query(
            `INSERT INTO notifications (id, title, text, date, \`read\`) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
            [notifyId, notifyTitle, notifyText]
          );

          // Dispatch email notification via SMTP if configured
          if (transporter && u.email) {
            try {
              await transporter.sendMail({
                from: process.env.SMTP_FROM || `"BSC CareerPath" <${process.env.SMTP_USER}>`,
                to: u.email,
                subject: `New Tracer Survey: ${survey.title}`,
                text: `Hello ${u.name},\n\nA new graduate tracer survey "${survey.title}" has been deployed on the Batanes State College CareerPath portal.\n\nDescription: ${survey.description}\nDeadline: ${endDate}\n\nPlease log in to your account at http://localhost:3000/ to fill out the questionnaire.\n\nRespectfully,\nOffice of Tracer Programs & Administrative Analytics\nBatanes State College`
              });
              console.log(`[Survey Email Alert] Dispatched notification email to ${u.email}`);
            } catch (mailErr) {
              console.error(`[Survey Email Alert Error] Failed to send email to ${u.email}:`, mailErr);
            }
          }
        }
      } catch (notifyErr) {
        console.error('Error dispatching survey notifications:', notifyErr);
      }
    }

    // I-audit ang survey configuration details
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: activeUserId || 'system',
      userEmail: activeUser?.email || 'admin@bsc.edu.ph',
      userName: activeUser?.name || 'Administrator',
      userRole: activeUser?.role || 'Administrator',
      action: 'Configured Graduate Tracer Survey',
      module: 'Surveys Module',
      details: `Tracer Survey '${survey.title}' deployed for tracking employment KPI statistics.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [surveyRows] = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    res.json({ success: true, surveys: surveyRows.map(mapSurveyFromDB) });
  } catch (err) {
    console.error('Save survey error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/submit-survey-response
 */
router.post('/submit-survey-response', authenticateToken, async (req, res) => {
  try {
    const { surveyId, alumniId, alumniName, answers } = req.body;

    const respId = `resp-${Date.now()}`;
    const answersStr = JSON.stringify(answers || {});

    await pool.query(
      `INSERT INTO survey_responses (id, survey_id, alumni_id, alumni_name, answers) 
       VALUES (?, ?, ?, ?, ?)`,
      [respId, surveyId, alumniId, alumniName || 'Anonymous Alumnus', answersStr]
    );

    const [surveyResponsesCount] = await pool.query('SELECT COUNT(*) as count FROM survey_responses WHERE survey_id = ?', [surveyId]);
    await pool.query('UPDATE surveys SET responses_count = ? WHERE id = ?', [surveyResponsesCount[0].count, surveyId]);

    // I-log ang pagsusumite ng survey ng alumni
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      userId: alumniId || 'system',
      userEmail: `${alumniId}@gmail.com`,
      userName: alumniName || 'Alumni Tracker Client',
      userRole: 'Alumni',
      action: 'Submitted Graduate Study Survey',
      module: 'Surveys Module',
      details: `Submitted graduate study report for survey identifier: '${surveyId}'.`
    };

    await pool.query(
      'INSERT INTO activity_logs (id, timestamp, user_id, user_email, user_name, user_role, action, module, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newLog.id, newLog.timestamp, newLog.userId, newLog.userEmail, newLog.userName, newLog.userRole, newLog.action, newLog.module, newLog.details]
    );

    const [surveyRows] = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
    const [responseRows] = await pool.query('SELECT * FROM survey_responses ORDER BY submitted_at DESC');

    res.json({ 
      success: true, 
      surveys: surveyRows.map(mapSurveyFromDB), 
      surveyResponses: responseRows.map(mapSurveyResponseFromDB) 
    });
  } catch (err) {
    console.error('Submit survey response error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
