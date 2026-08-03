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
    family: 4, // Force IPv4 connection
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
    socketTimeout: 60000,
    connectionTimeout: 60000,
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 1,
    rateDelta: 20000,
    rateLimit: 1
  });
  console.log('Mail Service Configured: SMTP Transporter initialized successfully.');
} else if (process.env.RESEND_API_KEY) {
  // Mock transporter to bypass SMTP block via Resend HTTP API (uses port 443, never blocked by Render)
  transporter = {
    sendMail: async ({ to, subject, text }) => {
      console.log(`[Mail Dispatch] Sending email via Resend HTTP API to ${to}...`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || 'BSC CareerPath <onboarding@resend.dev>',
          to: typeof to === 'string' ? [to] : to,
          subject: subject,
          text: text
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Resend API Error! Status: ${response.status}`);
      }
      return data;
    }
  };
  console.log('Mail Service Configured: Resend HTTP Transporter initialized successfully.');
} else {
  // Kapag walang SMTP variables, mag-print ng babala. Ang mga email codes ay makikita na lang sa console logs at database notification tables bilang fallback.
  console.log('Mail Service Warning: SMTP configuration and RESEND_API_KEY are missing in environment. Fallback mode.');
}
