import Moment from "react-moment";
import { LiaGolfBallSolid } from 'react-icons/lia'

export default function ListingItem({ golfer, id } ) {
    return (
    
    <div className='bg-blue-100 flex flex-col justify-between
    items-center shadow-md hover:shadow-xl rounded-md overflow-hidden
        transition-shadow duration-150 ease-in-out'>
        <div className=''>
            <p className="text-2xl text-center mt-3 font-bold
             text-green-300">
              {golfer.name}
            </p> 
            <div className="font-semibold flex">Golf Link No:
                <div className="font-normal">{golfer.golfLinkNo}</div> 
            </div>
            <div className="font-semibold flex">GA Handicap:
                <div className="font-normal">{golfer.handicapGA}</div>
            </div>   
        </div>
      <Moment fromNow>
        {golfer.timestamp?.toDate()}
      </Moment><LiaGolfBallSolid />
    </div>
    );
  }
  