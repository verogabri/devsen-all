import { useContext } from 'react';
import CustomersContext from '../context/Customers';

// ho creato un "Hooks"
function useCustomersContextHook() {
    return useContext(CustomersContext);
}

export default useCustomersContextHook;