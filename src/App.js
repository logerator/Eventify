import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Header from './components/Header';
import Welcome from './Pages/Welcome';
import Events from './Pages/Events';
import LoginOrSignUp from './Pages/LoginOrSignUp'
import ProfileSettings from './Pages/ProfileSettings';
import AdminEvents from './Pages/AdminEvents';
import Connect from './Pages/Connect';

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
          {
              path: "/connect",
              element: <Connect />,
          },
          {
              path: "/profile_settings",
              element: <ProfileSettings />,
          },
          {
              path: "/admin_events",
              element: <AdminEvents />,
          },
      ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
