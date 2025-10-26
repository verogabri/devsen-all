import { createBrowserRouter, RouterProvider } from "react-router-dom"; 

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { 
        index: true, 
        element: <HomePage />,
        loader: homeLoader
      },
      { 
        path: "/search", 
        element: <SearchPage />, 
        loader: searchLoader
      },
      { 
        path: "/packages/:name", 
        element: <DetailsPage />,
        loader: detailsLoader
      },
    ],
  },
]);