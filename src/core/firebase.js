import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as fbLogEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
};

let analytics = null;
try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
} catch {
  // Firebase not configured — analytics disabled
}

function logEvent(analyticsInstance, ...args) {
  if (analyticsInstance) {
    try { fbLogEvent(analyticsInstance, ...args); } catch {}
  }
}

export { analytics, logEvent };
