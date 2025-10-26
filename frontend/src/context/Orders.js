import { createContext, useState, useEffect } from "react";
import axios from 'axios';


import { HOST_SERVER, ORDERS} from '../config/config';

const OrdersContext = createContext();

// definisco il mio Provider customizzato
// questo provider fornisce una variabile e una funzione per incrementare la variabile
// children prende il valore dell'intero <App /> passato dentro Provdier in index.js
function Provider({children}) {

    // array con la lista degli ordini, ogni ordine è un oggetto
    const [orders, setOrders] = useState([]);
    const [customer_orders, setCustomerOrders] = useState([]);
    
    useEffect( () => {

        
    }, []);

    


    // carico gli ordini dal JSON-server
    const fetchOrders = async (id_customer) => {

        // la risposta è già nella forma che serve per la lista degli orders
        let URL = HOST_SERVER+'/'+ORDERS+'';
        if(id_customer){
            URL += `/${id_customer}`;
        }

        const response = await axios.get(URL);

        // setLastAction('fetch orders at '+new Date().toLocaleTimeString());

        setOrders(response.data.data);

        if(response.data.customer){
            setCustomerOrders(response.data.customer);
        }
    };

    const editOrderById = async (id, orderData) => {
        try {

            // setLastAction('edit order at '+new Date().toLocaleTimeString());

            const response = await axios.put(HOST_SERVER+'/'+ORDERS+'/'+id, orderData);

            // aggiorno la lista sostituendo tutto l'order id appena cambiato
            if(response.status === 200){
                const updatedOrders = orders.map( (order) => {
                    if(order.id === id){
                        return {...order, ...response.data.data};
                    }
                    return order;
                });


                setOrders(updatedOrders);
            } else {
                alert('errore in edit order : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            console.error(' :: App : editOrderById : error =', error);
            console.error(' :: App : editOrderById : error.response =', error.response);
            
            if (error.response) {
                // Il server ha risposto con un codice di errore
                alert(`Errore ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                // La richiesta è stata fatta ma non c'è stata risposta
                alert('Errore di rete: il server non risponde');
            } else {
                // Qualcos'altro ha causato l'errore
                alert('Errore: ' + error.message);
            }
        }
    };

    const deleteOrderById = async (id) => {
        try {
            
            // setLastAction('delete order at '+new Date().toLocaleTimeString());
            const response = await axios.delete(HOST_SERVER+'/'+ORDERS+'/'+id);

            if(response.status === 200){
                const updatedOrders = orders.map( (order) => {
                    if(order.id === id){
                        return {...order, ...response.data.data};
                    }
                    return order;
                });

                setOrders(updatedOrders);
            } else {
                alert('errore in delete order : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            console.error(' :: App : deleteOrderById : error =', error);
            console.error(' :: App : deleteOrderById : error.response =', error.response);
            
            if (error.response) {
                // Il server ha risposto con un codice di errore
                alert(`Errore ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                // La richiesta è stata fatta ma non c'è stata risposta
                alert('Errore di rete: il server non risponde');
            } else {
                // Qualcos'altro ha causato l'errore
                alert('Errore: ' + error.message);
            }
        }
    };

    const updateOrdersStatus = async (id, id_status) => {
        try {
            
            const response = await axios.put(HOST_SERVER+'/'+ORDERS+'/status/'+id+'/'+id_status, {});

            if(response.status === 200){
                const updatedOrders = orders.map( (order) => {
                    if(order.id === id){
                        return {...order, ...response.data.data};
                    }
                    return order;
                });

                setOrders(updatedOrders);
            } else {
                alert('errore in update order status : '+response.status+' - '+response.statusText );
            }
        } catch (error) {

            if (error.response) {
                // Il server ha risposto con un codice di errore
                alert(`Errore ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                // La richiesta è stata fatta ma non c'è stata risposta
                alert('Errore di rete: il server non risponde');
            } else {
                // Qualcos'altro ha causato l'errore
                alert('Errore: ' + error.message);
            }
        }
    };


    // create an order con chiamata POST al JSON-server
    const createOrder = async (orderData) => {
        try {
            

            // chiamo POST e aspetto la risposta
            const response = await axios.post(HOST_SERVER+'/'+ORDERS, orderData);


            if(response.status === 200 || response.status === 201){
                // dopo la risposta aggiorno la lista degli ordini
                const updateOrder = [
                    ... orders,
                    response.data.data// .data contiene l'order appena creato
                ];
                setOrders(updateOrder);
            } else {
                alert('errore in create order : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            
            if (error.response) {
                alert(`Errore ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                alert('Errore di rete: il server non risponde');
            } else {
                alert('Errore: ' + error.message);
            }
        }
    };

    // raccolgo tutte le variabili e funzioni che voglio condividere
    const valueToShare = {
        orders,
        customer_orders,
        fetchOrders,
        editOrderById,
        deleteOrderById,
        updateOrdersStatus,
        createOrder  
    }
    
    // e creo il Provider che esporto e uso in index.js
    return (
        <OrdersContext.Provider value={valueToShare}>
            {children}
        </OrdersContext.Provider>
    );
    
}

export { Provider };
export default OrdersContext;

// per usare i  componenti che ho definito qui, dovrò importarli co
// import OrdersContext, { Provider } from ../Orders  