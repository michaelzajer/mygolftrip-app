import React from 'react';
import { Formik, Form, Field } from 'formik';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CreateCourse = ({ golfTripId, courseId }) => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');

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
        console.log('Selected Golf Trip ID:', event.target.value); // Log the selected ID
        setSelectedGolfTripId(event.target.value);
      };

  const initialValues = {
    courseLocation: '',
    courseName: ''
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let courseRef;
      if (courseId) {
        // If courseId is provided, get a reference to the existing document
        courseRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', courseId);
        await setDoc(courseRef, values);
      } else {
        // If no courseId, create a new document in courses collection
        courseRef = collection(db, 'golfTrips', selectedGolfTripId, 'courses');
        await addDoc(courseRef, values);
      }
      // Reset the form after successful submission
      resetForm();
    } catch (error) {
      console.error("Error adding/updating course: ", error);
    }
    setSubmitting(false); // Set submitting to false at the end of the function
  };

  return (
    <div>
      <h3>Create Course</h3>
      <label htmlFor="golfTripSelect">Select Golf Trip:</label>
      <select
        id="golfTripSelect"
        value={selectedGolfTripId}
        onChange={handleSelectChange}
      >
        <option value="">Select a trip</option>
        {golfTrips.map((trip) => (
          <option key={trip.id} value={trip.id}>
            {trip.golfTripName}
          </option>
        ))}
      </select>
      <div>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="courseLocation">Location</label>
            <Field id="courseLocation" name="courseLocation" placeholder="Course Location" />
            <label htmlFor="courseName">Course Name</label>
            <Field id="courseName" name="courseName" placeholder="Course Name" />
            <button type="submit" disabled={isSubmitting}>
              {courseId ? 'Update Course' : 'Create Course'}
            </button>
          </Form>
        )}
      </Formik>
      </div>
      <div>
      <Link to="/admin/createhole"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Hole
  </Link>
      </div>
    </div>
  );
};

export default CreateCourse;
