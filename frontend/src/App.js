import { useState, useEffect, Fragment } from 'react';
import { GoBell, GoCloudDownload, GoDatabase } from 'react-icons/go';
import './App.css';

// import Link from './components/Navigation/Link';
import Route from './components/Navigation/Route';
import Sidebar from './components/Sidebar/Sidebar';

import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';

import DropdownPage from './pages/DropdownPage';
import AccordionPage from './pages/AccordionPage';
import ButtonPage from './pages/ButtonPage';
import ModalPage from './pages/ModalPage';
import TablePage from './pages/TablePage';
import CounterPage from './pages/CounterPage';
import CounterPageRedux from './pages/CounterPageRedux';


function App() {

  

  return (
    <div className='container mx-auto grid grid-cols-6 gap-4 mt-4'>
      <div className="" >
        <Sidebar />
      </div>
      <div className="col-span-5">
        <div >
          <Route path={"/customers"} ><CustomersPage /></Route>
          <Route path={"/orders"} ><OrdersPage /></Route>
          <Route path={"/orders/:name_customer"} ><OrdersPage /></Route>
        </div>

        <div>
          <Route path={"/dropdown"} ><DropdownPage /></Route>
          <Route path={"/accordion"} ><AccordionPage /></Route>
          <Route path={"/button"} ><ButtonPage /></Route>
          <Route path={"/modal"} ><ModalPage /></Route>
          <Route path={"/table"} ><TablePage /></Route>
          <Route path={"/counter"} ><CounterPage initialCount={0} /></Route>
          <Route path={"/counterredux"} ><CounterPageRedux initialCount={0} /></Route>

        </div>

      </div>
    </div>
  );
}

export default App;
