import ReactDOM from "react-dom";
import { useEffect } from "react";

function Modal({onClose, children, actionBar}) {

    useEffect( () => {

        // se la pgaina è lunga, il div grigio non copre tutto quanto
        // allora quando mostro la modale nascondo lo scroll della pagian così il div ggrtigio è grande tutto il view del browser
        document.body.classList.add("overflow-hidden");

        // e poi tolgo la classe quando esco dalla modale
        return () => {
            document.body.classList.remove("overflow-hidden");
        }
    }, []);



    return ReactDOM.createPortal(

        <div className="">
            <div onClick={onClose} className="fixed inset-0 bg-gray-300 opacity-80">
            </div>
            <div className="fixed inset-40 p-10 bg-white">
                <div className="flex flex-col justify-between h-full" >
                    {children}

                    <div className="flex justify-end" >
                        {actionBar}
                    </div>
                </div>
            </div>
        </div>,
        document.querySelector(".modal-container") // Assuming your modal container is in the DOM with class "modal-container"

    )
}

export default Modal;