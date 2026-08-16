module.exports = function errorHandler(err, req, res, next) {
  console.error('ERROR on', req.method, req.path, '-', err.message);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};
