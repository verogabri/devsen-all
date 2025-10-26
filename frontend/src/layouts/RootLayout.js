import { Outlet } from 'react-router-dom';
import ReactRouterSidebar from '../components/ReactRouterSidebar/ReactRouterSidebar';

function RootLayout() {
  return (
    <div className='container mx-auto grid grid-cols-6 gap-4 mt-4'>
      <div className="">
        <ReactRouterSidebar />
      </div>
      <div className="col-span-5">
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;