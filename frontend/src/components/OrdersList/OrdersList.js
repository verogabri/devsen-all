import { useContext, useState } from 'react';

import CustomersContext from '../../context/Customers';

import CustomersShow from '../CustomersShow/CustomersShow';
import CustomerAdd from '../CustomerAdd/CustomerAdd';
import Button from '../Button/Button';

// import useBooksContextHook from '../../hooks/use-books-context';
import OrdersContext from '../../context/Orders';
import Table from '../Table/Table';

function OrdersList({ customer_orders}) {

    // 3 modi per definire la stessa cosa
    const { orders } = useContext(OrdersContext);


    console.log(' :: OrdersList : OrdersList = ', orders );

    if(orders.length === 0) {
        return <div>No orders found</div>;
    }

    const config = [
        {
            label: 'data ordine',
            render: (order) => order.date,
            sortValue: (order) => order.date
        },
        {
            label: 'totale',
            render: (order) => order.total,
            sortValue: (order) => order.total
        },       
    ];





    return (
        <div className='customer-list'>
            
            <div>
                <Table data={orders} config={config} />
            </div>
            
            
        </div>
    );

}

export default OrdersList;
