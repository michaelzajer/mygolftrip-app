import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Formik, Field } from 'formik';

const ScoreCard = ({ dGroupId, dGolferId, golfTripId, onClose }) => {
  const [scorecard, setScorecard] = useState(null);
  const [currentHoleNumber, setCurrentHoleNumber] = useState(1);
  const [holesDetailsMap, setHolesDetailsMap] = useState({});
  const [courseName, setCourseName] = useState('');
  const [teeName, setTeeName] = useState('');
  const [roundComplete, setRoundComplete] = useState(false); // Track if the round is complete
  const [runningTotal, setRunningTotal] = useState(0); // New state for running total
  const [initialValues, setInitialValues] = useState({ score: '0' });
  const [dailyHcp, setDailyHcp] = useState(''); // Add state for daily handicap
  const [isEditingHcp, setIsEditingHcp] = useState(false); // New state for edit mode
  const [scorecardsLoaded, setScorecardsLoaded] = useState(false); // New state to track if scorecards have been loaded
  const [golferDetails, setGolferDetails] = useState({}); // State to store golfer details
  const [golferGaDetails, setGolferGaDetails] = useState({})
  const [stablefordPoints, setStablefordPoints] = useState(0);
  const [runningStablefordTotal, setRunningStablefordTotal] = useState(0);



  const formikRef = useRef();
  const auth = getAuth();
  const golferId = auth.currentUser?.uid;

  useEffect(() => {
    if (scorecard && scorecard.scores) {
      const total = Object.values(scorecard.scores).reduce((sum, score) => sum + (score || 0), 0);
      setRunningTotal(total);
    }
  }, [scorecard]);

  useEffect(() => {
    // Fetch and set initial daily handicap
    const fetchGolferDetails = async () => {
      const golferRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', golferId);
      const golferSnap = await getDoc(golferRef);
      if (golferSnap.exists()) {
        // Fetch additional golfer details here
        const data = golferSnap.data();
        setGolferDetails(data); // This will store all the golfer details
        setDailyHcp(data.dailyHcp || ''); // Set daily handicap
      }
    };

    fetchGolferDetails();
  }, [golferId, golfTripId, dGroupId]); // Ensure this only runs once when the component mounts

  useEffect(() => {
    // Fetch and set initial GA handicap
    const fetchGolferGaDetails = async () => {
      const golferGaRef = doc(db, 'golfers', golferId);
      const golferGaSnap = await getDoc(golferGaRef);
      if (golferGaSnap.exists()) {
        // Fetch additional golfer details here
        const data = golferGaSnap.data();
        setGolferGaDetails(data); // This will store all the golfer details
      }
    };

    fetchGolferGaDetails();
  }, [golferId, golfTripId, dGroupId]); // Ensure this only runs once when the component mounts

  useEffect(() => {
    const setGolferDailyHandicap = async () => {
      // Make sure you have all the necessary details before proceeding
      if (golferGaDetails.handicapGA && scorecard && scorecard.teeRef) {
        try {
          // Path to the teeDailyHcps subcollection
          const teeDailyHcpsRef = collection(db, scorecard.teeRef, 'teeDailyHcps');
          const querySnapshot = await getDocs(teeDailyHcpsRef);
  
          // Find the document where the GA Handicap falls within the range
          const handicapDoc = querySnapshot.docs.find((doc) => {
            const data = doc.data();
            return golferGaDetails.handicapGA >= data.gaHcpLower && golferGaDetails.handicapGA <= data.gaHcpUpper;
          });
  
          // If a matching document is found, set the daily handicap
          if (handicapDoc) {
            const data = handicapDoc.data();
            const dailyHandicap = data.dailyHcp; // Ensure this matches the exact field name in Firestore
            setDailyHcp(dailyHandicap);
  
          } else {
            // Log if no document is found
            console.log("No matching document found for GA Handicap:", golferGaDetails.handicapGA);
          }
        } catch (error) {
          console.error("Error setting golfer's daily handicap: ", error);
        }
      }
    };
  
    setGolferDailyHandicap();
  }, [golferGaDetails.handicapGA, scorecard]); // Run this hook when the GA Handicap or scorecard changes
  
  

  useEffect(() => {
    const fetchScorecard = async () => {
      const scorecardsRef = collection(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards');
      const snapshot = await getDocs(scorecardsRef);
      if (!snapshot.empty) {
        const scorecardData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        const holesMap = {};
        for (const holePath of scorecardData.holes) {
          const holeRef = doc(db, holePath);
          const holeSnap = await getDoc(holeRef);
          if (holeSnap.exists()) {
            const holeData = holeSnap.data();
            holesMap[holeData.holeNumber] = holeData;
          }
        }
        setHolesDetailsMap(holesMap);
        setScorecard(scorecardData);
        updateFormInitialValues(scorecardData, currentHoleNumber);

  // Fetch Course details
  if (scorecardData.courseRef) {
    const courseRef = doc(db, scorecardData.courseRef); // Convert string path to DocumentReference
    getDoc(courseRef).then(courseSnapshot => {
      if (courseSnapshot.exists()) {
        setCourseName(courseSnapshot.data().courseName); // Assuming the course document has a 'name' field
        // ... You can set other course-related state here if needed
      }
    });
  }

  // Fetch Tee details
  if (scorecardData.teeRef) {
    const teeRef = doc(db, scorecardData.teeRef); // Convert string path to DocumentReference
    getDoc(teeRef).then(teeSnapshot => {
      if (teeSnapshot.exists()) {
        setTeeName(teeSnapshot.data().teeName); // Assuming the tee document has a 'name' field
        // ... You can set other tee-related state here if needed
      }
    });
  }
      }
    };
    
    fetchScorecard();
  }, [golferId, golfTripId, dGroupId, dGolferId]);

// Function to calculate Stableford points
const calculateStablefordPoints = (score, par, dailyHcp, holeIndex) => {
  // Convert par and holeIndex to numbers to avoid string concatenation issues
  const numericPar = Number(par);
  const numericHoleIndex = Number(holeIndex);
  const handicapStrokes = Math.floor(dailyHcp / 18) + (numericHoleIndex <= dailyHcp % 18 ? 1 : 0);
  const adjustedPar = numericPar + handicapStrokes;
  const netScore = score - adjustedPar;

  if (netScore <= -3) return 5;
  if (netScore === -2) return 4;
  if (netScore === -1) return 3;
  if (netScore === 0) return 2;
  if (netScore === 1) return 1;
  return 0;
};

// Function to increment the score
const incrementScore = (currentScore, holeNumber) => {
  const currentStablefordPoints = calculateStablefordPoints(currentScore, currentHoleDetails.holePar, dailyHcp, currentHoleDetails.holeIndex);
  const newScore = Number(currentScore) + 1;
  const newStablefordPoints = calculateStablefordPoints(newScore, currentHoleDetails.holePar, dailyHcp, currentHoleDetails.holeIndex);

  // Update form, state, and total points
  formikRef.current.setFieldValue('score', newScore);
  setStablefordPoints(newStablefordPoints); 
  setRunningStablefordTotal((prevTotal) => prevTotal + (newStablefordPoints - currentStablefordPoints));

  // Update the scorecard scores with the new score
  const updatedScores = { ...scorecard.scores, [holeNumber]: newScore };
  saveScore(newScore, currentHoleNumber); // Update the score for the current hole
  updateTotalScore(updatedScores); // Update the running total
};


// Function to decrement the score
const decrementScore = (currentScore, holeNumber) => {
  const currentStablefordPoints = calculateStablefordPoints(currentScore, currentHoleDetails.holePar, dailyHcp, currentHoleDetails.holeIndex);
  const newScore = Math.max(Number(currentScore) - 1, 0);
  const newStablefordPoints = calculateStablefordPoints(newScore, currentHoleDetails.holePar, dailyHcp, currentHoleDetails.holeIndex);

  // Update form, state, and total points
  formikRef.current.setFieldValue('score', newScore);
  setStablefordPoints(newStablefordPoints); 
  setRunningStablefordTotal((prevTotal) => prevTotal + (newStablefordPoints - currentStablefordPoints));


  // Update the scorecard scores with the new score
  const updatedScores = { ...scorecard.scores, [holeNumber]: newScore };
  saveScore(newScore, currentHoleNumber); // Update the score for the current hole
  updateTotalScore(updatedScores); // Update the running total
};


// Function to update the total score
const updateTotalScore = (updatedScores) => {
  const total = Object.values(updatedScores).reduce((sum, score) => sum + (score || 0), 0);
  setRunningTotal(total);
};

  const updateFormInitialValues = (scorecardData, holeNumber) => {
    const currentHoleId = Object.keys(holesDetailsMap).find(key => holesDetailsMap[key].holeNumber === holeNumber);
    const score = scorecardData.scores[currentHoleId] || '0';
    setInitialValues({ score });
};

// Function to handle focus on the daily handicap input
  const handleHcpFocus = () => {
    setIsEditingHcp(true);
  };

  // Function to handle blur on the daily handicap input
  const handleHcpBlur = () => {
    setIsEditingHcp(false);
    updateDailyHcp(dailyHcp); // Update Firestore when focus is lost
  };

  const saveScore = async (score, holeNumber) => {
    const numericScore = Number(score);
    const holeId = Object.keys(holesDetailsMap).find(key => holesDetailsMap[key].holeNumber === holeNumber);
  
    if (numericScore && scorecard && holeId) {
      const updatedScores = {
        ...scorecard.scores,
        [holeId]: numericScore,
      };
  
      // Update the scorecard state
      setScorecard(prevScorecard => ({
        ...prevScorecard,
        scores: updatedScores,
      }));
  
      // Prepare the update object
      const scoreUpdate = { [`scores.${holeId}`]: numericScore };
  
      // Update Firestore
      const scorecardRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards', scorecard.id);
      try {
        await updateDoc(scorecardRef, scoreUpdate);
        // Update the total score
        updateTotalScore(updatedScores);
      } catch (error) {
        console.error(`Error saving score for hole ${holeNumber}: `, error);
      }
    }
  };
  

  const completeRound = async () => {
    if (!scorecard || !golferId) {
      console.error("Missing scorecard or golfer information");
      return;
    }
  
    const totalScore = Object.values(scorecard.scores).reduce((sum, score) => sum + (score || 0), 0);
  
    // Reference to the golfer's document in Firestore
    const golferRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', golferId);
  
    try {
      // Update the golfer's score in Firestore
      await updateDoc(golferRef, { score: totalScore });
      console.log(`Total score of ${totalScore} updated for golfer ${golferId}`);
    } catch (error) {
      console.error("Error updating golfer's score: ", error);
    }
  
    setRoundComplete(true);
    onClose(); // Call the onClose function passed as a prop
  };

  const displayScores = () => {
    // Construct the scores array as before
    const scoresArray = scorecard.holes.map(holePath => {
      const holeId = holePath.split('/').pop();
      const holeDetail = holesDetailsMap[holeId];
      const score = scorecard.scores[holeId];
      return {
        holeNumber: holeDetail ? holeDetail.holeNumber : 'Unknown',
        score: score !== undefined ? score : 'N/A'
      };
    });
  
    // Sort the scores array by hole number
    scoresArray.sort((a, b) => a.holeNumber - b.holeNumber);
  
    // Calculate the total score as before
    const totalScore = scoresArray.reduce((total, { score }) => total + (score !== 'N/A' ? parseInt(score, 10) : 0), 0);
  
    return (
      <div>
        <h3>Your Scores</h3>
        {scoresArray.map(({ holeNumber, score }, index) => (
          <div key={index}>
            Hole {holeNumber}: {score}
          </div>
        ))}
        <div>Total Score: {totalScore}</div>
        {/* Optionally add navigation or other actions here */}
      </div>
    );
  };

  // Inside the return statement
  if (roundComplete) {
    return displayScores();
  }

  // Function to update daily handicap in Firestore
  const updateDailyHcp = async (newHcp) => {
    const golferRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', golferId);
    try {
      await updateDoc(golferRef, { dailyHcp: newHcp });
      console.log(`Daily handicap updated to ${newHcp}`);
    } catch (error) {
      console.error("Error updating daily handicap: ", error);
    }
  };

  const navigateHoles = (direction) => {
    setCurrentHoleNumber(prevNumber => {
      let newNumber = prevNumber;
      if (direction === 'next') {
        newNumber = prevNumber < 18 ? prevNumber + 1 : 1;
      } else {
        newNumber = prevNumber > 1 ? prevNumber - 1 : 18;
      }

      const holeId = Object.keys(holesDetailsMap).find(key => holesDetailsMap[key].holeNumber === newNumber);
      formikRef.current.setFieldValue('score', scorecard.scores[holeId] || '0');

      return newNumber;
    });
  };

  if (!scorecard || !holesDetailsMap[currentHoleNumber]) {
    return <div>Loading scorecard...</div>;
  }

  const currentHoleDetails = holesDetailsMap[currentHoleNumber];
  const currentHoleId = currentHoleDetails.id;

 

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <div className="bg-blue-500 text-white py-2 rounded-t-lg flex justify-between items-center">
        <h3 className="text-m font-semibold ml-4">Scorecard - {courseName} - {teeName}</h3>
        <div className="flex items-center">
          <button onClick={onClose} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm">
            Close
          </button>
        </div>
      </div>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          // Call the saveScore function when the form is submitted
          await saveScore(values.score);
          setSubmitting(false);
        }}
      >
        {({ values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Golfer information */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-0">
            <div className="mb-1 sm:mb-0">
              <span className="text-sm mr-2">{golferDetails.golferName}</span>
              <span className="text-sm mr-1">GA Hcp: {golferGaDetails.handicapGA}</span>
              <span className="text-sm mr-1">Daily Hcp: {dailyHcp}</span>
            </div>
          </div>
             {/* Hole information with responsive grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 text-center mb-0">
              <div>
                <div className="font-semibold">{currentHoleDetails.holeNumber}</div>
                <div className="text-sm">Hole</div>
              </div>
              <div>
                <div className="font-semibold">{currentHoleDetails.holeLength} mtrs</div>
                <div className="text-sm">Length</div>
              </div>
              <div>
                <div className="font-semibold">{currentHoleDetails.holePar}</div>
                <div className="text-sm">Par</div>
              </div>
              <div>
                <div className="font-semibold">{currentHoleDetails.holeIndex}</div>
                <div className="text-sm">Index</div>
              </div>
            </div>

            {/* Score and Total Score with responsive layout */}
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-col items-center flex-grow sm:flex-grow-0 mb-2 sm:mb-0">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => decrementScore(values.score, currentHoleNumber)}
                    className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded text-xl"
                  >
                    -
                  </button>
                  <input
                    id="score"
                    name="score"
                    type="text"
                    readOnly
                    value={values.score}
                    className="border rounded text-center text-xl w-10"
                  />
                  <button
                    type="button"
                    onClick={() => incrementScore(values.score, currentHoleNumber)}
                    className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded text-xl"
                  >
                    +
                  </button>
                </div>
                <div className="text-m">Strokes</div>
              </div>
              <div className="flex flex-col items-center flex-grow sm:flex-grow-0 mb-2 sm:mb-0">
                <input
                  id="stableford"
                  name="stableford"
                  type="text"
                  readOnly
                  value={stablefordPoints}
                  className="border rounded text-center text-xl w-10"
                />
                <div className="text-m">Points</div>
              </div>
              <div className="flex flex-col items-center flex-grow sm:flex-grow-0">
           {/*  <input
                id="runningStablefordTotal"
                name="runningStablefordTotal"
                type="text"
                readOnly
                value={runningStablefordTotal}
                className="border rounded text-center text-xl w-12"
              />
              <div className="text-sm">Total Points</div>
        */}
            </div>
              <div className="flex flex-col items-center flex-grow sm:flex-grow-0">
                <input
                  id="totalscore"
                  name="totalscore"
                  type="text"
                  readOnly
                  value={runningTotal}
                  className="border rounded text-center text-xl w-12"
                />
                <div className="text-sm">Total Strokes</div>
              </div>
            </div>

            {/* Previous and Next buttons */}
            <div className="flex  my-4">
              <button
                type="button"
                onClick={() => navigateHoles('prev')}
                className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
              >
                Previous
              </button>
              {/* Adding a spacer div for the gap */}
              <div className="w-4 md:w-8"></div>
              <button
                type="button"
                onClick={() => navigateHoles('next')}
                className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
              >
                Next
              </button>
            </div>

            {currentHoleNumber === 18 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={completeRound}
                  className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm mt-4"
                >
                  Complete Round
                </button>
              </div>
            )}
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ScoreCard;