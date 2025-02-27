import http from 'http';
import fs from 'fs';
const express = require('express');
const app = express();
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const otpGenerator = require('otp-generator');

firebaseAdmin.initializeApp({
  // Your Firebase project credentials
  apiKey: '<API_KEY>',
  authDomain: '<AUTH_DOMAIN>',
  projectId: '<PROJECT_ID>',
});

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

app.post('/send-otp', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
  const message = {
    token: '<USER_PHONE_TOKEN>',
    notification: {
      title: 'OTP Verification',
      body: `Your OTP is ${otp}`,
    },
  };

  // Send the OTP using Firebase Cloud Messaging (FCM)
  const messaging = firebaseAdmin.messaging();
  messaging.send(message)
    .then((response) => {
      console.log('OTP sent successfully:', response);
      res.send({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending OTP:', error);
      res.status(500).send({ message: 'Error sending OTP' });
    });
});

app.post('/verify-otp', (req, res) => {
  const otp = req.body.otp;
  const storedOtp = '<STORED_OTP>'; // Replace with your stored OTP logic

  if (otp === storedOtp) {
    // Verify the user's phone number using Firebase Authentication
    const phoneNumber = req.body.phoneNumber;
    const auth = firebaseAdmin.auth();
    auth.verifyPhoneNumber(phoneNumber)
      .then((verificationId) => {
        console.log('Phone number verified successfully:', verificationId);
        res.send({ message: 'Phone number verified successfully' });
      })
      .catch((error) => {
        console.error('Error verifying phone number:', error);
        res.status(500).send({ message: 'Error verifying phone number' });
      });
  } else {
    res.status(401).send({ message: 'Invalid OTP' });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
