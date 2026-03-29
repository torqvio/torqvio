import { Router } from 'express';
import { DatabaseConnection } from '../../database/connection.js';
import { WeeklyReportGenerator } from '../../growth/WeeklyReportGenerator.js';
import { authenticateApiKey, AuthenticatedRequest } from '../../utils/auth.js';
import { ShareableReportService } from '../../reports/ShareableReportService.js';

export function createReportsRouter(db: DatabaseConnection): Router {
  const router = Router();
  const reportService = new ShareableReportService();

  // GET /api/reports/public/:reportId - Get public shareable report
  router.get('/public/:reportId', async (req, res) => {
    try {
      const { reportId } = req.params;
      
      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }

      // Get report from service (mock implementation for now)
      const report = await (reportService as any).getReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found or expired' });
      }

      // Transform to match frontend interface
      const transformedReport = {
        companyName: report.metadata.companyName,
        weekPeriod: `${report.period} period`,
        headline: report.title,
        metrics: {
          recovered: report.data.totalRecovered,
          prevented: report.data.counterfactualProtected,
          efficiency: report.data.recoveryRate / 100,
          customersProtected: Math.floor(report.data.totalRecovered / 125) // Estimate
        },
        chart: {
          type: 'bar',
          data: {
            labels: report.data.dailyBreakdown.map((d: any) => d.date),
            datasets: [{
              label: 'Revenue Protected',
              data: report.data.dailyBreakdown.map((d: any) => d.recovered),
              backgroundColor: '#9333ea',
              borderColor: '#7c3aed',
              borderWidth: 1
            }]
          }
        },
        branding: {
          poweredBy: 'Torqvio',
          logo: '/logo.png',
          shareable: true
        },
        shareUrl: `${process.env.FRONTEND_URL || 'https://torqvio.com'}/reports/${report.publicId}`,
        reportId: report.publicId,
        generatedAt: report.generatedAt.toISOString()
      };

      res.json(transformedReport);
    } catch (error) {
      console.error('Shareable report error:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  // GET /api/reports/:shareToken - Legacy route for backward compatibility
  router.get('/:shareToken', async (req, res) => {
    try {
      const { shareToken } = req.params;
      
      if (!shareToken) {
        return res.status(400).json({ error: 'Share token is required' });
      }

      // Create a simple report generator instance for this route
      const weeklyReportGenerator = new WeeklyReportGenerator(db, null as any, null as any, null as any);
      const report = await weeklyReportGenerator.getShareableReport(shareToken);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found or expired' });
      }

      res.json({
        success: true,
        data: report.reportData
      });
    } catch (error) {
      console.error('Shareable report error:', error);
      res.status(500).json({ error: 'Failed to fetch report' });
    }
  });

  // POST /api/reports/generate - Generate new shareable report (authenticated)
  router.post('/generate', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // This would be implemented with proper dependencies
      // For now, return a placeholder
      const shareableReport = {
        reportId: 'sample-report-id',
        shareToken: 'sample-share-token',
        shareUrl: `${process.env.FRONTEND_URL || 'https://torqvio.com'}/reports/sample-share-token`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      res.json({
        success: true,
        data: shareableReport
      });
    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // GET /api/reports/analytics - Get report analytics for a project (authenticated)
  router.get('/analytics', authenticateApiKey, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = req.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // This would be implemented with proper dependencies
      const analytics = {
        totalReports: 12,
        totalShares: 8,
        totalViews: 156,
        averageViewsPerShare: 19.5
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Report analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch report analytics' });
    }
  });

  return router;
}
