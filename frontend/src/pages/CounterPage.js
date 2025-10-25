
/**
 * pagina demo di un custom hook
 * 
 */

import { useState, useEffect, useContext } from "react";

import Button from "../components/Button/Button";

import useCounter from "../hooks/use-counter";

// my hook che poi metto dentro un file ch eimporto
function useSomething(initialCount){

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

function CounterPage({initialCount}) {

    const { count, increment } = useCounter(initialCount);

    return (
        <div>
            <h1>Counter Page</h1>
            <p>Count: {count}</p>
            <Button onClick={increment}>Increment</Button>
            {/* <Button onClick={() => setCount(count - 1)}>Decrement</Button> */}
        </div>
    )
}

export default CounterPage;