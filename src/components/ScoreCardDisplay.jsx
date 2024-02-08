import React, {useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Ensure you have the correct path to your Firebase config
import { updateLeaderboard } from '../components/updateLeaderboard';
import { updatePairs } from '../components/updatePairs';
import GolferPairsInfo from './GolferPairsInfo';

const ScoreCardDisplay = ({ scorecardData, tripId, groupId, golferId, scorecardId, onClose }) => {
    const [courseDetails, setCourseDetails] = useState({ courseName: '', courseLocation: '' });
    const [golferDetails, setGolferDetails] = useState({ dailyHcp: '', golferName: '', score: '' });
    const [handicapGA, setHandicapGA] = useState('');
    const [holesDetails, setHolesDetails] = useState([]);
    const [currentHoleIndex, setCurrentHoleIndex] = useState(0); // New state to track current hole
    const [scores, setScores] = useState(scorecardData.scores);
    const [totalScore, setTotalScore] = useState(calculateInitialTotalScore());
    const [totalPoints, setTotalPoints] = useState(0);
    const [pairsDocId, setPairsDocId] = useState(null);
    const [dayDocId, setDayDocId] = useState(null);


    useEffect(() => {
      const fetchData = async () => {
        // Fetch golfer details
        const golferRef = doc(db, `/golfTrips/${tripId}/groups/${groupId}/golfers/${golferId}`);
        const golferSnapshot = await getDoc(golferRef);
        if (golferSnapshot.exists()) {
          const golferData = golferSnapshot.data();
          setGolferDetails(golferData);
          // If golfer details include handicap information, consider fetching related data here
        }
    
        // Fetch handicap GA
        const golferGARef = doc(db, `/golfers/${golferId}`);
        const golferGASnapshot = await getDoc(golferGARef);
        if (golferGASnapshot.exists()) {
          setHandicapGA(golferGASnapshot.data().handicapGA);
        }
    // Fetch hole details
    if (scorecardData && scorecardData.holes) {
      const holes = await Promise.all(scorecardData.holes.map(async (holeRefPath) => {
        const ref = doc(db, holeRefPath);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const holeData = snapshot.data();
          const score = scorecardData.scores[holeData.holeNumber];
          const stablefordPoints = scorecardData.stablefordPoints[holeData.holeNumber];
          return { ...holeData, score, stablefordPoints };
        }
        return null;
      }));

      const sortedHoles = holes.filter(hole => hole !== null).sort((a, b) => parseInt(a.holeNumber) - parseInt(b.holeNumber));
      setHolesDetails(sortedHoles);
    }

    // Fetch course details
    if (scorecardData.courseRef) {
      const ref = doc(db, scorecardData.courseRef);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const { courseName, courseLocation } = snapshot.data();
        setCourseDetails({ courseName, courseLocation });
      }
    }
  };

  fetchData().catch(console.error);
    }, [tripId, groupId, golferId, scorecardData, scorecardData.courseRef]); // List all external variables your effect depends on

    function calculateInitialTotalScore() {
      return holesDetails.reduce((acc, hole) => acc + hole.score, 0);
    }
    
  // Update the increment and decrement functions to correctly manage scores
  const updateScoresAndTotalScore = async (updatedHoles) => {
    const newTotalScore = updatedHoles.reduce((acc, hole) => acc + (hole.score || 0), 0);
    const newTotalStablefordPoints = updatedHoles.reduce((acc, hole) => acc + (hole.stablefordPoints || 0), 0); // Sum Stableford points
    
    setTotalScore(newTotalScore);
  
    const updates = updatedHoles.reduce((acc, hole) => ({
      ...acc,
      [`scores.${hole.holeNumber}`]: hole.score,
      [`stablefordPoints.${hole.holeNumber}`]: hole.stablefordPoints
    }), { totalScore: newTotalScore, totalPoints: newTotalStablefordPoints }); // Include totalPoints in the update
  
    const scorecardPath = `/golfTrips/${tripId}/groups/${groupId}/golfers/${golferId}/scorecards/${scorecardId}`;
    const scorecardRef = doc(db, scorecardPath);

    const groupDate = scorecardData.groupDate; // You need to ensure this value is correctly managed
    const { dayDocId, pairsDocId } = await updatePairs(tripId, golferId, groupDate, newTotalScore, newTotalStablefordPoints)
      setPairsDocId(pairsDocId); // Assuming setPairDocId is your state setter for storing the pair document ID
      setDayDocId(dayDocId)
      console.log('these to updatePairs:', tripId, golferId, groupDate, newTotalScore, newTotalStablefordPoints)
  
  
    try {
      await updateDoc(scorecardRef, updates);
      console.log("Scores, stableford points, total score, and total Stableford points updated successfully");
    } catch (error) {
      console.error("Error updating scores, stableford points, and total Stableford points: ", error);
    }
  };

  const incrementScore = async (holeNumber) => {
    let updatedHoles = holesDetails.map(hole => {
      if (hole.holeNumber.toString() === holeNumber.toString()) {
        const newScore = hole.score + 1;
        const newStablefordPoints = calculateStablefordPoints(newScore, currentHole.holePar, golferDetails.dailyHcp, hole.holeIndex);
        return { ...hole, score: newScore, stablefordPoints: newStablefordPoints };
      }
      return hole;
    });
    setHolesDetails(updatedHoles);
    await updateScoresAndTotalScore(updatedHoles);
  };
  
  const decrementScore = async (holeNumber) => {
    let updatedHoles = holesDetails.map(hole => {
      if (hole.holeNumber.toString() === holeNumber.toString() && hole.score > 0) {
        const newScore = hole.score - 1;
        const newStablefordPoints = calculateStablefordPoints(newScore, currentHole.holePar, golferDetails.dailyHcp, hole.holeIndex);
        return { ...hole, score: newScore, stablefordPoints: newStablefordPoints };
       
      }
      return hole;
    });
    setHolesDetails(updatedHoles);
    await updateScoresAndTotalScore(updatedHoles);
  };

  useEffect(() => {
    const scorecardRef = doc(db, `/golfTrips/${tripId}/groups/${groupId}/golfers/${golferId}/scorecards/${scorecardId}`);
    const unsubscribe = onSnapshot(scorecardRef, (doc) => {
      const data = doc.data();
      // Update local totalPoints state with the new value from Firestore
      setTotalPoints(data?.totalPoints);
    });
  
    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, [tripId, groupId, golferId, scorecardId]); // Adjust dependencies as necessary
    
      const updateDailyHcpInFirestore = async (newDailyHcp) => {
        const scorecardPath = `/golfTrips/${tripId}/groups/${groupId}/golfers/${golferId}/scorecards/${scorecardId}`;
        const scorecardRef = doc(db, scorecardPath);
      
        try {
          await updateDoc(scorecardRef, {
            dailyHcp: newDailyHcp, // Update or set the dailyHcp field
          });
        } catch (error) {
          console.error("Error updating daily handicap in Firestore: ", error);
        }
      };

      useEffect(() => {
        const calculateDailyHandicap = async () => {
          if (handicapGA && scorecardData.teeRef) {
            const teeDailyHcpsRef = collection(db, `${scorecardData.teeRef}/teeDailyHcps`);
            try {
              const snapshot = await getDocs(teeDailyHcpsRef);
              const handicapDoc = snapshot.docs.find(doc => {
                const hcpData = doc.data();
                return handicapGA >= hcpData.gaHcpLower && handicapGA <= hcpData.gaHcpUpper;
              });
              if (handicapDoc) {
                const newDailyHcp = handicapDoc.data().dailyHcp;
                // Update Firestore with the new daily handicap
                await updateDailyHcpInFirestore(newDailyHcp);
                setGolferDetails(prevState => ({ ...prevState, dailyHcp: handicapDoc.data().dailyHcp }));
              } else {
              }
            } catch (error) {
              console.error("Error fetching daily handicap:", error);
            }
          }
        };
      
        calculateDailyHandicap();
      }, [handicapGA, scorecardData.teeRef]);

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

        // Handlers for previous and next buttons
        const goToPreviousHole = () => {
            setCurrentHoleIndex(i => (i > 0 ? i - 1 : i));
        };

        const goToNextHole = () => {
            setCurrentHoleIndex(i => (i < holesDetails.length - 1 ? i + 1 : i));
        };

        // Get current hole details
        const currentHole = holesDetails[currentHoleIndex];

        useEffect(() => {
          // Ensure all necessary data is present
          if (handicapGA && golferDetails && !isNaN(totalScore) && !isNaN(totalPoints)) {
            updateLeaderboard( {
              tripId, 
              groupId, 
              golferId,
              totalScore,
              totalPoints,
              handicapGA: handicapGA,
              dailyHandicap: golferDetails.dailyHcp,
              groupName: scorecardData.groupName,
              golferId,
              golferName: golferDetails.golferName,
              
            }).catch(console.error);
            console.log( totalScore, totalPoints, golferId, handicapGA, golferDetails.dailyHcp, scorecardData.groupName, golferDetails.golferName);          }
        }, [handicapGA, golferDetails, totalScore, totalPoints, tripId, groupId, golferId]);

        return (
          <div className="bg-blue-100 text-green-100 shadow-lg rounded-lg p-4">
            <div className="bg-blue-100 text-yellow-100 py-2 rounded-t-lg flex justify-between items-center">
              <h3 className="text-m font-semibold ml-4">{courseDetails.courseLocation} - {courseDetails.courseName}</h3>
              <button onClick={onClose} className="bg-pink-100 hover:bg-pink-100 text-white py-1 px-3 rounded text-sm">
                Close
              </button>
            </div>

          <div className="text-center mb-4">
            <p className="text-2xl mb-2">{golferDetails.golferName}</p>
            <p className="text-xl">GA Hcp: {handicapGA} - Daily Hcp: {scorecardData.dailyHcp}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-semibold">{currentHole?.holeNumber}</div>
              <div className="text-sm">Hole</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold  text-yellow-100">{currentHole?.holePar}</div>
              <div className="text-sm  text-yellow-100">Par</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{currentHole?.holeLength}</div>
              <div className="text-sm">mtrs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold">{currentHole?.holeIndex}</div>
              <div className="text-sm">Index</div>
            </div>
          </div>
          <div class=" mb-1 rounded">
              <div className="flex justify-center items-center -mx-2 mt-1">
                <div className="flex-1/3 items-center space-x-2 px-2 py-2 bg-bground-100">
                  <button onClick={() => decrementScore(currentHole?.holeNumber)} className="bg-blue-100 hover:text-blue-100 hover:bg-pink-100 text-pink-100 py-4 px-4 rounded text-5xl flex-1/3">
                    -
                  </button>
                </div>
                <div className="flex-1/3 items-center px-2 py-2 bg-bground-100">
                <div className="text-l text-center font-bold text-5xl text-blue-100">{currentHole?.score}</div>
                      <div className="justify-center text-center text-2xl text-blue-100">Strokes</div>
                  </div>
            <div className="flex-1/3 items-center px-2 py-2 bg-bground-100">
                <button onClick={() => incrementScore(currentHole?.holeNumber)} className="bg-blue-100 hover:text-blue-100 hover:bg-green-100 text-green-100 py-4 px-4 rounded text-5xl flex-1/3">
                  +
                </button>
            </div>
          </div>
          </div>
          <div className="flex justify-center items-center space-x-4">
                <div className="px-2">
                  <div className={`text-l text-center font-bold text-2xl `}>{currentHole?.stablefordPoints}</div>
                  <div className="text-l text-center mt-1 text-1xl">Points</div>
                </div>

                <div className="px-2">
                <div className={`text-l text-center font-bold text-2xl`}>{totalPoints}</div>
                <div className="text-l text-center mt-1 text-1xl">Total Points</div>
                </div>

                <div className="px-2">
                <div className={`text-l text-center font-bold text-2xl`}>{totalScore}</div>
                  <div className="text-l text-center mt-1 text-1xl">Total Strokes</div>
                </div>
              </div>
            <div className="flex justify-center my-4">
            {currentHoleIndex > 0 && (
              <button onClick={goToPreviousHole} className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 border border-yellow-100 text-pink-100 py-1 px-3 rounded text-2xl mr-2">
                Previous
              </button>
            )}
            {currentHoleIndex < holesDetails.length - 1 && (
              <button onClick={goToNextHole} className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 border border-yellow-100 text-pink-100 py-1 px-3 rounded text-2xl">
                Next
              </button>
            )}
          </div>
          <GolferPairsInfo tripId={tripId} dayDate={scorecardData.groupDate} golferId={golferId} pairsDocId={pairsDocId} dayDocId={dayDocId} />
        </div>
    );
};

export default ScoreCardDisplay;