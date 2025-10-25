
import { useState, useContext } from "react";

import CustomersContext from "../../context/Customers";
import CustomersEdit from "../CustomersEdit/CustomersEdit";   
import Button from "../Button/Button";
import "../../assets/css/CustomersShow.css"; 


function CustomersShow({customer}) {

    const [showEdit, setShowEdit] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const { deleteCustomerById } = useContext(CustomersContext);
    

    const handleEditClick = (e) => {
        e.preventDefault();
        setShowEdit(!showEdit);
        setShowButton(!showButton);
    };

    const handleDeleteClick = () => {
        const isConfirmed = window.confirm("Sei sicuro di voler cancellare questo cliente?");
        
        if (isConfirmed) {
            deleteCustomerById(customer.id);
        }
        // Se clicca "No" o "Annulla", non fa nulla
    }

    const handleSubmit = () => {
        // onEdit(id, newTitle);
        setShowEdit(false);
        setShowButton(true);
    }

    let content = <div>{customer.email} - {customer.phone} - {customer.address_text} {customer.city}</div>

    if(showEdit) {
        content = <CustomersEdit 
            customer={customer} 
            onSave={handleEditClick} 
            onEdit={handleSubmit}
            closeForm={() => setShowEdit(false)}
            />;
    }


    // Determina se il customer è cancellato (status 'D')
    const isDeleted = customer.status === 'D';
    
    return (
        <div className={`customer-show ${isDeleted ? 'customer-deleted' : ''}`}>

            <h3>{customer.name} {customer.surname}</h3>

            <div>{content}</div>
            

            {showButton && !isDeleted && (
                <div className="actions" >
                    <Button success onClick={(e) => handleEditClick(e)} >Edit</Button>
                    
                    <Button warning onClick={handleDeleteClick} >Delete</Button>

                </div>
            )}
        </div>
    );

}

export default CustomersShow;
