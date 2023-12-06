const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.joinGolfTrip = functions.https.onCall(async (data, context) => {
// Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated",
      "Only authenticated users can join trips.");
  }

  const {tripId} = data;
  const golferId = context.auth.uid; // Authenticated user's ID

  try {
    const tripRef = admin.firestore().doc(`golfTrips/${tripId}`);
    await tripRef.update({
      golfers: admin.firestore.FieldValue.arrayUnion(golferId),
    });
    return {success: true};
  } catch (error) {
    console.error("Error joining trip: ", error);
    throw new functions.https.HttpsError("internal", "Unable to join the trip.");
  }
});

