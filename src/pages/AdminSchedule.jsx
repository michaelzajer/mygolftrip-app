import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Ensure this path is correct
import { collection, getDocs, addDoc } from 'firebase/firestore';
import moment from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const AdminSchedulePage = () => {
  const [golfTrips, setGolfTrips] = useState([]);
  const [selectedGolfTripId, setSelectedGolfTripId] = useState('');

  useEffect(() => {
    const fetchGolfTrips = async () => {
      const querySnapshot = await getDocs(collection(db, 'golfTrips'));
      const trips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched golf trips:', trips); // Log the fetched trips
      setGolfTrips(trips);
    };
  
    fetchGolfTrips();
  }, []);

  const handleSelectChange = (event) => {
    console.log('Selected Golf Trip ID:', event.target.value); // Log the selected ID
    setSelectedGolfTripId(event.target.value);
  };

  const scheduleSchema = Yup.object().shape({
    arrivalDate: Yup.date().required('Arrival date is required'),
    arrivalTime: Yup.string().required('Arrival time is required'),
    courseName: Yup.string().required('Course name is required'),
    teeTime: Yup.string().required('Tee time is required'),
  });

  const addSchedule = async (values, actions) => {
    try {
      const scheduleData = {
        ...values,
        arrivalDate: moment(values.arrivalDate).format('YYYY-MM-DD'),
        teeTime: moment(values.teeTime, 'HH:mm').format('HH:mm'), // assuming tee time is just a time without a date
      };
      console.log('Adding schedule:', scheduleData); // Log the data being sent
  
      await addDoc(collection(db, `golfTrips/${selectedGolfTripId}/schedule`), scheduleData);
      actions.resetForm();
      alert('Schedule added successfully!');
    } catch (error) {
      console.error('Failed to add schedule:', error); // Log any errors
      alert('Failed to add schedule: ', error.message);
    }
  };

  return (
    <div>
      <h1>Admin Schedule Page</h1>

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

      {selectedGolfTripId && (
        <Formik
          initialValues={{
            arrivalDate: '',
            arrivalTime: '',
            courseName: '',
            teeTime: '',
          }}
          validationSchema={scheduleSchema}
          onSubmit={addSchedule}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field type="date" name="arrivalDate" />
              <ErrorMessage name="arrivalDate" component="div" />

              <Field type="time" name="arrivalTime" />
              <ErrorMessage name="arrivalTime" component="div" />

              <Field type="text" name="courseName" placeholder="Course Name" />
              <ErrorMessage name="courseName" component="div" />

              <Field type="time" name="teeTime" placeholder="Tee Time" />
              <ErrorMessage name="teeTime" component="div" />

              <button type="submit" disabled={isSubmitting}>
                Add Schedule
              </button>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default AdminSchedulePage;
