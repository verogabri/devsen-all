import { useState, useEffect, useRef } from "react";
import { GoChevronDown } from "react-icons/go";

import Panel from "../Panel/Panel";

function Dropdown({options, value, onChange}) {

    const [isOpen, setIsOpen] = useState(false);
    const divEl = useRef();

    useEffect(() => {

        // ad ogni click sulla pagina
        const handler = (event)=> {
            // console.log(event.target);

            // può essere che ref nn abbia il current... 
            // meglio controllare per evitare comportamneti noiosi o piccoli bug 
            if( !divEl.current ) {
                return;
            }

            // controllo da dove arriva il click, se nn arriva dal target del componente
            // allora chiudo il dropdown, perchè vuol dire che è stato fatto un click fuori dal componente
            if( !divEl.current.contains(event.target) ) {
                setIsOpen(false);
            }

        }

        // aggiungo un listerner su tutti i click del DOM
        document.addEventListener('click', handler, true);

        // funzione di cleanip
        // useEffect definito con un [] vuoto viene chiamato solo la prima volta che il cpomponente è renderizzato in pagina,
        // ma eventuale funzione return è chiamata quando il componente è tolto dalla pagina
        return () => {
         
            // tolgo il listerner quandoil componente è tolto dalla pagian, per non lasciare eventi in giro
            document.removeEventListener('click', handler, true);
        }
    }, []);


    const toggleDropdown = () => {
        // setIsOpen(!isOpen);

        setIsOpen( (currentIsOpen) => !currentIsOpen);
    }

    const handleOptionClick = (event) => {
        console.log('Option selected :'+ event.target.value);
        setIsOpen(false);
    }

    // versione con protezione dal ritardo del useState...
    const handleOptionClick2 = (option) => {
        console.log('Option option :', option );
        setIsOpen(false);
        onChange(option); // passiamo l'opzione selezionata al componente principale, che la può utilizzare per aggiornare lo stato
    }
    
    const renderedOptions = options.map((option) => {
        return (
            <div 
                key={option.value} 
                // value={option.value}
                // onClick={handleOptionClick }
                onClick={ () => handleOptionClick2(option)}
                className="hover:bg-sky-100 rounded cursor-pointer p-1"
            >
            {option.label}

            </div>
        )
    });


    let content = "Selection ... ";
    if(value){
        content = value.label;
    }

    return (
        <div
            ref={divEl} 
            className="w-48 relative">
            {/* <div onClick={toggleDropdown}>{content}</div> */}
            <Panel 
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleDropdown}
            >
                {value?.label || "Selection..."}
                <GoChevronDown className="text-lg" />
            </Panel>
            { isOpen && (
                <Panel className="absolute top-full">
                    {renderedOptions}
                </Panel>
            )}

        </div>
    )

}

export default Dropdown;