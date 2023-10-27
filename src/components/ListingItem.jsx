import Moment from "react-moment";
import { LiaGolfBallSolid } from 'react-icons/lia'

export default function ListingItem({ listing, id } ) {
    return <li>
      {listing.name}
      {listing.golfLinkNo}
      {listing.handicapGA}
      <Moment fromNow>
        {listing.timestamp?.toDate()}
      </Moment>
      <div className=''>
        <div className=''>
        <LiaGolfBallSolid />
        </div>
      </div>
    </li>
    ;
  }
  