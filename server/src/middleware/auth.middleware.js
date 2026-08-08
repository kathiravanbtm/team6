const { supabaseAdmin, isMockMode } = require('../config/supabase');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DEV_MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Middleware to verify Supabase JWT token from Authorization header.
 * Supports anonymous dev fallback if ALLOW_ANON_DEV=true in .env,
 * or if running in development mode, or if environment variables fail to load.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Robust dev bypass: Allow if ALLOW_ANON_DEV is true, or if running in dev environment,
      // or if Supabase URL is placeholder/missing (implying mock offline mode)
      const isDevBypass = isMockMode ||
                          process.env.ALLOW_ANON_DEV === 'true' ||
                          process.env.ALLOW_ANON_DEV === undefined ||
                          process.env.NODE_ENV === 'development' ||
                          process.env.NODE_ENV === undefined;

      if (isDevBypass) {
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
    
    // Verify token with Supabase (via Hybrid Client)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      if (isMockMode || process.env.ALLOW_ANON_DEV === 'true' || process.env.ALLOW_ANON_DEV === undefined) {
        console.warn('[AUTH WARN] Token verification failed, falling back to anon dev user:', error?.message);
        req.user = { id: DEV_MOCK_USER_ID, email: 'dev_fallback@learnforge.app', role: 'dev' };
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
