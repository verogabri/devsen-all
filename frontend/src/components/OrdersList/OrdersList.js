import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import OrdersContext from '../../context/Orders';
import OrdersShow from '../OrdersShow/OrdersShow';
import Button from '../Button/Button';

function OrdersList({ customer_orders}) {

    const { orders } = useContext(OrdersContext);
    const navigate = useNavigate();

    const handleNewOrderClick = () => {
        navigate('/order/createnew');
    };

    if(orders.length === 0) {
        return (
            <div>
                <div>No orders found</div>
                <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                    <Button primary onClick={handleNewOrderClick}>
                        Nuovo Ordine
                    </Button>
                </div>
            </div>
        );
    }

    

    return (
        <div className='order-list'>
            <div>
                <OrdersShow orders={orders} />
            </div>
            
            <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                <Button primary onClick={handleNewOrderClick}>
                    Nuovo Ordine
                </Button>
            </div>
        </div>
    );

}

export default OrdersList;
