// import { useContext } from "react";
// import NavigationContext from "../../context/navigation";

import useNavigation from "../../hooks/use-navigation";

function Route({path, children}) {

    // const {currentPath } = useContext(NavigationContext);
    const { currentPath } = useNavigation();

    // Funzione per estrarre i parametri dall'URL
    function extractParams(routePath, currentPath) {
        const routeParts = routePath.split('/');
        const currentParts = currentPath.split('/');
        
        if (routeParts.length !== currentParts.length) {
            return null;
        }
        
        const params = {};
        let matches = true;
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                // È un parametro
                const paramName = routeParts[i].slice(1);
                params[paramName] = currentParts[i];
            } else if (routeParts[i] !== currentParts[i]) {
                // Non è un match
                matches = false;
                break;
            }
        }
        
        return matches ? params : null;
    }

    // Controllo se il path corrisponde esattamente
    if(currentPath === path){
        return children;
    }
    
    // Controllo se il path contiene parametri
    if(path.includes(':')){
        const params = extractParams(path, currentPath);
        if(params){
            // Clona i children e passa i parametri come props
            return children.map ? children.map(child => 
                child.type ? 
                    { ...child, props: { ...child.props, params } } : 
                    child
            ) : 
            (children.type ? 
                { ...children, props: { ...children.props, params } } : 
                children);
        }
    }

    return null;
}

export default Route;
