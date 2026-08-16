module.exports = async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 2000) {
  let lastErr;
  for (let i = 1; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      const retryable = err.status === 429 || err.status >= 500 || (err.message || '').includes('429');
      if (!retryable || i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, i - 1)));
    }
  }
  throw lastErr;
};
