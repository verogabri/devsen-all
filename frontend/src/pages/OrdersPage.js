import { GoBell, GoCloudDownload, GoDatabase } from 'react-icons/go';
import useNavigation from '../hooks/use-navigation';

// import Accordion from '../components/Accordion/Accordion';

function OrdersPage({ params }) {

  const { currentPath } = useNavigation();
  
  // Estrae il parametro name_customer dall'URL se presente
  const getCustomerNameFromPath = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length === 3 && pathParts[1] === 'orders') {
      return pathParts[2];
    }
    return null;
  };
  
  const customerName = getCustomerNameFromPath();

  return (
    <div className="" >
      {customerName ? (
        <div>
          <h2>Questi sono gli ordini di {customerName}</h2>
        </div>
      ) : (
        <div>
          lista degli ordini
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
