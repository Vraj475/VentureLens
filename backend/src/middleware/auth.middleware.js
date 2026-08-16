const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
      })
    });
    console.log('✓ Firebase Admin initialized');
  } catch (err) {
    console.error('✗ Firebase Admin init failed:', err.message);
  }
}

module.exports = async function authMiddleware(req, res, next) {
  if (!admin.apps.length) {
    return res.status(503).json({ error: 'Auth service unavailable — check FIREBASE_* in .env' });
  }
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(header.split('Bearer ')[1].trim());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.code === 'auth/id-token-expired' ? 'Session expired' : 'Invalid token' });
  }
};
