import { useContext } from 'react';
import OrdersContext from '../context/Orders';

// ho creato un "Hooks"
function useOrdersContextHook() {
    return useContext(OrdersContext);
}

export default useOrdersContextHook;