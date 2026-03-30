import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from './components/Header';
import Welcome from './Pages/Welcome';
import Events from './Pages/Events';
import LoginOrSignUp from './Pages/LoginOrSignUp'

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
              path: "/login_or_signup",
              element: <LoginOrSignUp />,
          },
          {
              path: "/events",
              element: <Events />,
          },
      ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
