import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NavigationProvider } from './context/navigation';
import { Provider as CustomersProvider } from './context/Customers';
import { Provider as OrdersProvider } from './context/Orders';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <NavigationProvider>
    <CustomersProvider>
      <OrdersProvider>
        <App />
      </OrdersProvider>
    </CustomersProvider>
  </NavigationProvider>
);

