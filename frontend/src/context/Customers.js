import { createContext, useState, useEffect } from "react";
import axios from 'axios';


import { HOST_SERVER, CUSTOMERS} from '../config/config';

const CustomersContext = createContext();

// definisco il mio Provider customizzato
// questo provider fornisce una variabile e una funzione per incrementare la variabile
// children prende il valore dell'intero <App /> passato dentro Provdier in index.js
function Provider({children}) {

    // array con la lista dei clienti, ogni cliente è un oggetto
    const [customers, setCustomers] = useState([]);
    
    useEffect( () => {

        
    }, []);

    


    // carico i clienti dal JSON-server
    const fetchCustomers = async () => {

        console.log(' :: App : fetchCustomers');
        // la risposta è già nella forma che serve per la lista dei customers
        const response = await axios.get(HOST_SERVER+'/'+CUSTOMERS+'/get');

        console.log(' :: App : fetchCustomers : axios response = ', response);

        // setLastAction('fetch customers at '+new Date().toLocaleTimeString());

        setCustomers(response.data.data);
    };

    const editCustomerById = async (id, customerData) => {
        try {
            console.log(' :: App : editCustomerById : id =', id);
            console.log(' :: App : editCustomerById : customerData =', customerData);

            // setLastAction('edit customer at '+new Date().toLocaleTimeString());

            const response = await axios.put(HOST_SERVER+'/'+CUSTOMERS+'/'+id, customerData);

            console.log(' :: App : editCustomerById : response =', response);

            // aggiorno la lista sostituendo tutto il customer id appena cambiato
            if(response.status === 200){
                const updatedCustomers = customers.map( (customer) => {
                    if(customer.id === id){
                        return {...customer, ...response.data.data};
                    }
                    return customer;
                });

                console.log(' :: App : editCustomerById : response =', response);
                console.log(' :: App : editCustomerById : id =', id);
                console.log(' :: App : editCustomerById : updatedCustomers =', updatedCustomers);

                setCustomers(updatedCustomers);
            } else {
                alert('errore in edit customer : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            console.error(' :: App : editCustomerById : error =', error);
            console.error(' :: App : editCustomerById : error.response =', error.response);
            
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

    const deleteCustomerById = async (id) => {
        try {
            console.log(' :: App : deleteCustomerById : id =', id);

            // setLastAction('delete customer at '+new Date().toLocaleTimeString());
            const response = await axios.delete(HOST_SERVER+'/'+CUSTOMERS+'/'+id);

            console.log(' :: App : deleteCustomerById : response =', response);

            if(response.status === 200){
                const updatedCustomers = customers.filter(customer => {
                    return customer.id !== id;
                });

                setCustomers(updatedCustomers);
            } else {
                alert('errore in delete customer : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            console.error(' :: App : deleteCustomerById : error =', error);
            console.error(' :: App : deleteCustomerById : error.response =', error.response);
            
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

    // create a customer con chiamata POST al JSON-server
    const createCustomer = async (customerData) => {
        try {
            console.log(' :: App : createCustomer : customerData = ', customerData );

            // chiamo POST e aspetto la risposta
            const response = await axios.post(HOST_SERVER+'/'+CUSTOMERS, customerData);


            console.log(' :: App : createCustomer : ', response );

            if(response.status === 200 || response.status === 201){
                // dopo la risposta aggiorno la lista dei clienti
                const updateCustomer = [
                    ... customers,
                    response.data.data// .data contiene il customer appena creato
                ];
                setCustomers(updateCustomer);
            } else {
                alert('errore in create customer : '+response.status+' - '+response.statusText );
            }
        } catch (error) {
            console.error(' :: App : createCustomer : error =', error);
            
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
        customers,
        fetchCustomers,
        editCustomerById,
        deleteCustomerById,
        createCustomer  
    }
    
    // e creo il Provider che esporto e uso in index.js
    return (
        <CustomersContext.Provider value={valueToShare}>
            {children}
        </CustomersContext.Provider>
    );
    
}

export { Provider };
export default CustomersContext;

// per usare i  componenti che ho definito qui, dovrò importarli co
// import CustomersContext, { Provider } from ../Customers  