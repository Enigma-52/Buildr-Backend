import firebase from './firebaseConfig.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";

const { db, doc, setDoc, getDocs, collection, firebaseConfig } = firebase;

const app = express();
const port = process.env.PORT || 5000; 

app.use(cors());
app.use(bodyParser.json());

var userId;
app.post('/api/login', async (req, res) => {
    const responseData = { message: 'User data received successfully' };
    res.status(200).json(responseData);

    userId = req.body.uid;

    const data = {
        userId: userId ,
        email : req.body.email,
        photoURL : req.body.photoURL,
        displayName : req.body.displayName
    };

    console.log(data);

    setDoc(doc(db, 'users', userId), data, { merge: true });

});

app.listen(port, () => console.log(`Server listening on port ${port}`));
