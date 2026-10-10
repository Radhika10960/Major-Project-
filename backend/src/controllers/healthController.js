import { getDatabaseStatus } from '../config/database.js';

/**
 * GET /api/health
 * Returns API and database health status.
 */
export async function getHealth(req, res) {
  const dbStatus = getDatabaseStatus();

  const health = {
    success: true,
    data: {
      api: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
      },
      database: {
        status: dbStatus.status,
        host: dbStatus.host,
        name: dbStatus.name,
      },
    },
  };

  // If DB is not connected, still return 200 but flag it
  const httpStatus = dbStatus.status === 'connected' ? 200 : 503;

  res.status(httpStatus).json(health);
}
