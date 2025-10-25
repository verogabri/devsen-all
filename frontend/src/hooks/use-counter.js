import { useState, useEffect } from "react";


// my hook che poi metto dentro un file ch eimporto
function useCounter(initialCount){

    const [count, setCount] = useState(initialCount);

    // useEffect che viene eseguito quando il componente viene montato
    useEffect(() => {
        console.log("count ", count);
    }, [count] );


    const increment = () => {

        setCount(count + 1);
    };

    return {count, increment };

}

export default useCounter;