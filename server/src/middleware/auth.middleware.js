const { supabaseAdmin } = require('../config/supabase');
require('dotenv').config();

const DEV_MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Middleware to verify Supabase JWT token from Authorization header.
 * Supports anonymous dev fallback if ALLOW_ANON_DEV=true in .env.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow dev mode bypass for easy API testing during hackathon
      if (process.env.ALLOW_ANON_DEV === 'true' || process.env.NODE_ENV === 'development') {
        req.user = {
          id: DEV_MOCK_USER_ID,
          email: 'anonymous_dev@learnforge.app',
          role: 'dev',
        };
        req.authToken = null;
        return next();
      }

      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      if (process.env.ALLOW_ANON_DEV === 'true') {
        console.warn('[AUTH WARN] Token verification failed, falling back to anon dev user:', error?.message);
        req.user = { id: DEV_MOCK_USER_ID, email: 'dev_fallback@learnforge.app' };
        req.authToken = token;
        return next();
      }
      return res.status(401).json({ error: `Unauthorized: ${error?.message || 'Invalid user token'}` });
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
  DEV_MOCK_USER_ID,
};
