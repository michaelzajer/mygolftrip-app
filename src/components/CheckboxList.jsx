// CheckboxList.jsx
const CheckboxList = ({ data, type, handleCheckboxChange }) => {
    return (
      <div className="w-1/3 p-4 border rounded-md">
        {data.map(item => (
          <div key={item.id} className="flex items-center my-2">
            <input 
              type="checkbox" 
              value={type === 'date' ? item.date : item[type + 'Name']} 
              onChange={() => handleCheckboxChange(type, type === 'date' ? item.date : item[type + 'Name'])}
              className="mr-2"
            />
            {type === 'date' ? item.date : item[type + 'Name']}
          </div>
        ))}
      </div>
    );
  };
  
  export default CheckboxList;
  
 
  
  