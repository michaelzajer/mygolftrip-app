/*
This page is the main Admin page. This page calls

./pages/CreateTrip.jsx
./pages/CreateCourse.jsx
./pages/CreateTeeBlock.js
./pages/CreateHole.jsx
./pages/TripList.jsx
./pages/SendInvite.jsx
./pages/AdminScoreCard.jsx
./pages/AdminDailyHcp.jsx
./pages/CreateTeam.jsx

*/
import { Link } from "react-router-dom";
import { BsFillGearFill } from "react-icons/bs"; // Import Gear icon for settings

export default function Admin() {
  return (
    <div className="p-6 bg-bground-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-100 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminLink to="/admin/createtrip" text="1. Create Trip" />
        <AdminLink to="/admin/createcourse" text="2. Create Course" />
        <AdminLink to="/admin/createtee" text="3. Create Tee" />
        <AdminLink to="/admin/createhole" text="4. Create Hole" />
        <AdminLink to="/admin/triplist" text="List Trip" />
        <AdminLink to="/admin/tripinvite" text="Send Golf Trip Invite" />
        <AdminLink to="/admin/scorecard" text="Admin Scorecard" />
        <AdminLink to="/admin/adddailyhcp" text="Admin Add Daily Hcp" />
        <AdminLink to="/admin/createteam" text="Admin Create Team" />
        <AdminLink to="/admin/editteam" text="Admin Edit Team" />
        <AdminLink to="/admin/createdaypair" text="Admin Create Day/Pair" />
      </div>
    </div>
  );
}

const AdminLink = ({ to, text }) => (
  <Link to={to}
    className="bg-white border border-blue-100 text-blue-100 hover:bg-blue-100 hover:text-white transition duration-200 ease-in-out p-4 rounded-lg shadow-md flex items-center justify-between"
  >
    <span className="font-medium">{text}</span>
    <BsFillGearFill className="text-xl" />
  </Link>
);