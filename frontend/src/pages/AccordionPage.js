import { GoBell, GoCloudDownload, GoDatabase } from 'react-icons/go';

import Accordion from '../components/Accordion/Accordion';

function AccordionPage() {

  const items = [
    { id:'1', label: 'First Item', content: 'First item content' },
    { id:'2', label: 'Second Item', content: 'Second item content' },
    { id:'3', label: 'Third Item', content: 'Third item content' },
  ];

  return (
    <div className="" >
      <Accordion items={items} />
      
    </div>
  );
}

export default AccordionPage;
