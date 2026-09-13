export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: errors.join(', '),
    });
  }
  
  // Duplicate key error
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate Error',
      message: 'A record with the same unique value already exists',
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'The provided token is invalid',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'The provided token has expired',
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
