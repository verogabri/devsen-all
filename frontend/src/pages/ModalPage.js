import { useState } from "react";
import Modal from "../components/Modal/Modal";
import Button from "../components/Button/Button";

function ModalPage(){

    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {

        setShowModal(true);
    }

    const handleClose = () => {
        setShowModal(false);
    }

    const actionBar = <div>
        <Button onClick={handleClose} primary>OK</Button>
    </div>;

    const modal = <Modal onClose={handleClose} actionBar={actionBar} >
        <div>
            <h2>Hello World</h2>
            
        </div>
    </Modal>


    return (
        <div className="relative">
            <Button onClick={handleClick} primary>Open Modal</Button>
            {showModal && modal }
            
        </div>

    )
}

export default ModalPage;
