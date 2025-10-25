import Link from "../Navigation/Link";

function Sidebar() {

    const links = [
        { label: 'Home', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'Orders', path: '/orders' },
        { label: 'Dropdown', path: '/dropdown' },
        { label: 'Accordion', path: '/accordion' },
        { label: 'Buttons', path: '/button' },
        { label: 'Modal', path: '/modal' },
        { label: 'Table', path: '/table' },
        { label: 'Counter', path: '/counter' },
        { label: 'Counter Redux', path: '/counterredux' },
    ];
    
    // <Link to={"/dropdown"}>dropdown page</Link>
    const renderLinks = links.map(link =>{
        return (
            <Link 
                key={link.label} 
                to={link.path} 
                className="mb-3" 
                activeClassName="font-bold border-l-4 border-blue-50 pl-2" 
            >{link.label}</Link>
        );
    });


    return (
        <div className="sticky top-0 overflow-y-scroll flex flex-col items-start">
            {renderLinks}
        </div>
    );

}

export default Sidebar;