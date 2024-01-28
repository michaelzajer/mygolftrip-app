/*
This page is called from ./pages/Admin.jsx it creates the golf course.

It also links to ./pages/CreateHole.jsx

*/

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CreateCourse = ({ golfTripId, courseId }) => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [courseLocation, setCourseLocation] = useState('');
    const [courseName, setCourseName] = useState('');

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

    const handleSelectChange = (event) => {
        setSelectedGolfTripId(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            let courseRef;
            if (courseId) {
                courseRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', courseId);
                await setDoc(courseRef, { courseLocation, courseName });
            } else {
                courseRef = collection(db, 'golfTrips', selectedGolfTripId, 'courses');
                await addDoc(courseRef, { courseLocation, courseName });
            }
            // Reset form fields after successful submission
            setCourseLocation('');
            setCourseName('');
        } catch (error) {
            console.error("Error adding/updating course: ", error);
        }
    };

    return (
        <div className="p-6 bg-bground-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-100">Create or Update Course</h2>

                <div className="mb-4">
                    <label htmlFor="golfTripSelect" className="block text-grey-700 text-sm font-bold mb-2">Select Golf Trip:</label>
                    <select
                        id="golfTripSelect"
                        className="shadow border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                        value={selectedGolfTripId}
                        onChange={handleSelectChange}
                    >
                        <option value="">Select a trip</option>
                        {golfTrips.map((trip) => (
                            <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
                        ))}
                    </select>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="courseLocation" className="block text-grey-700 text-sm font-bold mb-2">Location</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            id="courseLocation"
                            type="text"
                            placeholder="Course Location"
                            value={courseLocation}
                            onChange={(e) => setCourseLocation(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="courseName" className="block text-grey-700 text-sm font-bold mb-2">Course Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-700 leading-tight"
                            id="courseName"
                            type="text"
                            placeholder="Course Name"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-100 text-white py-2 px-4 rounded hover:bg-blue-300 focus:outline-none focus:shadow-outline"
                    >
                        {courseId ? 'Update Course' : 'Create Course'}
                    </button>
                </form>

                <div className="mt-4">
                    <Link to="/admin/createhole" className="text-blue-100 hover:text-blue-300 transition duration-200 ease-in-out">
                        Create Hole
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;