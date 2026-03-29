import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';

const router: Router = Router();

// Cache for GitHub stats
let cachedStats: {
  stars: number;
  forks: number;
  lastUpdated: Date;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * @swagger
 * /api/v1/github-stats:
 *   get:
 *     summary: Get cached GitHub repository statistics
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: GitHub statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stars:
 *                   type: integer
 *                 forks:
 *                   type: integer
 *                 lastUpdated:
 *                   type: string
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check if we have cached stats that are still valid
    if (cachedStats && (Date.now() - cachedStats.lastUpdated.getTime()) < CACHE_DURATION) {
      return res.json({
        stars: cachedStats.stars,
        forks: cachedStats.forks,
        lastUpdated: cachedStats.lastUpdated,
        cached: true
      });
    }

    // Fetch fresh stats from GitHub API
    const response = await fetch('https://api.github.com/repos/torqvio/torqvio', {
      headers: {
        'User-Agent': 'Torqvio-Backend/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // Update cache
    cachedStats = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      lastUpdated: new Date()
    };

    logger.info('GitHub stats refreshed', {
      stars: cachedStats.stars,
      forks: cachedStats.forks
    });

    res.json({
      stars: cachedStats.stars,
      forks: cachedStats.forks,
      lastUpdated: cachedStats.lastUpdated,
      cached: false
    });

  } catch (error) {
    logger.error('Failed to fetch GitHub stats:', error);
    
    // Return cached stats if available, even if expired
    if (cachedStats) {
      return res.json({
        stars: cachedStats.stars,
        forks: cachedStats.forks,
        lastUpdated: cachedStats.lastUpdated,
        cached: true,
        error: 'Failed to fetch fresh stats, serving cached data'
      });
    }
    
    // Fallback to zeros if no cache available
    res.json({
      stars: 0,
      forks: 0,
      lastUpdated: new Date(),
      cached: false,
      error: 'Failed to fetch stats and no cache available'
    });
  }
});

export default router;
