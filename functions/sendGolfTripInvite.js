const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465, // SSL port for Zoho Mail
  secure: true, // Use SSL
  auth: {
    user: functions.config().zoho.user, // Zoho email username from Firebase environment config
    pass: functions.config().zoho.pass, // Zoho email password from Firebase environment config
  },
});

exports.sendGolfTripInvite = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can send invites.');
  }

  const {userId, tripId} = data;
  const userRecord = await admin.auth().getUser(userId);
  const email = userRecord.email; // User's email from Firebase Authentication

  if (!email) {
    throw new functions.https.HttpsError('not-found', 'User email not found.');
  }

  const tripSnapshot = await admin.firestore().doc(`golfTrips/${tripId}`).get();
  if (!tripSnapshot.exists) {
    throw new functions.https.HttpsError('not-found', 'Trip not found.');
  }

  const tripData = tripSnapshot.data();
  const joinCode = tripData.joinCode;

  const msg = {
    to: email,
    from: 'admin@mygolftrip.golf',
    subject: 'Join Our Golf Trip',
    text: `Use this code to join: ${joinCode}`,
  };

  try {
    await transporter.sendMail(msg);
    return {success: true};
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new functions.https.HttpsError('internal', 'Unable to send the email.');
  }
});
