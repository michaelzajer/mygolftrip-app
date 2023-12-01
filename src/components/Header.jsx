import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Header() {
    const [pageState, setPageState] = useState("Sign In");
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation()
    const navigate = useNavigate()
    const auth = getAuth();

    const ADMIN_USER_ID = "orGREHRCTCgFgfeijAcxIFjN8TC3"; // Replace with your admin user ID

    useEffect (()=>{
        onAuthStateChanged(auth, (user)=>{
            if(user){
                setPageState('Profile');
                setIsAdmin(user.uid === ADMIN_USER_ID); // Set isAdmin based on whether the user is admin
            }else{
                setPageState('Sign in');
                setIsAdmin(false); // Not logged in, so definitely not admin
            }
        })
    }, [auth])
    function pathMatchRoute(route){
        if(route === location.pathname){
            return true
        }
    }
  return (
    <div className='bg-bground-100 border-b shadow-sm sticky top-o z-40'>
        <header className='flex justify-between items-center
        px-3 max-w-6xl mx-auto'>
            <div>
                <img src="/mygolftrip_logo2.svg"
                alt="logo"
                className="h-8 cursor-pointer bg-blue-100"
                onClick={()=>navigate("/")}  />
            </div>
            <div>
                <ul className='flex space-x-10'>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/") && "text-blue-100 border-b-green-100"}`}
                        onClick={()=>navigate("/")} 
                        >Home</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/mytrips") && "text-blue-100 border-b-green-100"}`}
                        onClick={()=>navigate("/mytrips")} 
                        >MyTrips</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/leaderboard") && "text-blue-100 border-b-green-100"}`}
                        onClick={()=>navigate("/leaderboard")} 
                        >Leaderboard</li>
                    {isAdmin && ( // This will only render if isAdmin is true
                        <li className={`cursor-pointer py-3 text-sm font-semibold
                            text-grey-400 border-b-[3px]
                            border-b-transparent
                            ${pathMatchRoute("/admin") && "text-blue-100 border-b-green-100"}`}
                            onClick={()=>navigate("/admin")} 
                            >Admin</li>
                    )}
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${
                            (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) 
                            && "text-black border-b-green-300"}`}
                        onClick={()=>navigate("/profile")} 
                    >
                           {pageState}
                    </li>
                </ul>
            </div>
        </header>
    </div>
  )
}
