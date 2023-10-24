import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function Header() {
    const [pageState, setPageState] = useState("Sign In");
    const location = useLocation()
    const navigate = useNavigate()
    const auth = getAuth();
    useEffect (()=>{
        onAuthStateChanged(auth, (user)=>{
            if(user){
                setPageState('Profile')
            }else{
                setPageState('Sign in')
            }
        })
    }, [auth])
    function pathMatchRoute(route){
        if(route === location.pathname){
            return true
        }
    }
  return (
    <div className='bg-white border-b shadow-sm sticky top-o z-50'>
        <header className='flex justify-between items-center
        px-3 max-w-6xl mx-auto'>
            <div>
                <img src="https://golf-trip-v1-storage-7ccb4a8094550-staging.s3.amazonaws.com/public/mygolftrip_logo.png"
                alt="logo"
                className="h-8 cursor-pointer"
                onClick={()=>navigate("/")}  />
            </div>
            <div>
                <ul className='flex space-x-10'>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/") && "text-black border-b-green-300"}`}
                        onClick={()=>navigate("/")} 
                        >Home</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/mytrips") && "text-black border-b-green-300"}`}
                        onClick={()=>navigate("/mytrips")} 
                        >MyTrips</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/leaderboard") && "text-black border-b-green-300"}`}
                        onClick={()=>navigate("/leaderboard")} 
                        >Leaderboard</li>
                    <li className={`cursor-pointer py-3 text-sm font-semibold
                        text-grey-400 border-b-[3px]
                        border-b-transparent
                        ${pathMatchRoute("/admin") && "text-black border-b-green-300"}`}
                        onClick={()=>navigate("/admin")} 
                        >Admin</li>
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
