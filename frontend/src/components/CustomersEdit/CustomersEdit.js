import { useState, useContext } from "react";

import CustomersContext from "../../context/Customers";
import "../../assets/css/CustomersEdit.css";

// import useBooksContextHook from "../../hooks/use-books-context";

function CustomerEdit({customer, onEdit, closeForm}) {

    const [name, setName] = useState(customer.name);
    const [surname, setSurname] = useState(customer.surname);
    const [address_text, setAddress] = useState(customer.address_text);
    const [city, setCity] = useState(customer.city);
    const [email, setEmail] = useState(customer.email);
    const [phone, setPhone] = useState(customer.phone);
    const { editCustomerById } = useContext(CustomersContext);
    // const { editCustomerById } = useCustomersContextHook();

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
        // save the edited customer
        onEdit();
        editCustomerById(customer.id, { name, surname, address_text, city, email, phone });
    }

    return (
        <div className="customer-edit-container">
            <form onSubmit={handleSubmit} className="customer-edit-form">
                <div className="form-field">
                    <label className="form-label">Name</label>
                    <input 
                        className="form-input" 
                        value={name} 
                        onChange={handleNameChange} 
                        type="text" 
                        placeholder="Enter customer name" 
                    />
                </div>
                
                <div className="form-field">
                    <label className="form-label">Surname</label>
                    <input 
                        className="form-input" 
                        value={surname} 
                        onChange={handleSurnameChange} 
                        type="text" 
                        placeholder="Enter customer surname" 
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
                    <button className="form-button" type="submit">SAVE</button>
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

export default CustomerEdit;
