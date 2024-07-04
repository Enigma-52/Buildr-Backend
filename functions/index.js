import functions from 'firebase-functions' ;
import app from './server.mjs' ; // Adjust the path as necessary

export const appFunction = functions.https.onRequest(app);