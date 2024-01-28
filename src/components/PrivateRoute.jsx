/*
This is the Private Route controller for the navigation in the header.

*/

import { Outlet, Navigate } from "react-router-dom";
import { useAuthStatus } from "../hooks/useAuthStatus";
import Spinner from "./Spinner";
import { getAuth } from "firebase/auth";

// Add allowedUserId as a prop
export default function PrivateRoute({ allowedUserId }) {
  const { loggedIn, checkingStatus } = useAuthStatus();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (checkingStatus) {
    return <Spinner />;
  }

  // Check if logged in and if a specific user ID is required, verify it matches the current user's ID
  if (loggedIn && (!allowedUserId || (allowedUserId && currentUser && currentUser.uid === allowedUserId))) {
    return <Outlet />;
  }

  return <Navigate to="/sign-in" />;
}