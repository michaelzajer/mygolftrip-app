import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import Header from "./components/Header";
import Mytrips from "./pages/Mytrips";
import LeaderBoard from "./pages/LeaderboardGroups";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./components/PrivateRoute";
import Admin from "./pages/Admin";
import CreateGolfer from "./pages/CreateGolfer";
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

function App() {
  return (

    <>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/sign-in" element={<SignIn/>} />
          <Route path="/sign-up" element={<SignUp/>} />
          <Route path="/profile" element={<PrivateRoute/>}>
            <Route path="/profile" element={<Profile/>} />
          </Route>
          <Route path="/mytrips" element={<PrivateRoute/>}>
            <Route path="/mytrips" element={<Mytrips/>} />
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
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="" element={<Admin/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/createtrip" element={<CreateTrip/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/triplist" element={<TripList/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/scheduletrip" element={<AdminSchedulePage/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/createcourse" element={<CreateCourse/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/createhole" element={<CreateHole/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/createtee" element={<CreateTeeBlock/>} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/scorecard" element={<AdminScoreCard />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute allowedUserId="orGREHRCTCgFgfeijAcxIFjN8TC3" />}>
          <Route path="/admin/adddailyhcp" element={<AdminDailyHcp />} />
          </Route>
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
