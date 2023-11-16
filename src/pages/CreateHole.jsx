
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { db } from '../firebase';
import { collection, doc, setDoc, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';


const CreateHole = ({ holeId }) => {
    const [golfTrips, setGolfTrips] = useState([]);
    const [courses, setCourses] = useState([]);
    const [tees, setTees] = useState([]);
    const [selectedGolfTripId, setSelectedGolfTripId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedTeeId, setSelectedTeeId] = useState('');

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
      }, [selectedGolfTripId, selectedCourseId]); // This will run when selectedCourseId changes


      const handleGolfTripChange = (event) => {
        const tripId = event.target.value;
        setSelectedGolfTripId(tripId);
        setSelectedCourseId(''); // Reset the selected course ID when the trip changes
      };
    
      const handleCourseChange = (event) => {
        setSelectedCourseId(event.target.value);
      };

      const handleTeeChange = (event) => {
        setSelectedTeeId(event.target.value);
      };

      const initialValues = {
        holes: Array.from({ length: 18 }, () => ({
            holeNumber: '',
            holeLength: '',
            holePar: '',
            holeIndex: '',
        })),
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        const batch = writeBatch(db); // Create a batch operation
    
        values.holes.forEach((hole, index) => {
          if (hole.holeLength && hole.holePar && hole.holeIndex) {
            const holeNumber = index + 1; // Assuming hole numbers start from 1
            const holeDocRef = doc(db, 'golfTrips', selectedGolfTripId, 'courses', selectedCourseId, 'tees', selectedTeeId, 'holes', `${holeNumber}`);
            batch.set(holeDocRef, { ...hole, holeNumber });
          }
        });
    
        try {
          await batch.commit(); // Commit the batch operation
          resetForm(initialValues);
        } catch (error) {
          console.error("Error adding holes: ", error);
        }
    
        setSubmitting(false);
      };
  
  return (
    <div>
      <h3>Create Hole</h3>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, isSubmitting }) => (
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

                {selectedCourseId && (
                    <>
                        <label htmlFor="teeSelect">Select Tee:</label>
                        <Field as="select" id="teeSelect" name="tee" onChange={handleTeeChange}>
                        <option value="">Select a tee</option>
                        {tees.map(tee => (
                            <option key={tee.id} value={tee.id}>{tee.teeName}</option>
                        ))}
                        </Field>
                    </>
                    )}
              </>
            )}
<FieldArray name="holes">
                            {({ insert, remove, push }) => (
                                <div>
                                    {values.holes.length > 0 &&
                                        values.holes.map((hole, index) => (
                                            <div key={index}>
                                                <label htmlFor={`holes.${index}.holeNumber`}>Hole Number</label>
                                                <Field name={`holes.${index}.holeNumber`} placeholder="Hole Number" />

                                                <label htmlFor={`holes.${index}.holeLength`}>Hole Length</label>
                                                <Field name={`holes.${index}.holeLength`} placeholder="Hole Length" />

                                                <label htmlFor={`holes.${index}.holePar`}>Hole Par</label>
                                                <Field name={`holes.${index}.holePar`} placeholder="Hole Par" />

                                                <label htmlFor={`holes.${index}.holeIndex`}>Hole Index</label>
                                                <Field name={`holes.${index}.holeIndex`} placeholder="Hole Index" />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </FieldArray>

                        <button type="submit" disabled={isSubmitting}>
                            Create Holes
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateHole;