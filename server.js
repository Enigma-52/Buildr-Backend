import firebase from './firebaseConfig.js';
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import fs from "fs";
import multer from "multer";
import Razorpay from 'razorpay';
import path from "path";
import bucket from './firebaseAdmin.js';
import crypto from 'crypto';

const {
    db,
    doc,
    setDoc,
    getDocs,
    collection
} = firebase;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const app = express();
const port = process.env.PORT || 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());

var userId;

app.post('/api/login', async (req, res) => {
    const responseData = {
        message: 'User data received successfully'
    };
    
    res.status(200).json(responseData);
    userId = req.body.uid;

    const data = {
        userId: userId,
        email: req.body.email,
        photoURL: req.body.photoURL,
        displayName: req.body.displayName
    };

    console.log(data);
    setDoc(doc(db, 'users', userId), data, {
        merge: true
    });

});

app.get('/api/getSubmissionCalendar/:username', async (req, res) => {
    const username = req.params.username;
    const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;

    try {
        const response = await axios.get(url);
        const leetcodeData = response.data;
        res.status(200).json({
            leetcodeData: leetcodeData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error retrieving submission calendar'
        });
    }
});


app.post('/api/submitProfileDetails', async (req, res) => {
    const {
        userId,
        personalInfo,
        socialLinks,
        education,
        workExperience,
        projects,
    } = req.body;

    const data = {
        userId,
        personalInfo,
        socialLinks,
        education,
        workExperience,
        projects,
    };

    try {
        setDoc(doc(db, 'users', userId), data, {
            merge: true
        });
        res.status(200).json({
            message: 'Profile details submitted successfully'
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({
            message: 'Error saving profile details'
        });
    }
});

app.post('/createPayment', async (req, res) => {
    const {
        amount,
        currency,
        receipt
    } = req.body;
    try {
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency,
            receipt
        });

        res.json({
            orderId: order.id,
            amount: order.amount
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});

app.post('/paymentSuccess', async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        console.log(req.body);

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        console.log(generatedSignature);

        if (generatedSignature === signature) {
            res.status(200).json({ message: 'Payment successful' });
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/buildrUsername', (req, res) => {
    try {
        const {
            userId,
            username
        } = req.body;

        const data = {
            userId: userId,
            username: username
        };

        console.log(data);

        setDoc(doc(db, 'users', userId), data, {
            merge: true
        });

        res.status(200).send({
            message: 'Username updated successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({
            error: 'An internal server error occurred'
        });
    }
});

app.get('/api/getUsername', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);
        const userDoc = querySnapshot.docs.find(doc => doc.id === userId);

        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        console.log(userData.username);
        res.json({ username: userData.username });
    } catch (error) {
        console.error('Error fetching username:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/uploadProfilePicture', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const userId = req.body.userId;
  
      if (!file) {
        return res.status(400).send('No file uploaded');
      }
  
      const filename = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
      const fileUpload = bucket.file(filename);
  
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      stream.on('error', (error) => {
        console.error('Upload error:', error);
        res.status(500).send('Upload error');
      });
  
      stream.on('finish', async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

          const userDocRef = doc(db, 'users', userId);
          await setDoc(userDocRef, { profilePictureUrl: publicUrl }, { merge: true });

          res.status(200).json({ url: publicUrl });
        } catch (error) {
          console.error('Error making file public:', error);
          res.status(500).send('Error making file public');
        }
      });
  
      stream.end(file.buffer);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).send('Upload error');
    }
});

app.get('/api/getProfilePicture/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);
        const userDoc = querySnapshot.docs.find(doc => doc.id === userId);

        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        res.json({ data : userData });
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      res.status(500).json({ error: 'Failed to fetch profile picture' });
    }
});

app.get('/api/user/:username', (req, res) => {
    let users = [
        { username: 'rohit', name: 'Rohit Sharma', email: 'rohit@example.com' },
        { username: 'john', name: 'John Doe', email: 'john@example.com' },
      ];

    const username = req.params.username;
    const user = users.find(user => user.username === username);
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    res.json(user);
});
  

app.listen(port, () => console.log(`Server listening on port ${port}`));