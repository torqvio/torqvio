// DELETE /api/v1/webhooks/bulk - Bulk delete webhooks (for cleanup)
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { webhook_ids, url_pattern, created_before } = req.body;
    const db = getWebhookDbConnection();
    
    let deletedCount = 0;
    
    if (webhook_ids && Array.isArray(webhook_ids)) {
      // Delete specific webhook IDs
      const result = await db.query(
        `DELETE FROM webhooks WHERE id = ANY($1) RETURNING COUNT(*) as count`,
        [webhook_ids]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (url_pattern) {
      // Delete webhooks matching URL pattern
      const result = await db.query(
        `DELETE FROM webhooks WHERE url ILIKE $1 RETURNING COUNT(*) as count`,
        [`%${url_pattern}%`]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (created_before) {
      // Delete webhooks created before a specific date
      const result = await db.query(
        `DELETE FROM webhooks WHERE created_at < $1 RETURNING COUNT(*) as count`,
        [created_before]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide webhook_ids, url_pattern, or created_before'
      });
    }
    
    logger.info(`Bulk deleted ${deletedCount} webhooks`);
    
    res.json({
      message: 'Bulk delete completed',
      deleted_count: deletedCount
    });
  } catch (error) {
    logger.error('Failed to bulk delete webhooks:', error);
    res.status(500).json({
      error: 'Failed to bulk delete webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
