import { Router, Response } from 'express';
import { randomBytes, createHash } from 'crypto';
import { authenticateToken, AuthenticatedRequest } from '../../utils/auth.js';
import { DatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';

const router = Router();

function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = 'ak_' + randomBytes(20).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  const prefix = raw.substring(0, 14); // "ak_" + first 11 chars
  return { raw, hash, prefix };
}

function parseExpiry(expires: string): Date | null {
  if (!expires) return null;
  const match = expires.match(/^(\d+)(d|h|m)$/);
  if (!match) return null;
  const amount = parseInt(match[1]);
  const unit = match[2];
  const ms = unit === 'd' ? amount * 86400000 : unit === 'h' ? amount * 3600000 : amount * 60000;
  return new Date(Date.now() + ms);
}

// POST /api/v1/api-keys — create
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { name, permissions = ['read'], expires } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const allowedPerms = ['read', 'write', 'execute', 'admin'];
  const perms: string[] = Array.isArray(permissions) ? permissions : [permissions];
  if (!perms.every(p => allowedPerms.includes(p))) {
    res.status(400).json({ error: `permissions must be one of: ${allowedPerms.join(', ')}` });
    return;
  }

  const expiresAt = expires ? parseExpiry(expires) : null;
  if (expires && !expiresAt) {
    res.status(400).json({ error: 'Invalid expires format. Use e.g. 30d, 12h, 60m' });
    return;
  }

  try {
    const db = DatabaseConnection.getInstance();
    const { raw, hash, prefix } = generateApiKey();

    const row = await db.queryOne(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, permissions, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, key_prefix, permissions, expires_at, created_at`,
      [req.user!.userId, name, prefix, hash, perms, expiresAt]
    );

    logger.info('API key created', { userId: req.user!.userId, keyId: row.id, name });

    // Return the raw key only once at creation time
    res.status(201).json({ ...row, key: raw });
  } catch (error: any) {
    logger.error('Failed to create API key', { error: error.message });
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// GET /api/v1/api-keys — list
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseConnection.getInstance();
    const rows = await db.query(
      `SELECT id, name, key_prefix, permissions, expires_at, last_used_at, is_active, created_at
       FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user!.userId]
    );
    res.json({ api_keys: rows });
  } catch (error: any) {
    logger.error('Failed to list API keys', { error: error.message });
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

// DELETE /api/v1/api-keys/:id — revoke
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseConnection.getInstance();
    const row = await db.queryOne(
      `UPDATE api_keys SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, name`,
      [req.params.id, req.user!.userId]
    );

    if (!row) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    logger.info('API key revoked', { userId: req.user!.userId, keyId: req.params.id });
    res.json({ message: `API key "${row.name}" revoked` });
  } catch (error: any) {
    logger.error('Failed to revoke API key', { error: error.message });
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// POST /api/v1/api-keys/:id/rotate — rotate
router.post('/:id/rotate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = DatabaseConnection.getInstance();
    const existing = await db.queryOne(
      `SELECT id, name, permissions, expires_at FROM api_keys WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [req.params.id, req.user!.userId]
    );

    if (!existing) {
      res.status(404).json({ error: 'API key not found or already revoked' });
      return;
    }

    const { raw, hash, prefix } = generateApiKey();

    const row = await db.queryOne(
      `UPDATE api_keys SET key_hash = $1, key_prefix = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, key_prefix, permissions, expires_at, created_at`,
      [hash, prefix, req.params.id]
    );

    logger.info('API key rotated', { userId: req.user!.userId, keyId: req.params.id });
    res.json({ ...row, key: raw });
  } catch (error: any) {
    logger.error('Failed to rotate API key', { error: error.message });
    res.status(500).json({ error: 'Failed to rotate API key' });
  }
});

export default router;
