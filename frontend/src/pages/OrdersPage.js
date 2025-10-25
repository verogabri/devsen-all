import { useContext, useEffect, useState } from 'react';




import OrdersContext from '../context/Orders';
import useNavigation from '../hooks/use-navigation';

import OrdersList from '../components/OrdersList/OrdersList'; 

// import CustomersList from '../components/CustomersList/CustomersList';


function OrdersPage({ params }) {

  const { currentPath } = useNavigation();
  const { orders, customer_orders, fetchOrders } = useContext(OrdersContext);

  
  // Estrae il parametro name_customer dall'URL se presente
  const getCustomerNameFromPath = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length === 3 && pathParts[1] === 'orders') {
      return pathParts[2];
    }
    return null;
  };
  
  const customerName = getCustomerNameFromPath();

  useEffect(() => {
    fetchOrders('' + (customerName ? `${customerName}` : ''));
  }, [customerName]); 


  if(!orders){
    return <div>Non ci sono ordini</div>;
  }


  console.log(orders);
  return (
    <div className="" >
      {customerName ? (
        <div>
          <h2>Questi sono gli ordini di {customer_orders.name}</h2>
            <OrdersList customer_orders={customer_orders} />
        </div>
      ) : (
        <div>
          lista degli ordini
          <OrdersList customer_orders={customer_orders} />
        </div>
      )}
    </div>
    
  );
}

export default OrdersPage;
