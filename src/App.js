/*
This is the main App.jsx for the site.

*/

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
import CreateCourse from "./pages/CreateCourse";
import CreateHole from "./pages/CreateHole";
import EditHole from "./pages/EditHole";
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
import CreateTeam from "./pages/CreateTeam";
import EditTeam from "./pages/EditTeam";
import DaysPairs from "./pages/DaysPairs";
import CreateDaysPairs from "./pages/CreateDayPair";


function App() {
  const [isAdmin, setIsAdmin] = useState(false);
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
          <Route path="/dayspairs" element={<PrivateRoute/>}>
            <Route path='/dayspairs' element={<DaysPairs />} />
          </Route>
          {isAdmin && (
            <Route path="/admin" element={<PrivateRoute />}>
              <Route path="" element={<Admin/>} />
              <Route path="/admin/createtrip" element={<CreateTrip/>} />
              <Route path="/admin/triplist" element={<TripList/>} />
              <Route path="/admin/edit-trip" element={<EditTrip/>} />
              <Route path="/admin/tripinvite" element={<SendInvite/>} />
              <Route path="/admin/createcourse" element={<CreateCourse/>} />
              <Route path="/admin/createhole" element={<CreateHole/>} />
              <Route path="/admin/edithole" element={<EditHole/>} />
              <Route path="/admin/createtee" element={<CreateTeeBlock/>} />
              <Route path="/admin/scorecard" element={<AdminScoreCard />} />
              <Route path="/admin/adddailyhcp" element={<AdminDailyHcp />} />
              <Route path="/admin/createteam" element={<CreateTeam />} />
              <Route path="/admin/editteam" element={<EditTeam />} />
              <Route path="/admin/createdaypair" element={<CreateDaysPairs />} />
            </Route>
          )}
        
          <Route path="/ForgotPassword" element={<ForgotPassword/>} />
        </Routes>
      </Router>
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
