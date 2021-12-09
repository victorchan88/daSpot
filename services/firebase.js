import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { init } from 'next-firebase-auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app =
  firebase.apps.length === 0 ? firebase.initializeApp(config) : firebase.app();

/* These 3 references will be exported to other pages
of the app to facilitate firebase operations */
export const db = app.firestore();
export const auth = firebase.auth;
export const firestore = firebase.firestore;

/* Initialzes Firebase connection using secret keys
 in env variables */
export const initAuth = () => {
  init({
    authPageURL: '/login',
    appPageURL: '/',
    loginAPIEndpoint: '/api/login',
    logoutAPIEndpoint: '/api/logout',
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      },
    },
    firebaseClientInitConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    cookies: {
      name: 'daSpot',
      keys: [process.env.COOKIE_SECRET_CURRENT, process.env.COOKIE_SECRET_NEXT],
      httpOnly: true,
      maxAge: 7 * 60 * 60 * 24 * 1000,
      overwrite: true,
      path: '/room',
      sameSite: 'strict',
      signed: true,
      secure: process.env.NODE_ENV === 'production',
    },
  });
};
