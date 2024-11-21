const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Parse and decode the service account key
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString('utf-8')
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Export Firestore instance and other admin tools
module.exports = { admin, db };
