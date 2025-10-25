import { useContext, useState } from 'react';

import CustomersContext from '../../context/Customers';

import CustomersShow from '../CustomersShow/CustomersShow';
import CustomerAdd from '../CustomerAdd/CustomerAdd';
import Button from '../Button/Button';

// import useBooksContextHook from '../../hooks/use-books-context';


function CustomersList() {

    // 3 modi per definire la stessa cosa
    const { customers } = useContext(CustomersContext);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [showDelete, setShowDelete] = useState(false);
    
    
    console.log(' :: CustomersList : customers = ', customers );

    if(customers.length === 0) {
        return <div>No customers found</div>;
    }

    const renderedCustomers = customers
        .filter(customer => {
            // Se showDelete è false, mostra solo i customer con status 'A'
            if (!showDelete) {
                return customer.status === 'A';
            }
            // Se showDelete è true, mostra tutti i customer
            return true;
        })
        .map(customer => {
            return <CustomersShow
                key={customer.id} 
                customer={customer} 
            />
        });

    const handleNewCustomerClick = () => {
        setShowAddForm(true);
    };

    const closeAddForm = () => {
        setShowAddForm(false);
    };

    const toggleShowDelete = () => {
        setShowDelete(!showDelete);
    };

    return (
        <div className='customer-list'>
            
            <div>
                {renderedCustomers}
            </div>
            
            {!showAddForm && (
                <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                    <Button primary onClick={handleNewCustomerClick}>
                        Nuovo Cliente
                    </Button>
                </div>
            )}
            
            {showAddForm && (
                <CustomerAdd closeForm={closeAddForm} />
            )}
        </div>
    );

}

export default CustomersList;
