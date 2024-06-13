import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc , getDocs ,collection} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup,getAuth , signOut} from 'firebase/auth';

import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export default { firebaseConfig,firebaseApp, db, doc , setDoc ,getFirestore, getDocs, collection, auth, GoogleAuthProvider, signInWithPopup,};