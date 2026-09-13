import { getPool } from '../config/database.js';

export const auditLogger = async (req, res, next) => {
  const start = Date.now();

  const originalJson = res.json.bind(res);

  res.json = function (data) {
    res.locals.responseData = data;
    return originalJson(data);
  };

  res.on('finish', async () => {
    try {
      const pool = getPool();
      const duration = Date.now() - start;

      if (req.path === '/api/health' || req.path.startsWith('/api/auth')) {
        return;
      }

      await pool.query(
        `INSERT INTO audit_logs (
          user_id, session_id, action, resource_type, resource_id, method,
          endpoint, status_code, ip_address, user_agent, response_time,
          success, error_message, details, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)`,
        [
          req.user?.id ?? req.user?._id ?? null,
          req.sessionId ?? null,
          req.method,
          req.path,
          req.params.id || req.params.assessmentId || null,
          req.method,
          req.originalUrl,
          res.statusCode,
          req.ip,
          req.get('user-agent'),
          duration,
          res.statusCode < 400,
          res.statusCode >= 400 ? res.locals.responseData?.message : null,
          JSON.stringify({
            query: req.query,
            params: req.params,
          }),
        ]
      );
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  });

  next();
};
