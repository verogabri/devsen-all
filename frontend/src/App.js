import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';

import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import OrderCreatePage from './pages/OrderCreatePage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/customers",
        element: <CustomersPage />
      },
      {
        path: "/orders",
        element: <OrdersPage />
      },
      {
        path: "/orders/:id_customer",
        element: <OrdersPage />
      },
      {
        path: "/order/createnew",
        element: <OrderCreatePage />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
