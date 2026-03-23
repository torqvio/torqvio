import { Router, Request, Response } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../../database/connection.js';
import { generateToken, authenticateToken, AuthenticatedRequest, refreshToken, checkAuthRateLimit } from '../../utils/auth.js';
import { logger } from '../../utils/logger.js';

const router = Router();
const scryptAsync = promisify(scrypt);

// OAuth configuration (these should be environment variables in production)
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8459';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:7243';

// Ensure password_hash column exists — called lazily on first request
let columnEnsured = false;
async function ensurePasswordColumn(db: ReturnType<typeof DatabaseConnection.getInstance>) {
  if (columnEnsured) return;
  try {
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
    columnEnsured = true;
  } catch (error) {
    logger.warn('Could not ensure password_hash column:', error);
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashed, salt] = hash.split('.');
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedBuf = Buffer.from(hashed, 'hex');
  if (buf.length !== hashedBuf.length) return false;
  return timingSafeEqual(buf, hashedBuf);
}

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password (min 8 characters)
 *               name:
 *                 type: string
 *                 description: User display name
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const db = DatabaseConnection.getInstance();
    await ensurePasswordColumn(db);

    const existing = await db.queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const userId = uuidv4();

    const user = await db.queryOne<{ id: string; email: string; name: string; role: string; avatar_url: string }>(
      `INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, 'viewer', $4, NOW(), NOW())
       RETURNING id, email, name, role, avatar_url`,
      [userId, email.toLowerCase(), name, passwordHash]
    );

    if (!user) throw new Error('Failed to create user');

    const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'admin' | 'user' | 'viewer' });

    logger.info('User registered', { userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = DatabaseConnection.getInstance();
    await ensurePasswordColumn(db);

    const user = await db.queryOne<{
      id: string; email: string; name: string; role: string; password_hash: string; avatar_url: string;
    }>(
      'SELECT id, email, name, role, password_hash, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last_login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'admin' | 'user' | 'viewer' });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseConnection.getInstance();

    const user = await db.queryOne<{ id: string; email: string; name: string; role: string; last_login: string; avatar_url: string }>(
      'SELECT id, email, name, role, last_login, avatar_url FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, async (_req: AuthenticatedRequest, res: Response) => {
  // JWT is stateless — client should discard token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/v1/auth/github
router.get('/github', (req: Request, res: Response) => {
  const redirectUri = `${BASE_URL}/api/v1/auth/github/callback`;
  const scope = 'user:email';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  res.redirect(authUrl);
});

// GET /api/v1/auth/github/callback
router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${BASE_URL}/login?error=github_auth_failed`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code as string,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect(`${BASE_URL}/login?error=github_token_failed`);
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    if (!userData.id) {
      return res.redirect(`${BASE_URL}/login?error=github_user_failed`);
    }

    // Get user email
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
      },
    });

    const emailData = await emailResponse.json();
    const primaryEmail = emailData.find((email: any) => email.primary && email.verified)?.email;

    if (!primaryEmail) {
      return res.redirect(`${BASE_URL}/login?error=github_email_required`);
    }

    // Create or find user
    const db = DatabaseConnection.getInstance();
    let user = await db.queryOne<{ id: string; email: string; name: string; role: string; avatar_url: string }>(
      'SELECT id, email, name, role, avatar_url FROM users WHERE email = $1',
      [primaryEmail.toLowerCase()]
    );

    if (!user) {
      const userId = uuidv4();
      user = await db.queryOne(
        `INSERT INTO users (id, email, name, role, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, 'viewer', $4, NOW(), NOW())
         RETURNING id, email, name, role, avatar_url`,
        [userId, primaryEmail.toLowerCase(), userData.name || 'GitHub User', userData.avatar_url || null]
      );
    } else {
      // Always update avatar_url when available from OAuth
      if (userData.avatar_url) {
        user = await db.queryOne(
          `UPDATE users SET avatar_url = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING id, email, name, role, avatar_url`,
          [userData.avatar_url, user.id]
        );
      }
    }

    if (!user) throw new Error('Failed to create/find user');

    const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'admin' | 'user' | 'viewer' });

    logger.info('User authenticated via GitHub', { userId: user.id, email: user.email });

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error: any) {
    logger.error('GitHub auth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=github_auth_error`);
  }
});

// GET /api/v1/auth/google
router.get('/google', (req: Request, res: Response) => {
  const redirectUri = `${BASE_URL}/api/v1/auth/google/callback`;
  const scope = 'openid email profile';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline`;
  res.redirect(authUrl);
});

// GET /api/v1/auth/google/callback
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${BASE_URL}/login?error=google_auth_failed`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `${BASE_URL}/api/v1/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect(`${BASE_URL}/login?error=google_token_failed`);
    }

    // Get user info
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const userData = await userResponse.json();
    
    if (!userData.id || !userData.email) {
      return res.redirect(`${BASE_URL}/login?error=google_user_failed`);
    }

    // Create or find user
    const db = DatabaseConnection.getInstance();
    let user = await db.queryOne<{ id: string; email: string; name: string; role: string; avatar_url: string }>(
      'SELECT id, email, name, role, avatar_url FROM users WHERE email = $1',
      [userData.email.toLowerCase()]
    );

    if (!user) {
      const userId = uuidv4();
      user = await db.queryOne(
        `INSERT INTO users (id, email, name, role, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, 'viewer', $4, NOW(), NOW())
         RETURNING id, email, name, role, avatar_url`,
        [userId, userData.email.toLowerCase(), userData.name || 'Google User', userData.picture || null]
      );
    } else {
      // Always update avatar_url when available from OAuth
      if (userData.picture) {
        user = await db.queryOne(
          `UPDATE users SET avatar_url = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING id, email, name, role, avatar_url`,
          [userData.picture, user.id]
        );
      }
    }

    if (!user) throw new Error('Failed to create/find user');

    const token = generateToken({ userId: user.id, email: user.email, role: user.role as 'admin' | 'user' | 'viewer' });

    logger.info('User authenticated via Google', { userId: user.id, email: user.email });

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error: any) {
    logger.error('Google auth error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_error`);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', refreshToken);

export default router;
