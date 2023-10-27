import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import Header from "./components/Header";
import Mytrips from "./pages/Mytrips";
import Leaderboard from "./pages/Leaderboard";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from "./components/PrivateRoute";
import Admin from "./pages/Admin";
import CreateGolfer from "./pages/CreateGolfer";

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
          <Route path="/leaderboard" element={<PrivateRoute/>}>
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute/>}>
            <Route path="/admin" element={<Admin/>} />
          </Route>
          <Route path="/create-golfer" element={<CreateGolfer />}>
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
