const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('firebase-admin');

let privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
  .replace(/\\n/g, '\n')
  .replace(/^"|"$/g, '');

if (privateKey && !privateKey.includes('-----END PRIVATE KEY-----')) {
  privateKey = privateKey.trim() + '\n-----END PRIVATE KEY-----\n';
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
  console.log('SUCCESS: Firebase Admin initialized!');
} catch (err) {
  console.error('FAIL:', err.message);
}
