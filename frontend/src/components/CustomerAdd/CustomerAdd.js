import { useState, useContext } from "react";
import CustomersContext from "../../context/Customers";
import "../../assets/css/CustomersEdit.css"; // Riuso lo stesso CSS del form di edit

function CustomerAdd({ closeForm }) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [address_text, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    const { createCustomer } = useContext(CustomersContext);

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    const handleSurnameChange = (event) => {
        setSurname(event.target.value);
    }

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    }

    const handleCityChange = (event) => {
        setCity(event.target.value);
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    const handlePhoneChange = (event) => {
        setPhone(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Validazione base
        if (!name.trim() || !surname.trim()) {
            alert("Nome e cognome sono obbligatori");
            return;
        }

        // Crea il nuovo customer
        createCustomer({ name, surname, address_text, city, email, phone });
        
        // Chiude il form
        closeForm();
    }

    return (
        <div className="customer-edit-container">
            <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>Nuovo Cliente</h3>
            
            <form onSubmit={handleSubmit} className="customer-edit-form">
                <div className="form-field">
                    <label className="form-label">Name *</label>
                    <input 
                        className="form-input" 
                        value={name} 
                        onChange={handleNameChange} 
                        type="text" 
                        placeholder="Enter customer name" 
                        required
                    />
                </div>
                
                <div className="form-field">
                    <label className="form-label">Surname *</label>
                    <input 
                        className="form-input" 
                        value={surname} 
                        onChange={handleSurnameChange} 
                        type="text" 
                        placeholder="Enter customer surname" 
                        required
                    />
                </div>
                
                <div className="form-field">
                    <label className="form-label">Address</label>
                    <input 
                        className="form-input" 
                        value={address_text} 
                        onChange={handleAddressChange} 
                        type="text" 
                        placeholder="Enter customer address" 
                    />
                </div>
                
                <div className="form-field">
                    <label className="form-label">City</label>
                    <input 
                        className="form-input" 
                        value={city} 
                        onChange={handleCityChange} 
                        type="text" 
                        placeholder="Enter customer city" 
                    />
                </div>

                <div className="form-field">
                    <label className="form-label">Email</label>
                    <input 
                        className="form-input" 
                        value={email} 
                        onChange={handleEmailChange} 
                        type="email" 
                        placeholder="Enter customer email" 
                    />
                </div>

                <div className="form-field">
                    <label className="form-label">Phone</label>
                    <input 
                        className="form-input" 
                        value={phone} 
                        onChange={handlePhoneChange} 
                        type="tel" 
                        placeholder="Enter customer phone" 
                    />
                </div>

                <div className="form-buttons">
                    <button className="form-button" type="submit">CREA CLIENTE</button>
                    <button 
                        className="form-button-cancel" 
                        type="button" 
                        onClick={closeForm}
                    >
                        ANNULLA
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CustomerAdd;