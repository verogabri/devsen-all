import classNames from "classnames";
// import { useContext } from "react";
// import NavigationContext from "../../context/navigation";
import useNavigation from "../../hooks/use-navigation";

function Link({to, children, className, activeClassName}) {

    // const { navigate } = useContext(NavigationContext);
    const { navigate, currentPath } = useNavigation(); // uso il hook personalizzato per la navigazione

    const classes = classNames(
        'text-blue-500', 
        className,
        currentPath === to && activeClassName
    );

    const handleClick = (event) => {
    
        if( event.metaKey || event.ctrlKey ){
            return; // se il tasto di controllo viene premuto, non faccio nulla
        }

        // blocco la normale navigazioen del browser
        event.preventDefault();
        
        // e uso la navigazioen del mio Provider
        navigate(to);
    };

    return (
        <a 
            href={to} 
            onClick={handleClick}
            className={classes}
        >
            {children}
        </a>
    );

}

export default Link;