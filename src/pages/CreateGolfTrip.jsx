// ----- 1. IMPORTS -----
import React, {  useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router";
import moment from "moment";
import { db } from "../firebase";
import { TripDisplay } from '../components/TripDisplay'
import CheckboxList from '../components/CheckboxList';

export default function CreateGolfTrip() {
  // ----- 2. CONSTANTS & INITIAL STATES -----
  const navigate = useNavigate();
  const auth = getAuth();
  
  // ----- Various states -----
  // Trip data state
  const [golfTrips, setGolfTrips] = useState([]);
  // Golfers data state
  const [golfers, setGolfers] = useState([]);
  const [golfersOnTrip, setSelected] = useState([]);
  // Groups data state
  const [groupName, setGroupName] = useState();
  const [groups, setGroups] = useState([]);
  const [tripGroups, setTripGroups] = useState([]);
  // Construct Trip data states
  const [tripId, setTripId] = useState();
  const [tripData, setTripData] = useState({ tripDates: [], tripGroups: [], tripGolfers: [] });
  // Trip data state
  const [formData, setFormData] = useState({ tripName: '',  startDate: '',  endDate: ''    });
  const { tripName, startDate, endDate } = formData;
  const [groupedData, setGroupedData] = useState({});
  // ----- 3. UTILITY FUNCTIONS -----
  function getGolfTripDates(start, end) {
    const getDates = [];
    let currentId = 0;

    for (let day = start.clone(); day.isSameOrBefore(end); day.add(1, 'days')) {
        getDates.push({
            id: currentId++,
            date: day.format('DD/MM/YYYY'),
            dayName: day.format('dddd')  // This will give you the day name
        });
    }
    return getDates;
  }

  const start = moment(startDate);
  const end = moment(endDate);
  const dateList = getGolfTripDates(start, end);

// Get Trip Dates and days by using Trip Name
async function fetchTripDataByTripName(tripName) {
  const q = query(collection(db, "golftrips"), where("tripName", "==", tripName));
  const querySnapshot = await getDocs(q);
  // Assuming there's only one trip with a unique tripName
  const trip = querySnapshot.docs[0];
  if (trip) {
    const fetchedTripId = trip.id;
    setTripId(fetchedTripId);  // Update tripId state
    // Fetch trip dates
    const dateSnapshot = await getDocs(collection(db, `golftrips/${fetchedTripId}/trip-dates`));
    const tripDates = dateSnapshot.docs.map(doc => doc.data());
    // Fetch trip groups
    const groupSnapshot = await getDocs(collection(db, `groups`));
    const tripGroups = groupSnapshot.docs.map(doc => doc.data());
    // Fetch trip golfers
    const golferSnapshot = await getDocs(collection(db, `golftrips/${fetchedTripId}/trip-golfers`));
    const tripGolfers = golferSnapshot.docs.map(doc => doc.data());
    setTripData({
      tripDates,
      tripGroups,
      tripGolfers
    });
  }
}
  // ----- 4. USE EFFECTS -----
  useEffect(() => {
    const tripNameToSearch = 'Barnbougle';
    fetchTripDataByTripName(tripNameToSearch);
  }, []);
  // Fetch golfers for the dropdown
  useEffect(() => {
      onSnapshot(collection(db, "golfers"), (snapShot) => {
          setGolfers(snapShot.docs.map(doc => doc.data()))
      })
    }, []);
  // Fetch golf trips
  useEffect(() => {
      async function fetchGolfTrips() {
        try {
          const q = query(collection(db, "golftrips"), where("tripName", "==", true));
          const querySnapshot = await getDocs(q);

          const fetchedTrips = [];
          querySnapshot.forEach((doc) => {
            fetchedTrips.push({
              id: doc.id,
              data: doc.data()
            });
          });
          
          setGolfTrips(fetchedTrips);

        } catch (error) {
          console.error("Error fetching golf trips:", error);
        }
      }
      fetchGolfTrips();
    }, []);
    const t_id = tripId;
    const targetDate = "";
    //fetch trip constructs
    useEffect(() => {
      const fetchData = async () => {
          const data = await fetchTripDataByDate(t_id, targetDate);
          setGroupedData(data);
      };
  
      fetchData();
  }, [t_id, targetDate]); 

    // ----- 5. EVENT HANDLERS -----
    // Add Groups
    function handleAddGroup(e) {
        e.preventDefault();
        // Using the length of the current groups array as the next ID
        const currentId = groups.length;

        setGroups(prevGroups => [
            ...prevGroups,
            { id: currentId, groupName: groupName }
        ]);
        setGroupName(''); // Optional: Clear the input after adding
      }
    // Handle form changes
    function onChange(e) {
        let value = e.target.value;
        if (value === "true") value = true;
        if (value === "false") value = false;
        if (e.target.files) value = e.target.files;

        setFormData(prev => ({
            ...prev,
            [e.target.id]: value
        }));
      }
    // Handle on Submit
    async function onSubmit(e) {
        e.preventDefault();
        const formDataCopy = {
            ...formData,
            timestamp: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, "golftrips"), formDataCopy);
        // Create functions to add individual items as documents to the respective subcollections
        const addGolfers = golfersOnTrip.map(golfer => addDoc(collection(docRef, "trip-golfers"), golfer));
        const addDates = dateList.map(date => addDoc(collection(docRef, "trip-dates"), date));
        const addGroups = tripGroups.map(group => addDoc(collection(db, "groups"), group));

        // Use Promise.all to add all the documents concurrently
        await Promise.all([...addGolfers, ...addDates, ...addGroups]);
        toast.success('Golf Trip created');
        navigate(`/createtrip/trip/${docRef.id}`);
      }

      const [selectedDates, setSelectedDates] = useState([]);
      const [selectedGroups, setSelectedGroups] = useState([]);
      const [selectedGolfers, setSelectedGolfers] = useState([]);
      const [checkedItems, setCheckedItems] = useState([]);

  
    // ----- 6. RENDER LOGIC -----
    const handleCheckboxChange = (type, value) => {
  
      switch (type) {
          case 'date':
              setSelectedDates(prevDates => {
                  if (prevDates.includes(value)) {
                      return prevDates.filter(date => date !== value);
                  }
                  return [...prevDates, value];
              });
              break;
  
          case 'group':
              setSelectedGroups(prevGroups => {
                  const exists = prevGroups.find(group => group.groupName === value);
                  if (exists) {
                      return prevGroups.filter(group => group.groupName !== value);
                  }
                  return [...prevGroups, tripData.tripGroups.find(group => group.groupName === value)];
              });
              break;
  
          case 'golfer':
              setSelectedGolfers(prevGolfers => {
                  const exists = prevGolfers.find(golfer => golfer.golferName === value);
                  if (exists) {
                      return prevGolfers.filter(golfer => golfer.golferName !== value);
                  }
                  return [...prevGolfers, tripData.tripGolfers.find(golfer => golfer.golferName === value)];
              });
              break;
  
          default:
              console.log(`Unknown checkbox type: ${type}`);
              break;
      }
  };  
selectedGolfers.forEach(golfer => {
});

const handleSave = async () => {
  if (tripId) {
      for (const date of selectedDates) {
        // Enhance the selectedGolfers with score and handicap set to null initially
      const golfersWithScores = selectedGolfers.map(golfer => ({
        ...golfer,
        golferGroupScore: '',
        dailyHcp: ''
      }));
          
          // Create an array of unique golferRefs
          const golferRefs = [...new Set(golfersWithScores.map(golfer => golfer.golferRef))];
          
          const tripConstructData = {
              date: date,
              golferRefs: golferRefs,
              groups: selectedGroups?.map(group => ({
                  groupName: group.groupName,
                  golfers: golfersWithScores
              }))
          };

          await addDoc(collection(db, "golftrips", tripId, "tripconstruct"), tripConstructData);
      }
  } else {
      console.error("tripId is not set. Unable to save data.");
  }
};


const fetchTripDataByDate = async (t_id, targetDate) => {
  const tripConstructRef = collection(db, `golftrips`, t_id, `tripconstruct`);
  
  let q;

  if (targetDate) {
    // Query for the specific date
    q = query(tripConstructRef, where("date", "==", targetDate));
  } else {
    // Query all documents
    q = query(tripConstructRef);
  }

  const querySnapshot = await getDocs(q);

  let groupedResults = {};

  if (!querySnapshot.empty) {
      querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();

          if (!groupedResults[data.date]) {
              groupedResults[data.date] = [];
          }

          data.groups.forEach(group => {
              const groupData = {
                  groupName: group.groupName,
                  golfers: []
              };

              group.golfers.forEach(golfer => {
                  groupData.golfers.push({
                      golferRef: golfer.golferRef,
                      golferName: golfer.golferName
                  });
              });

              groupedResults[data.date].push(groupData);
          });
      });
  } else {
      console.log("No data found.");
  }

  console.log(groupedResults);
  return groupedResults;
}

