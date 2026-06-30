/**
 * @file mailer.js
 * @description Nodemailer SMTP configuration and shared mail transporter helper.
 */

import nodemailer from 'nodemailer';

export let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('Mail Service Configured: SMTP Transporter initialized successfully.');
} else {
  console.log('Mail Service Warning: SMTP configuration is missing in .env. Emails will be logged to database only (Fallback mode).');
}
