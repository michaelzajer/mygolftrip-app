import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';

const ViewRound = ({ dGroupId, dGolferId, golfTripId, onClose }) => {
  const [scorecard, setScorecard] = useState(null);
  const [holesDetailsMap, setHolesDetailsMap] = useState({});
  const [editHole, setEditHole] = useState(null);
  const [inputScore, setInputScore] = useState('');

  useEffect(() => {
    const fetchScorecard = async () => {
      const scorecardsRef = collection(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards');
      const snapshot = await getDocs(scorecardsRef);
      if (!snapshot.empty) {
        const scorecardData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        if (Array.isArray(scorecardData.holes)) {
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
         
        } else {
          console.error('scorecardData.holes is not an array', scorecardData.holes);
        }
      } else {
        console.error('No scorecard found');
      }
    };
  
    fetchScorecard();
  }, [golfTripId, dGroupId, dGolferId]);

  const calculateStablefordPoints = (score, par, dailyHcp, holeIndex) => {
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

  const handleScoreUpdate = async (holeNumber, score) => {
    // Find the hole details
    const holeDetail = holesDetailsMap[holeNumber];
    if (!holeDetail) {
      console.error('Hole details not found');
      return;
    }
  
    // Calculate the Stableford points for the new score
    const newStablefordPoints = calculateStablefordPoints(score, holeDetail.holePar, scorecard.dailyHandicap, holeDetail.holeIndex);
    // Update the score and Stableford points in Firestore and local state
    const scorecardRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards', scorecard.id);
    const updates = {
      [`scores.${holeNumber}`]: score,
      [`stablefordPoints.${holeNumber}`]: newStablefordPoints,
    };
  
    await updateDoc(scorecardRef, updates);
  
    setScorecard((prev) => ({
      ...prev,
      scores: { ...prev.scores, [holeNumber]: score },
      stablefordPoints: { ...prev.stablefordPoints, [holeNumber]: newStablefordPoints },
    }));
  
    // Reset the input field
    setInputScore('');
  };

  const getTotalScore = () => {
    return scorecard ? Object.values(scorecard.scores).reduce((total, score) => total + (score || 0), 0) : 0;
  };

  const renderEditForm = (holeNumber) => {
    return (
      <div className="col-span-12 flex justify-between items-center">
        <div className="col-span-3"> {/* Placeholder for Hole, Par, Index columns */}</div>
        <input
          type="number"
          value={inputScore}
          onChange={(e) => setInputScore(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-full col-span-3"
        />
        <div className="col-span-3"> {/* Placeholder for Points column */}</div>
        <div className="flex space-x-2 col-span-3">
          <button
            type="button"
            onClick={() => handleScoreUpdate(holeNumber, Number(inputScore))}
            className="bg-green-100 hover:bg-green-200 text-white py-1 px-2 rounded text-xs"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => {
              setEditHole(null);
              setInputScore('');
            }}
            className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-bground-100 shadow-lg rounded-lg">
      <div className="bg-blue-100 text-yellow-100 text-center py-2 rounded-t-lg">
        <h3 className="text-xl font-semibold">View Round</h3>
      </div>
      <div className="p-4">
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded mb-4"
        >
          Close
        </button>
  
        {/* Column Headers */}
        <div className="flex justify-between mb-4 text-sm sm:text-sm lg:text-m font-medium text-center border-b">
          <div className="w-1/12 text-center">Hole</div>
          <div className="w-1/12 text-center">Par</div>
          <div className="w-1/12 text-center">Index</div>
          <div className="w-1/12 text-center">Strokes</div>
          <div className="w-1/12 text-center">Points</div>
          <div className="w-3/12 text-center">Action</div>
        </div>
  
        {/* Score Rows */}
        {scorecard && Object.keys(holesDetailsMap)
          .sort((a, b) => holesDetailsMap[a].holeNumber - holesDetailsMap[b].holeNumber)
          .map((holeId) => {
            const holeDetail = holesDetailsMap[holeId];
            const score = scorecard.scores[holeId];
            return (
              <div key={holeId} className="flex justify-between items-center mb-2 text-sm sm:text-sm lg:text-m">
                <div className="w-1/12 text-center">{holeDetail.holeNumber}</div>
                <div className="w-1/12 text-center">{holeDetail.holePar}</div>
                <div className="w-1/12 text-center">{holeDetail.holeIndex}</div>
                <div className="w-1/12 text-center">
                  {editHole === holeDetail.holeNumber ? (
                    <input
                      type="number"
                      value={inputScore}
                      onChange={(e) => setInputScore(e.target.value)}
                      className="border rounded px-2 py-1 w-16 sm:w-16 text-sm sm:text-sm lg:text-m"
                      />
                  ) : (
                    <span className="text-center">{score !== undefined ? score : 'Incomplete'}</span>
                  )}
                </div>
                <div className="w-1/12 text-center">
                  <span>{scorecard.stablefordPoints[holeId] !== undefined ? scorecard.stablefordPoints[holeId] : '0'}</span>
                </div>
                <div className="w-3/12 text-center">
                  {editHole === holeDetail.holeNumber ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleScoreUpdate(holeDetail.holeNumber, Number(inputScore))}
                        className="bg-green-100 hover:bg-green-100 text-blue-100 hover:text-pink-100 py-1 px-2 rounded text-sm sm:text-sm lg:text-m sm:px-3"
                        >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditHole(null);
                          setInputScore(score.toString());
                        }}
                        className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-sm sm:text-sm lg:text-m"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setEditHole(holeDetail.holeNumber)}
                      className="bg-blue-100 hover:bg-yellow-100 hover:text-blue-100 text-white py-1 px-2 rounded text-sm sm:text-sm lg:text-m"
                    >
                      Edit Strokes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        <div className="font-semibold text-center text-sm sm:text-sm lg:text-m">
          Total Score: {getTotalScore()}
        </div>
      </div>
    </div>
  );
};

export default ViewRound;