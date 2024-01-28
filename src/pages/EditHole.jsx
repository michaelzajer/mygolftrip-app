/*
This page is called from ./pages/Admin.jsx it edits the holes on a course.

It is also called from ./pages/CreateTeeBlock.jsx

*/

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

const EditHole = () => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tees, setTees] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedTeeId, setSelectedTeeId] = useState('');
    const [holes, setHoles] = useState([]);

    useEffect(() => {
        const fetchGolfTrips = async () => {
            const querySnapshot = await getDocs(collection(db, 'golfTrips'));
            const trips = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setGolfTrips(trips);
        };
        fetchGolfTrips();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            if (selectedGolfTripId) {
                const coursesSnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses'));
                setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                setCourses([]);
            }
        };
        fetchCourses();
    }, [selectedGolfTripId]);

    useEffect(() => {
        const fetchTees = async () => {
            if (selectedCourseId) {
                const teesSnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees'));
                setTees(teesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                setTees([]);
            }
        };
        fetchTees();
    }, [selectedCourseId]);

    useEffect(() => {
        const fetchHoles = async () => {
            if (selectedTeeId) {
                const holesSnapshot = await getDocs(collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'holes'));
                const fetchedHoles = holesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    isCttp: doc.data().isCttp || false, // Ensure isCttp is a boolean
                })).sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Sort holes by their IDs;
                setHoles(fetchedHoles);
            }
        };
        fetchHoles();
    }, [selectedTeeId]);

    const handleInputChange = (index, field, value) => {
        const updatedHoles = holes.map((hole, idx) => (
            idx === index ? { ...hole, [field]: value } : hole
        ));
        setHoles(updatedHoles);
    };
    
    const handleCttpChange = (index) => {
        const updatedHoles = holes.map((hole, idx) => (
            idx === index ? { ...hole, isCttp: !hole.isCttp } : hole
        ));
        setHoles(updatedHoles);
    };
    
    const handleSubmit = async () => {
        try {
            await Promise.all(holes.map((hole) => {
                const holeDocRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'holes', hole.id);
                return updateDoc(holeDocRef, hole);
            }));
            alert('Holes updated successfully!');
        } catch (error) {
            console.error("Error updating holes: ", error);
            alert('Failed to update holes!');
        }
    };

    return (
        <div className="p-6 bg-bground-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-100">Edit Holes</h2>
                {/* Golf Trip Selection */}
                    <div className="mb-4">
                    <label>Golf Trip</label>
                    <select
                    value={selectedGolfTripId}
                    onChange={(e) => setSelectedGolfTripId(e.target.value)}
                    >
                    <option value="">Select a Golf Trip</option>
                    {golfTrips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
                    ))}
                    </select>
                    </div>
                     {/* Course Selection */}
            {selectedGolfTripId && (
                <div className="mb-4">
                    <label>Course</label>
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="">Select a Course</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.courseName}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Tee Selection */}
            {selectedCourseId && (
                <div className="mb-4">
                    <label>Tee</label>
                    <select
                        value={selectedTeeId}
                        onChange={(e) => setSelectedTeeId(e.target.value)}
                    >
                        <option value="">Select a Tee</option>
                        {tees.map(tee => (
                            <option key={tee.id} value={tee.id}>{tee.teeName}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Holes Input */}
            {selectedTeeId && holes.map((hole, index) => (
                <div key={index} className="mb-4 grid grid-cols-3 gap-4">
                    <input
                        type="number"
                        placeholder={`Hole ${index + 1} Length`}
                        value={hole.holeLength}
                        onChange={(e) => handleInputChange(index, 'holeLength', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder={`Hole ${index + 1} Par`}
                        value={hole.holePar}
                        onChange={(e) => handleInputChange(index, 'holePar', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder={`Hole ${index + 1} Index`}
                        value={hole.holeIndex}
                        onChange={(e) => handleInputChange(index, 'holeIndex', e.target.value)}
                    />
                    <label>
                    <input
                        type="checkbox"
                        checked={hole.isCttp}
                        onChange={() => handleCttpChange(index)}
                    />
                    CTTP
                </label>
                </div>
            ))}
            <button onClick={handleSubmit}>Update Holes</button>
        </div>
    </div>
    );
};
export default EditHole;