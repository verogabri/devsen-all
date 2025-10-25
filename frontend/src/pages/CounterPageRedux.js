
/**
 * pagina demo di un custom hook
 * 
 */

import { useState, useEffect } from "react";

import Button from "../components/Button/Button";
import Panel from "../components/Panel/Panel";



function CounterPageRedux({initialCount}) {

    const [count, setCount] = useState(initialCount);
    const [valueToAdd, setValueToAdd] = useState(0);

    const increment = () => {
        setCount(count + 1);
    };

    const decrement = () => {
        setCount(count - 1);
    };

    const handleChange = (event) => {
        const value = parseInt(event.target.value) || 0;

        setValueToAdd(value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setCount(count + valueToAdd);
        setValueToAdd(0);
    };


    return (
        <Panel className="m-3">
            <h1 className="text-lg">Count {count}</h1>
            
            <div className="flex flex-row">
                <Button onClick={increment}>Increment</Button>
                <Button onClick={decrement}>Decrement</Button>
            </div>

            <form>
                <label className="">Add a lot</label>
                <input 
                    className="p-1 m-3 bg-gray-50 border border-gray-300"
                    type="number" 
                    value={valueToAdd || ""}
                    onChange={handleChange}
                    //min="1" max="100" 
                    //value={count} onChange={(e) => setCount(parseInt(e.target.value))} 
                />
                <Button 
                    onClick={handleSubmit}
                    >
                    Add
                </Button>

            </form>
        </Panel>

    )
}

export default CounterPageRedux;