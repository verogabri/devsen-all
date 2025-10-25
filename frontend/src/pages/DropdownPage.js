import { useState, useEffect } from 'react';

import Dropdown from '../components/Dropdown/Dropdown';

function DropdownPage() {

  const [ selection, setSelections ] = useState(null);

  const handleSelect = (option) => {
    setSelections(option);
  }

  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    { label: 'Option 4', value: 'option4' },
    { label: 'Option 5', value: 'option5' },
  ];

  return (
    <div className="" >
      <Dropdown options={options} value={selection} onChange={handleSelect} />
    </div>
  );
}

export default DropdownPage;
