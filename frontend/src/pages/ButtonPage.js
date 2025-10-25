import { GoBell, GoCloudDownload, GoDatabase } from 'react-icons/go';

import Button from '../components/Button/Button';


function ButtonPage() {

  const handleCoso = (event, item) => {

    console.log('on coso : ' + item);
    console.log('event : ', event);
  }

  return (
    <div className="App" >
      
      <div>
        <Button 
          onClick={(e) => handleCoso(e, 'click')}
          className='mb-10'
        >
          <GoBell />
          Plain
        </Button>
      </div>
      
      <div>
        <Button primary onMouseOver={(e) => handleCoso(e, 'over')} >
          <GoCloudDownload />
          primary
        </Button>
      </div>
      
      <div>
        <Button secondary >
          <GoDatabase />
          secondary
        </Button>
      </div>
      
      <div>
        <Button success >success</Button>
      </div>
      
      <div>
        <Button  warning rounded >warning rounded</Button>
      </div>
      
      <div>
        <Button danger >danger</Button>
      </div>
      
      <div>
        <Button primary outline >primary outline</Button>
      </div>
      
      <div>
        <Button secondary outline >secondary outline</Button>
      </div>
      
      <div>
        <Button success outline >success outline</Button>
      </div>
      
      <div>
        <Button  warning outline >warning outline</Button>
      </div>
      
      <div>
        <Button danger outline rounded >danger outline rounded</Button>
      </div>
      
    </div>
  );
}

export default ButtonPage;
