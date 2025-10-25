import { useState } from 'react';
import { GoChevronDown, GoChevronLeft } from 'react-icons/go';  

function Accordion({items}) {

    const [expandedIndex, setExpandedIndex] = useState(-1);

    
    const handleClick = (event,index) => {
        if(index === expandedIndex){
            setExpandedIndex(-1)
        } else {
            setExpandedIndex(index);
        }
        // event.stopPropagation();
    
    }

    /*
     * usare expandedIndex direttamente può essere fonte di problemi perchè
     * react non invoca la setExpandedIndex immediamente ma si prende del tempo
     * e in questo tempo può succedere che expandedIndex non vale quello che ci si aspetterebbe
     * 
     * una soluzioone è riscrivere la handle così
     */
    const handleClick2 = (event,index) => {

        setExpandedIndex( (currentExpandedIndex) => {
            if(index === currentExpandedIndex){
                return -1;
            } else {
                return index;
            }
        })
    }

    const renderedItems = items.map( (item, index) => { 

        const isExpanded = index === expandedIndex;
        
        const icon = (<spn className="">
            {isExpanded ? <GoChevronDown /> : <GoChevronLeft />}
        </spn>)
        return (
            <div key={item.id}>
                <div  
                    className="flex justify-between p-3 bg-gray-50 border-b items-center cursor-pointer"
                    onClick={(event) => handleClick2(event,index)} 
                    // style={{background: '#abcdef'}}
                >
                    
                    {item.label}
                    {icon}
                </div>
                {isExpanded && <div className="border-b p-5" style={{background:'#fedcba'}}>{item.content}</div>}
            </div>
        ); });

    return (
        <div className='border-x border-t rounded'>
            {renderedItems}
        </div>
    );


}

export default Accordion;