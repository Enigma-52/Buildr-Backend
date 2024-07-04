import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc , getDocs ,collection , query , where} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup,getAuth , signOut} from 'firebase/auth';

import bucket from './firebaseAdmin.js';

import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export default { firebaseConfig,firebaseApp, db, doc , setDoc ,getFirestore, getDocs, collection, auth, GoogleAuthProvider, signInWithPopup,query , where};