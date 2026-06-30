/**
 * @file middleware.js
 * @description Express middlewares tulad ng authenticateToken para sa protected routes.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bsc_careerpath_super_secret_key';

/**
 * Express Middleware para i-authorize ang mga client request gamit ang JWT.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Token Missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Access Denied: Invalid or Expired Token' });
    }
    req.user = user;
    next();
  });
}
