import { useNavigate } from 'react-router-dom';
import OrderCreate from '../components/OrderCreate/OrderCreate';

function OrderCreatePage() {
  const navigate = useNavigate();

  const handleCloseForm = () => {
    // Naviga alla lista degli ordini dopo la creazione o annullamento
    navigate('/orders');
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Crea Nuovo Ordine</h1>
        <p className="text-gray-600">Compila il form per creare un nuovo ordine</p>
      </div>
      
      <OrderCreate closeForm={handleCloseForm} />
    </div>
  );
}

export default OrderCreatePage;
