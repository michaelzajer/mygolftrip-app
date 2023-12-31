import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import Header from "./components/Header";
import Mytrips from "./pages/Mytrips";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./components/PrivateRoute";
import Admin from "./pages/Admin";
import CreateTrip from "./pages/CreateTrip";
import TripList from "./pages/TripList";
import LeaderBoardGroups from "./pages/LeaderboardGroups";
import LeaderboardDate from "./pages/LeaderboardDate";
import LeaderboardOverall from "./pages/LeaderboardOverall";
import Leaderboards from "./pages/Leaderboards";
import AdminSchedulePage from "./pages/AdminSchedule";
import CreateCourse from "./pages/CreateCourse";
import CreateHole from "./pages/CreateHole";
import CreateTeeBlock from "./pages/CreateTeeBlock";
import ScoreCard from "./components/ScoreCard";
import AdminScoreCard from "./pages/AdminScoreCard";
import AdminDailyHcp from "./pages/AdminDailyHcp";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from './firebase'; // Adjust this path to point to your firebase configuration
import EditTrip from "./pages/EditTrip";
import SendInvite from "./pages/SendInvite";
import JoinTrip from "./pages/JoinTrip";
import About from "./pages/About"
import { co2 } from '@tgwf/co2';
import Footer from './pages/Footer'; // Adjust the import path as needed


function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [co2Total, setCo2Total] = useState(0); // State to track total CO2 emissions
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const userRef = doc(db, "golfers", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Set isAdmin based on the user's data
          setIsAdmin(userSnap.data().isAdmin || false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  async function fetchWithCO2Estimation(url) {
    const response = await fetch(url);
    const dataSize = parseInt(response.headers['content-length'], 10); // Size in bytes
  
    const co2Emission = co2.perByte(dataSize);
    setCo2Total(prevTotal => prevTotal + co2Emission); // Accumulate CO2 emissions
    console.log(`CO2 Emissions for ${dataSize} bytes of data from ${url}:`, co2Emission);
  
    return response;
  }

  function CO2EmissionsDisplay({ co2Total }) {
    return (
      <div>
        Estimated CO2 emissions for this session: {co2Total.toFixed(2)} grams
      </div>
    );
  }

  return (

    <>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/sign-in" element={<SignIn/>} />
          <Route path="/sign-up" element={<SignUp/>} />
          <Route path="/profile" element={<PrivateRoute/>}>
            <Route path="/profile" element={<Profile/>} />
          </Route>
          <Route path="/mytrips" element={<PrivateRoute/>}>
            <Route path="/mytrips" element={<Mytrips/>} />
          </Route>
          <Route path="/join-trip" element={<PrivateRoute/>}>
            <Route path="/join-trip" element={<JoinTrip/>} />
          </Route>
          <Route path="/mytrips" element={<PrivateRoute/>}>
            <Route path="/mytrips/scorecard" element={<ScoreCard />} />
          </Route>
          <Route path="/leaderboard" element={<PrivateRoute/>}>
            <Route path="/leaderboard" element={<Leaderboards />} />
          </Route>
          <Route path="/leaderboardgroups" element={<PrivateRoute/>}>
            <Route path="/leaderboardgroups" element={<LeaderBoardGroups />} />
          </Route>
          <Route path="/leaderboarddate" element={<PrivateRoute/>}>
            <Route path="/leaderboarddate" element={<LeaderboardDate />} />
          </Route>
          <Route path="/leaderboardoverall" element={<PrivateRoute/>}>
            <Route path="/leaderboardoverall" element={<LeaderboardOverall />} />
          </Route>
          {isAdmin && (
            <Route path="/admin" element={<PrivateRoute />}>
              <Route path="" element={<Admin/>} />
              <Route path="/admin/createtrip" element={<CreateTrip/>} />
              <Route path="/admin/triplist" element={<TripList/>} />
              <Route path="/admin/edit-trip" element={<EditTrip/>} />
              <Route path="/admin/tripinvite" element={<SendInvite/>} />
              <Route path="/admin/scheduletrip" element={<AdminSchedulePage/>} />
              <Route path="/admin/createcourse" element={<CreateCourse/>} />
              <Route path="/admin/createhole" element={<CreateHole/>} />
              <Route path="/admin/createtee" element={<CreateTeeBlock/>} />
              <Route path="/admin/scorecard" element={<AdminScoreCard />} />
              <Route path="/admin/adddailyhcp" element={<AdminDailyHcp />} />
            </Route>
          )}
        
          <Route path="/ForgotPassword" element={<ForgotPassword/>} />
        </Routes>
      </Router>
      <Footer co2Total={co2Total} /> {/* Include the footer with CO2 emissions display */}
      <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
       />
    </>
 
  );
}

export default App;
