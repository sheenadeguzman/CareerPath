/**
 * @file server.js
 * @description Full-Stack Node.js Express server para sa Batanes State College (BSC) CareerPath Alumni Tracer.
 * Pinapamahalaan nito ang Express application bootstrap, modular routing, at Vite integration.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import os from 'os';

// I-load ang configuration variables mula sa .env file
dotenv.config();

// I-import ang database pools at routing modules
import { initializeDatabase } from './db.js';
import authRouter from './routes/auth.js';
import alumniRouter from './routes/alumni.js';
import employersRouter from './routes/employers.js';
import jobsRouter from './routes/jobs.js';
import surveysRouter from './routes/surveys.js';
import feedbackRouter from './routes/feedback.js';
import notificationsRouter from './routes/notifications.js';

/**
 * Kinukuha ang local IPv4 address ng host machine.
 * @returns {string} Ang active local network IP address, o 'localhost' kapag offline.
 */
function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // I-set ang middleware body size limits para sa malalaking JSON payload habang nagba-bulk import
  app.use(express.json({ limit: '10mb' }));

  // I-initialize at patakbuhin ang database connections & migrations
  await initializeDatabase();

  // =========================================================================
  // MOUNT API ROUTERS
  // =========================================================================
  app.use('/api', authRouter);
  app.use('/api', alumniRouter);
  app.use('/api', employersRouter);
  app.use('/api', jobsRouter);
  app.use('/api', surveysRouter);
  app.use('/api', feedbackRouter);
  app.use('/api', notificationsRouter);

  // =========================================================================
  // MIDDLEWARE PARA SA PRODUCTION BUILD / DEV SERVER
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    // Sa development mode: i-bind ang Vite middleware para sa Hot Module Replacement (HMR)
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Sa production mode: i-serve ang compiled static assets nang direkta mula sa /dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Simulan ang pagpapatakbo ng server
  app.listen(PORT, '0.0.0.0', () => {
    const networkIP = getNetworkAddress();
    console.log('\n  🚀 CareerPath server is running!\n');
    console.log(`  ➜  Local:   \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
    if (networkIP !== 'localhost') {
      console.log(`  ➜  Network: \x1b[36mhttp://${networkIP}:${PORT}/\x1b[0m`);
    }
    console.log('\n  Press Ctrl+C to stop the server\n');
  });
}

// Simulan ang execution
startServer();
