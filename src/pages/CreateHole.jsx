import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CreateHole = () => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tees, setTees] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedTeeId, setSelectedTeeId] = useState('');
    const [holes, setHoles] = useState(Array.from({ length: 18 }, () => ({
        holeLength: '',
        holePar: '',
        holeIndex: '',
    })));

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
                setTees([]); // Clear tees if no course is selected
            }
        };
        fetchTees();
    }, [selectedGolfTripId, selectedCourseId]);

    const handleInputChange = (index, field, value) => {
        const newHoles = [...holes];
        newHoles[index][field] = value;
        setHoles(newHoles);
    };

    const handleSubmit = async () => {
        const batch = writeBatch(db);

        holes.forEach((hole, index) => {
            if (hole.holeLength && hole.holePar && hole.holeIndex) {
                const holeDocRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'holes', `${index + 1}`);
                batch.set(holeDocRef, { ...hole, holeNumber: index + 1 });
            }
        });

        try {
            await batch.commit();
            alert('Holes created successfully!');
        } catch (error) {
            console.error("Error adding holes: ", error);
        }
    };

    return (
        <div className="p-6 bg-bground-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-100">Create Holes</h2>
                {/* Golf Trip Selection */}
                <div className="mb-4">
                    <select
                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
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
                        <select
                            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
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
                        <select
                            className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
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
                {selectedTeeId && (
                    <div>
                        {holes.map((hole, index) => (
                            <div key={index} className="mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                        type="text"
                                        placeholder={`Hole ${index + 1} Length`}
                                        value={hole.holeLength}
                                        onChange={(e) => handleInputChange(index, 'holeLength', e.target.value)}
                                    />
                                    <input
                                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                                        type="text"
                                        placeholder={`Hole ${index + 1} Par`}
                                        value={hole.holePar}
                                        onChange={(e) => handleInputChange(index, 'holePar', e.target.value)}
                                    />
                                </div>
                                <input
                                    className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight mt-4"
                                    type="text"
                                    placeholder={`Hole ${index + 1} Index`}
                                    value={hole.holeIndex}
                                    onChange={(e) => handleInputChange(index, 'holeIndex', e.target.value)}
                                />
                            </div>
                        ))}
                        <button
                            className="bg-blue-100 text-white py-2 px-4 rounded hover:bg-blue-300 focus:outline-none focus:shadow-outline"
                            onClick={handleSubmit}
                        >
                            Submit Holes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateHole;
