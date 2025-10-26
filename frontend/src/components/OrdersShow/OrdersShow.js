import { useContext } from "react";
import PropTypes from 'prop-types';
import OrdersContext from "../../context/Orders";
import Button from "../Button/Button";
import "../../assets/css/OrdersShow.css";

function OrdersShow({ orders }) {
    const { editOrderById, deleteOrderById, updateOrdersStatus } = useContext(OrdersContext);

    if (!orders || orders.length === 0) {
        return <div>Nessun ordine trovato</div>;
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            
            await updateOrdersStatus(orderId, newStatus);
            
        } catch (error) {
            console.error('Errore nell\'aggiornamento dello status:', error);
            alert('Errore nell\'aggiornamento dello status dell\'ordine');
        }
    };

    const handleCancelOrder = async (orderId) => {
        const isConfirmed = window.confirm("Sei sicuro di cancellarlo?");
        
        if (isConfirmed) {
            try {
                await deleteOrderById(orderId);
            } catch (error) {
                console.error('Errore nell\'annullamento dell\'ordine:', error);
                alert('Errore nell\'annullamento dell\'ordine');
            }
        }
        // Se l'utente clicca su Cancel, non fa niente (comportamento predefinito)
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getCustomerName = (order) => {
        // Assumendo che l'ordine abbia i dati del cliente o almeno customer_name
        if (order.name && order.surname) {
            return `${order.name} ${order.surname}`;
        } else if (order.name) {
            return order.name;
        } else {
            return `Cliente ID: ${order.id_customer}`;
        }
    };

    const renderStatus = (order) => {
        return (
            <span style={{ fontWeight: '600' }}>
                {order.status_label || 'Non definito'}
            </span>
        );
    };

    const renderStatusButtons = (order) => {
        const currentStatus = order.id_status || 0;

        // Mostra solo il pulsante attivo appropriato
        if (currentStatus === 1) {
            // Se status = 1, mostra il pulsante "In Lavorazione" 
            return (
                <div className="status-buttons">
                    <Button 
                        warning
                        
                        onClick={() => handleStatusChange(order.id, 2)}
                        className="status-button status-in-lavorazione"
                    >
                        In Lavorazione
                    </Button>
                </div>
            );
        } else if (currentStatus === 2) {
            // Se status = 2, mostra il pulsante "Completato"
            return (
                <div className="status-buttons">
                    <Button 
                        success
                        onClick={() => handleStatusChange(order.id, 3)}
                        className="status-button status-completato"
                    >
                        Completato
                    </Button>
                </div>
            );
        } else {
            // Se status = 0 o altro, non mostra pulsanti di azione
            return (
                <div className="status-buttons">
                    {/* Nessun pulsante attivo per status = 0 */}
                </div>
            );
        }
    };

    return (
        <div className="orders-show-container">
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Totale</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Azioni</th>
                        <th style={{ textAlign: 'center' }}>annulla</th>

                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>
                                {order.id}
                            </td>
                            <td>
                                {formatDate(order.date)}
                            </td>
                            <td>
                                {getCustomerName(order)}
                            </td>
                            <td style={{ fontWeight: '600' }}>
                                {formatCurrency(order.total_amount || order.total)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {renderStatus(order)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {renderStatusButtons(order)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <Button 
                                    danger 
                                    // disabled={order.status >= 3}
                                    disabled={order.id_status >= 3}
                                    onClick={() => handleCancelOrder(order.id)}
                                    className={`action-button ${order.id_status > 2 ? 'is-disabled' : ''}`}
                                >
                                    Annulla
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

OrdersShow.propTypes = {
    orders: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        date: PropTypes.string.isRequired,
        id_customer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        total_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status_label: PropTypes.string,
        name: PropTypes.string,
        surname: PropTypes.string,
        customer_name: PropTypes.string,
        customer_surname: PropTypes.string
    })).isRequired
};

export default OrdersShow;