// You can call this function like this:

fetchTripDataByDate(t_id, targetDate);;

  return (
    <main className="max-w-md
    px-2 mx-auto">
      <h1
      className='text-1xl
      text-center mt-6
      font-bold'>
        Enter Trip Setup Information
      </h1>
      <form onSubmit={onSubmit}>
        <p className="text-md mt-6 font-semibold">
          Trip Name  
        </p>
        <input 
        type="text" 
        id="tripName" value={tripName}
        onChange={onChange} placeholder="Trip Name" maxLength="32"
        minLength="3" required 
        className="w-full mt-2 mb-2 text-sm text-gray-700 bg-white border border-gray-300
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 "/>
        <p className="text-md  font-semibold">
          Start Date
        </p>
        <input 
        type="date"
        id="startDate"
        value={startDate}
        onChange={onChange}
        placeholder="Start Date" 
        required 
        className="w-full mt-2 mb-2 text-sm text-gray-700 bg-white border border-gray-300
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />
        <p className="text-md font-semibold">
          End Date
        </p>
        <input 
        type="date"
        id="endDate"
        value={endDate}
        onChange={onChange}
        placeholder="End Date" 
        required 
        className="w-full mt-2 mb-2 text-sm text-gray-700 bg-white border border-gray-300
                rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
        />
          <p className="text-md font-semibold ">
            Add Golfers to Trip
          </p>
          <select 
            className="mt-2 mb-2 sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            multiple={true}
            value={golfersOnTrip?.map(golfer => golfer.golferRef)}  // Expect golfersOnTrip to be an array of {golferRef, name}
            name='selectedGolfers'
            id='selectedGolfers'
            onChange={e => {
              const options = [...e.target.selectedOptions];
              const values = options.map(option => {
                const golferRef = option.value;
                const golferName = option.textContent;  // Gets the displayed text of the option
                return {
                  golferRef: golferRef,
                  golferName: golferName
                };
              });
              setSelected(values);
            }}
          >
            {golfers?.map((golfer) => (
              <option className="text-sm border-spacing-0"
                key={golfer.id}
                value={golfer.golferRef}
              >
                {golfer.name}
              </option>
            ))}
          </select>
          <p className="text-md font-semibold">
            Add Groups for Trip
          </p>
          <input
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <button onClick={handleAddGroup}>Add</button>
          <select
              className="mt-2 mb-2 sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              2xl:grid-cols-5 text-md"
              multiple={true}
              value={tripGroups?.map(group => group.id)} // Expect tripGroups to be an array of {id, groupName}
              onChange={e => {
                const options = [...e.target.selectedOptions];
                const values = options.map(option => {
                  const groupId = option.value;
                  const groupName = option.textContent; // Gets the displayed text of the option
                  return {
                    id: groupId,
                    groupName: groupName
                  };
                });
                setTripGroups(values);
              }}
              name='selectedGroups'
              id='selectedGroups'>
            {groups.map(group => (
              <option className='text-sm'key={group.id} value={group.id}>{group.groupName}</option>
            ))}
          </select>
          <button 
            type='submit'
            className="mt-2 mb-2 w-full px-7 py-3 bg-blue-600 text-white font-medium
            text-md uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg
            focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg
            transition duration-150 ease-in-out"
            >Create Golf Trip Listing
          </button>
      </form>
    <>
    <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
    <div className="flex overflow-x-auto mt-6">
      <CheckboxList data={tripData.tripDates} type="date" handleCheckboxChange={handleCheckboxChange} />
      <CheckboxList data={tripData.tripGroups} type="group" handleCheckboxChange={handleCheckboxChange} />
      <CheckboxList data={tripData.tripGolfers} type="golfer" handleCheckboxChange={handleCheckboxChange} />
    </div>
    <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Create Trip Groups</button>
  </>
    <TripDisplay groupedResults={groupedData} />
    </main>
  )
}
