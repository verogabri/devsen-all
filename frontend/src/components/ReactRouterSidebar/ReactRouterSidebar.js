import { NavLink } from 'react-router-dom';

function ReactRouterSidebar() {
    const links = [
        { label: 'Home', path: '/' },
        { label: 'Customers', path: '/customers' },
        { label: 'Orders', path: '/orders' },
        { label: 'Nuovo Ordine', path: '/order/createnew' },
    ];

    const renderLinks = links.map(link => {
        return (
            <NavLink 
                key={link.label} 
                to={link.path} 
                className={({ isActive }) => 
                    `mb-3 text-blue-500 block ${isActive ? 'font-bold border-l-4 border-blue-500 pl-2' : ''}`
                }
            >
                {link.label}
            </NavLink>
        );
    });

    return (
        <div className="sticky top-0 overflow-y-scroll flex flex-col items-start">
            {renderLinks}
        </div>
    );
}

export default ReactRouterSidebar;