import { createContext, useState, useEffect} from "react";

const NavigationContext = createContext();

// il mio Provider personalizzato
function NavigationProvider({children}) {

    // currentPath di default vale la url base del sito, la index.js
    const [ currentPath, setCurrentPath ] = useState(window.location.pathname);
    
    // ad ogni navigate imposta il valore di currentPath con al url del momento
    useEffect(() => {
        const handler = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener("popstate", handler);
        return () => {
            window.removeEventListener("popstate", handler);
        };
        
    });

    // funzione che "naviga" nella pagian "to"
    //usa la pushstate così il browser nn ricarica tutta la pagina 
    const navigate = (to) => {
        window.history.pushState({}, '', to);
        setCurrentPath(to);
    };

    return (
        <NavigationContext.Provider value={{currentPath, navigate}} >
            {children}
        </NavigationContext.Provider>
    );


}


export { NavigationProvider };
export default NavigationContext;