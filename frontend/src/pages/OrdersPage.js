import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import OrdersContext from '../context/Orders';
import OrdersList from '../components/OrdersList/OrdersList'; 

function OrdersPage() {
  const { id_customer } = useParams();
  const { orders, customer_orders, fetchOrders } = useContext(OrdersContext);

  useEffect(() => {
    fetchOrders(id_customer || '');
  }, [id_customer, fetchOrders]);


  if(!orders){
    return <div>Non ci sono ordini</div>;
  }


  console.log(orders);
  return (
    <div className="">
      {id_customer ? (
        <div>
          <h2>Questi sono gli ordini di {customer_orders?.name || id_customer}</h2>
          <OrdersList customer_orders={customer_orders} />
        </div>
      ) : (
        <div>
          <h2>Lista degli ordini</h2>
          <OrdersList customer_orders={customer_orders} />
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
