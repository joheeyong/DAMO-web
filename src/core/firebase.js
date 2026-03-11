import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCyqBSOsP5jh2QulYyHAw-KOBDo-G5u-Rg',
  authDomain: 'damo-app-2026.firebaseapp.com',
  projectId: 'damo-app-2026',
  storageBucket: 'damo-app-2026.firebasestorage.app',
  messagingSenderId: '961127696213',
  appId: '1:961127696213:web:00d591747b8808e8f0d1dc',
  measurementId: 'G-HQ4S4HNBCD',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { analytics, logEvent };
