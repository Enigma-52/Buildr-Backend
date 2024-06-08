import firebase from './firebaseConfig.js';
import axios from 'axios';
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

app.get('/api/getSubmissionCalendar/:username', async (req, res) => {
    const username = req.params.username;
    const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;

    try {
        const response = await axios.get(url);
        const leetcodeData = response.data;
        
        res.status(200).json({ leetcodeData: leetcodeData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving submission calendar' });
    }
});


app.post('/api/submitProfileDetails', async (req, res) => {
    const { userId, personalInfo, socialLinks } = req.body;
  
    const data = {
      userId,
      personalInfo,
      socialLinks
    };
  
    try {
      console.log(data);
      res.status(200).json({ message: 'Profile details submitted successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ message: 'Error saving profile details' });
    }
  });




app.listen(port, () => console.log(`Server listening on port ${port}`));

