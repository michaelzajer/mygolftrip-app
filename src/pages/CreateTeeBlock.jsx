
import React from 'react';
import { Formik, Form, Field } from 'formik';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CreateTeeBlock = ({ teeId }) => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');

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
          }
        };
    
        fetchCourses();
      }, [selectedGolfTripId]);

      const handleGolfTripChange = (event) => {
        const tripId = event.target.value;
        setSelectedGolfTripId(tripId);
        setSelectedCourseId(''); // Reset the selected course ID when the trip changes
      };
    
      const handleCourseChange = (event) => {
        setSelectedCourseId(event.target.value);
      };

      const initialValues = {
        teeName: '',
        scratchRating: '',
        slopeRating: '',
      };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let teeRef;
      if (teeId) {
        // If courseId is provided, get a reference to the existing document
        teeRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', teeId);
        await setDoc(teeRef, values);
      } else {
        // If no courseId, create a new document in courses collection
        teeRef = collection(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees');
        await addDoc(teeRef, values);
      }
      // Reset the form after successful submission
      resetForm();
    } catch (error) {
      console.error("Error adding/updating hole: ", error);
    }
    setSubmitting(false); // Set submitting to false at the end of the function
  };
  
  return (
    <div>
      <h3>Create Tee</h3>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="golfTripSelect">Select Golf Trip:</label>
            <Field as="select" id="golfTripSelect" name="golfTrip" onChange={handleGolfTripChange}>
              <option value="">Select a trip</option>
              {golfTrips.map(trip => (
                <option key={trip.id} value={trip.id}>{trip.golfTripName}</option>
              ))}
            </Field>

            {selectedGolfTripId && (
              <>
                <label htmlFor="courseSelect">Select Course:</label>
                <Field as="select" id="courseSelect" name="course" onChange={handleCourseChange}>
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.courseName}</option>
                  ))}
                </Field>
              </>
            )}

            <label htmlFor="teeName">Tee Name</label>
            <Field id="teeName" name="teeName" placeholder="Tee Name" />
            
            <label htmlFor="scratchRating">Scratch Rating</label>
            <Field id="scratchRating" name="scratchRating" placeholder="Scratch Rating" />
            
            <label htmlFor="slopeRating">Slope Rating</label>
            <Field id="slopeRating" name="slopeRating" placeholder="Slope Rating" />
            
            <button type="submit" disabled={isSubmitting}>
              {teeId ? 'Update Tee' : 'Save Tee'}
            </button>
          </Form>
        )}
      </Formik>

      <Link to="/admin/createhole" className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1">
        Create Hole
      </Link>
    </div>
  );
};

export default CreateTeeBlock;