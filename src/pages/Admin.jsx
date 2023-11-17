import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <div>Admin
   <Link to="/admin/createtrip"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Trip
  </Link>
   
  <Link to="/admin/scheduletrip"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Schedule
  </Link>
  <Link to="/admin/createcourse"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Course
  </Link>
  <Link to="/admin/createhole"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Hole
  </Link>
  <Link to="/admin/createtee"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Create Tee
  </Link>
  <Link to="/admin/triplist"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    List Trip
  </Link>
  <Link to="/admin/scorecard"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Admin Scorecard
  </Link>
  <Link to="/admin/adddailyhcp"
    className="text-green-300 hover:text-blue-200 transition duration-200 ease-in-out ml-1"
  >
    Admin Add Daily Hcp
  </Link>
  </div>
  )
}
