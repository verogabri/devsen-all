import { useState, useContext, useEffect } from "react";
import OrdersContext from "../../context/Orders";
import CustomersContext from "../../context/Customers";
import "../../assets/css/CustomersEdit.css"; // Riuso lo stesso CSS del form
import "../../assets/css/OrderCreate.css"; // Stili specifici per OrderCreate

// Import Bulma Calendar
import 'bulma-calendar/dist/css/bulma-calendar.min.css';

function OrderCreate({ closeForm }) {
    const [id_customer, setIdCustomer] = useState("");
    const [date, setDate] = useState("");
    const [ total_amount , setTotalAmount ] = useState("");
    
    const { createOrder } = useContext(OrdersContext);
    const { customers, fetchCustomers } = useContext(CustomersContext);

    useEffect(() => {
        // Carica i clienti quando il componente viene montato
        fetchCustomers();
    }, []);

    const handleCustomerChange = (event) => {
        setIdCustomer(event.target.value);
    }

    const handleDateChange = (event) => {
        setDate(event.target.value);
    }

    const handleTotalChange = (event) => {
        let value = event.target.value;
        // Rimuove caratteri non numerici eccetto punto e virgola
        value = value.replace(/[^0-9.,]/g, '');
        // Sostituisce virgola con punto per formato numerico
        value = value.replace(',', '.');
        setTotalAmount(value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Validazione base
        if (!id_customer || !date || !total_amount) {
            alert("Tutti i campi sono obbligatori");
            return;
        }

        // Converte il total in numero
        const totalNumber = parseFloat(total_amount);
        if (isNaN(totalNumber) || totalNumber <= 0) {
            alert("Il totale deve essere un numero valido maggiore di zero");
            return;
        }

        // Crea il nuovo ordine
        const orderData = {
            id_customer: parseInt(id_customer),
            date: date,
            total_amount: totalNumber
        };

        createOrder(orderData);
        
        // Chiude il form
        closeForm();
    }

    const handleCancel = () => {
        // Azzera tutti i campi del form
        setIdCustomer("");
        setDate("");
        setTotalAmount("");
    }

    // Formatta il valore per la visualizzazione
    const formatCurrency = (value) => {
        if (!value) return '';
        const number = parseFloat(value);
        if (isNaN(number)) return value;
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(number);
    }

    return (
        <div className="customer-edit-container">
            <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>Nuovo Ordine</h3>
            
            <form onSubmit={handleSubmit} className="customer-edit-form">
                <div className="form-field">
                    <label className="form-label">Cliente *</label>
                    <select 
                        className="form-input" 
                        value={id_customer} 
                        onChange={handleCustomerChange}
                        required
                    >
                        <option value="">Seleziona un cliente</option>
                        {customers
                            .filter(customer => customer.status === 'A')
                            .map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} {customer.surname}
                                </option>
                            ))
                        }
                    </select>
                </div>
                
                <div className="form-field">
                    <label className="form-label">Data *</label>
                    <input 
                        className="form-input" 
                        value={date} 
                        onChange={handleDateChange} 
                        type="date" 
                        required
                    />
                </div>
                
                <div className="form-field">
                    <label className="form-label">Totale *</label>
                    <div className="currency-input-container">
                        <div style={{ position: 'relative' }}>
                            <input 
                                className="form-input" 
                                value={total_amount} 
                                onChange={handleTotalChange} 
                                type="text" 
                                placeholder="0.00"
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <span className="currency-symbol">€</span>
                        </div>
                        {total_amount && (
                            <div className="currency-preview">
                                Anteprima: {formatCurrency(total_amount)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-buttons">
                    <button className="form-button" type="submit">CREA ORDINE</button>
                    <button 
                        className="form-button-cancel" 
                        type="button" 
                        onClick={handleCancel}
                    >
                        CANCELLA
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderCreate;