import { useContext, useEffect } from 'react';
// import { GoBell, GoCloudDownload, GoDatabase } from 'react-icons/go';

import CustomersContext from '../context/Customers';
import CustomersList from '../components/CustomersList/CustomersList';

function CustomersPage() {
  const { customers, fetchCustomers } = useContext(CustomersContext);


  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="" >
      lista dei clienti
      <CustomersList />
    </div>
  );
}

export default CustomersPage;
