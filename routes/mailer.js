/**
 * @file mailer.js
 * @description Configuration ng Nodemailer SMTP transporter para sa pagpapadala ng system emails.
 */

import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to prefer IPv4 over IPv6. This resolves ENETUNREACH / ETIMEDOUT 
// errors on cloud hostings like Render that lack IPv6 outbound routing.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Ito ang shared mail transporter object na gagamitin sa iba't ibang routes
export let transporter = null;

// Tiyakin muna kung kumpleto ang SMTP environment variables sa .env file
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Gumawa ng transport session gamit ang nodemailer credentials
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true para sa SSL (Port 465), false para sa TLS (Port 587)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    }
  });
  console.log('Mail Service Configured: SMTP Transporter initialized successfully.');
} else {
  // Kapag walang SMTP variables, mag-print ng babala. Ang mga email codes ay makikita na lang sa console logs at database notification tables bilang fallback.
  console.log('Mail Service Warning: SMTP configuration is missing in .env. Emails will be logged to database only (Fallback mode).');
}
