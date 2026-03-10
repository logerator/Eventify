import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from './components/Header';
import Login from './Pages/Login';
import SignUp from './Pages/SignUp';
import Welcome from './Pages/Welcome';

const Layout = () => (
    <>
      <Header />
        <main>
          <Outlet /> 
        </main>
    </>
)

const router = createBrowserRouter([
  {
      path: "/",
      element: <Layout />,
      children: [
          {
              index: true,
              element: <Welcome />
          },
          {
              path: "/login",
              element: <Login />,
          },
          {
              path: "/signup",
              element: <SignUp />,
          },
      ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
