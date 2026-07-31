/**
 * @file middleware.js
 * @description Express middlewares tulad ng authenticateToken para sa mga protected API routes.
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bsc_careerpath_super_secret_key';

/**
 * Express Middleware para i-authorize at i-verify ang mga client request gamit ang JWT.
 * Kinukuha nito ang token mula sa HTTP request headers.
 */
export function authenticateToken(req, res, next) {
  // Kunin ang Authorization header galing sa request
  const authHeader = req.headers['authorization'];
  
  // Karaniwang format ng header ay "Bearer <token>", kaya kukunin lang natin ang pangalawang bahagi (index 1)
  const token = authHeader && authHeader.split(' ')[1];
  
  // Kung walang nakitang token sa request headers, reject agad at mag-return ng 401 Unauthorized response
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Token Missing' });
  }

  // I-verify ang validity ng JWT token gamit ang ating secret key
  jwt.verify(token, JWT_SECRET, (err, user) => {
    // Kapag expired o binago (invalid) ang token, mag-return ng 403 Forbidden status
    if (err) {
      return res.status(403).json({ error: 'Access Denied: Invalid or Expired Token' });
    }
    
    // I-save ang decoded user payload sa 'req.user' para magamit sa mga susunod na route handlers, at tumuloy sa next() middleware
    req.user = user;
    next();
  });
}
