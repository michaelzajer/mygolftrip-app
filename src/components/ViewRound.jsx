import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { Formik, Field, Form } from 'formik';

const ViewRound = ({ dGroupId, dGolferId, golfTripId, onClose }) => {
  const [scorecard, setScorecard] = useState(null);
  const [holesDetailsMap, setHolesDetailsMap] = useState({});
  const [editHole, setEditHole] = useState(null);

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
      }
    };

    fetchScorecard();
  }, [golfTripId, dGroupId, dGolferId]);

  const handleScoreUpdate = async (holeNumber, score) => {
    const holeId = Object.keys(holesDetailsMap).find(key => holesDetailsMap[key].holeNumber === holeNumber);
    const updatedScores = {
      ...scorecard.scores,
      [holeId]: score,
    };

    const scorecardRef = doc(db, 'golfTrips', golfTripId, 'groups', dGroupId, 'golfers', dGolferId, 'scorecards', scorecard.id);
    await updateDoc(scorecardRef, { scores: updatedScores });

    setScorecard({
      ...scorecard,
      scores: updatedScores,
    });
    setEditHole(null);
  };

  const getTotalScore = () => {
    // Check if scorecard is not null before trying to access its properties
    return scorecard ? Object.values(scorecard.scores).reduce((total, score) => total + (score || 0), 0) : 0;
  };

  const renderEditForm = (holeNumber) => {
    const initialScore = scorecard.scores[holeNumber]?.toString() || '';
    return (
      <Formik
        initialValues={{ score: initialScore }}
        onSubmit={({ score }, { setSubmitting }) => {
          handleScoreUpdate(holeNumber, Number(score));
          setSubmitting(false);
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <Form className="flex items-center space-x-2">
            <Field 
              type="number" 
              name="score" 
              className="border rounded px-2 py-1 text-sm"
              onChange={handleChange}
              value={values.score}
              style={{ maxWidth: '60px' }} // Set a max-width to prevent spilling over
            />
            <button 
              type="submit" 
              className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
              disabled={isSubmitting}
            >
              Update
            </button>
            <button 
              type="button" 
              className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs"
              onClick={() => setEditHole(null)}
            >
              Cancel
            </button>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="bg-blue-500 text-white text-center py-2 rounded-t-lg">
        <h3 className="text-xl font-semibold">View Round</h3>
      </div>
      <div className="p-4">
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded mb-4"
        >
          Close
        </button>
  
        <div className="grid grid-cols-12 gap-1 mb-4 font-semibold">
          <div className="col-span-1">Hole</div>
          <div className="col-span-1">Par</div>
          <div className="col-span-1">Index</div>
          <div className="col-span-3">Score</div>
          <div className="col-span-1">Action</div>
        </div>
  
        {scorecard && Object.keys(holesDetailsMap)
          .sort((a, b) => holesDetailsMap[a].holeNumber - holesDetailsMap[b].holeNumber)
          .map((holeId) => {
            const holeDetail = holesDetailsMap[holeId];
            const score = scorecard.scores[holeId];
            return (
              <div key={holeId} className="grid grid-cols-12 gap-1 mb-2">
                <div className="col-span-1 ">
                  {holeDetail.holeNumber}
                </div>
                <div className="col-span-1 ">
                  {holeDetail.holePar}
                </div>
                <div className="col-span-1 ">
                  {holeDetail.holeIndex}
                </div>
                <div className="col-span-3">
                  {editHole === holeDetail.holeNumber ? (
                    renderEditForm(holeDetail.holeNumber)
                  ) : (
                    <div className="">
                      {score !== undefined ? score : 'Incomplete'}
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 ">
                  {editHole !== holeDetail.holeNumber && (
                    <button 
                      onClick={() => setEditHole(holeDetail.holeNumber)}
                      className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
              {/* After the map function that renders each hole's details */}
          <div className="grid grid-cols-10 gap-1 mb-2 items-left">
            <div className="col-span-2 text-right font-semibold">
              Total Score:
            </div>
            <div className="col-span-2 text-left font-semibold">
              {getTotalScore()}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ViewRound;