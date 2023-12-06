import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CreateTeeBlock = () => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [teeName, setTeeName] = useState('');
    const [scratchRating, setScratchRating] = useState('');
    const [slopeRating, setSlopeRating] = useState('');

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

    const handleSubmit = async () => {
        try {
            const teeRef = collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees');
            await addDoc(teeRef, {
                teeName,
                scratchRating,
                slopeRating,
            });
            alert('Tee block created successfully!');
        } catch (error) {
            console.error("Error adding tee block: ", error);
        }
    };

    return (
        <div className="p-6 bg-bground-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-100">Create Tee Block</h2>
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

                {/* Tee Block Details */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <input
                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        type="text"
                        placeholder="Tee Name"
                        value={teeName}
                        onChange={(e) => setTeeName(e.target.value)}
                    />
                    <input
                        className="shadow border rounded w-full py-2 px-3 text-grey-700
                        leading-tight"
                        type="text"
                        placeholder="Scratch Rating"
                        value={scratchRating}
                        onChange={(e) => setScratchRating(e.target.value)}
                    />
                    <input
                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        type="text"
                        placeholder="Slope Rating"
                        value={slopeRating}
                        onChange={(e) => setSlopeRating(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button
                    className="bg-blue-100 text-white py-2 px-4 rounded hover:bg-blue-300 focus:outline-none focus:shadow-outline"
                    onClick={handleSubmit}
                >
                    Create Tee Block
                </button>

                {/* Navigation Link */}
                <div className="mt-4">
                    <Link
                        to="/admin/createhole"
                        className="text-blue-100 hover:text-blue-300 transition duration-200 ease-in-out"
                    >
                        Go to Create Hole
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateTeeBlock;