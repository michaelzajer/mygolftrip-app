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
        setDailyHcp(golferSnap.data().dailyHcp || ''); // Only set dailyHcp here
      }
    };

    fetchGolferDetails();
  }, [golferId, golfTripId, dGroupId]); // Ensure this only runs once when the component mounts


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

  const saveScore = async (score) => {
    const numericScore = Number(score);
  
    if (numericScore && scorecard && currentHoleNumber) {
      const holeId = Object.keys(holesDetailsMap).find(key => holesDetailsMap[key].holeNumber === currentHoleNumber);
  
      const updatedScores = {
        ...scorecard.scores,
        [holeId]: numericScore,
      };
  
      // Update the scorecard state
      setScorecard(prevScorecard => ({
        ...prevScorecard,
        scores: updatedScores,
      }));
  
      const updatedScorecardData = {
        ...scorecard,
        scores: updatedScores,
      };
  
      const scorecardRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards', scorecard.id);
  
      try {
        await setDoc(scorecardRef, updatedScorecardData);
        console.log(`Score for hole ${holeId} saved: ${numericScore}`);
  
        // Recalculate and update the running total
        const newTotal = Object.values(updatedScores).reduce((sum, score) => sum + (score || 0), 0);
        setRunningTotal(newTotal);
  
        navigateHoles('next');
      } catch (error) {
        console.error(`Error saving score for hole ${holeId}: `, error);
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
  <h3 className="text-xl font-semibold ml-4">Scorecard - {courseName} - {teeName}</h3>
  <div className="flex items-center">
    <span className="text-sm mr-2">Daily Hcp:</span> {/* Label for daily handicap */}
    <input
      type="number"
      value={dailyHcp}
      readOnly={!isEditingHcp}
      onFocus={handleHcpFocus}
      onBlur={handleHcpBlur}
      onChange={(e) => setDailyHcp(e.target.value)}
      className="text-blue-500 border rounded text-sm" // Removed the px-2 py-1 for padding
      style={{ width: '80px' }} // Set a specific width
      placeholder="Hcp"
    />
          <button 
            onClick={onClose}
            className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
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
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-lg">Hole Number: <span className="font-semibold">{currentHoleNumber}</span></div>
                <div className="text-lg">Length: <span className="font-semibold">{currentHoleDetails.holeLength} mtrs</span></div>
                <div className="text-lg">Par: <span className="font-semibold">{currentHoleDetails.holePar}</span></div>
                <div className="text-lg">Index: <span className="font-semibold">{currentHoleDetails.holeIndex}</span></div>
              </div>

              <div className="flex items-center space-x-4">
                <label htmlFor="score" className="text-lg">Score:</label>
                <Field
                  id="score"
                  name="score"
                  type="number"
                  value={values.score}
                  onChange={handleChange}
                  placeholder="Enter score"
                  className="border rounded px-2 py-1 text-sm w-16"
                />
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                >
                  Save Score
                </button>
              </div>
              <div className="text-lg">Total Score: <span className="font-semibold">{runningTotal}</span></div>
              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={() => navigateHoles('prev')}
                  className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                >
                  Previous
                </button>
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
          </>
        )}
      </Formik>
    </div>
  );
};

export default ScoreCard;