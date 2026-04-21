import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// Import all page components
import Header from './components/Header';
import Welcome from './Pages/Welcome';
import Events from './Pages/Events';
import LoginOrSignUp from './Pages/LoginOrSignUp'
import ProfileSettings from './Pages/ProfileSettings';
import AdminEvents from './Pages/AdminEvents';
import Connect from './Pages/Connect';

/**
 * Layout Component
 * 
 * This component wraps all pages with a consistent structure:
 * - Header component appears at the top of every page
 * - <Outlet /> is a placeholder where child route components are rendered
 * - <main> tag provides semantic HTML structure
 * 
 * Think of this as the "shell" that stays consistent across all pages
 * while the content inside changes based on the current route
 */
const Layout = () => (
    <>
      {/* Header appears on all pages */}
      <Header />
        {/* Main content area */}
        <main>
          {/* Outlet renders the current route's component */}
          <Outlet /> 
        </main>
    </>
)

/**
 * Router Configuration
 * 
 * Defines all routes in the application using React Router v6's createBrowserRouter
 * 
 * Structure:
 * - Parent route ("/") uses Layout component
 * - All child routes render inside Layout's <Outlet />
 * - This ensures Header is present on every page
 * 
 * Routes:
 * - "/" - Welcome/landing page (index route)
 * - "/login_or_signup" - Authentication page
 * - "/events" - Browse and save events
 * - "/connect" - Chat/community feature (demo)
 * - "/profile_settings" - User account settings
 * - "/admin_events" - Admin dashboard for managing events
 */
const router = createBrowserRouter([
  {
      // Parent route - uses Layout wrapper
      path: "/",
      element: <Layout />,
      // Child routes - all render inside Layout's <Outlet />
      children: [
          {
              // Index route (default child route)
              // Renders when path is exactly "/"
              index: true,
              element: <Welcome />
          },
          {
              // Login and Sign-up page
              path: "/login_or_signup",
              element: <LoginOrSignUp />,
          },
          {
              // Events browsing page (works for both guests and logged-in users)
              path: "/events",
              element: <Events />,
          },
          {
              // Connect/chat page (demo community feature)
              path: "/connect",
              element: <Connect />,
          },
          {
              // User profile settings (requires login)
              path: "/profile_settings",
              element: <ProfileSettings />,
          },
          {
              // Admin event management dashboard (requires admin privileges)
              path: "/admin_events",
              element: <AdminEvents />,
          },
      ],
  },
]);

/**
 * App Component - Root of the application
 * 
 * Returns the RouterProvider component which:
 * - Takes the router configuration
 * - Handles all navigation and routing logic
 * - Renders the appropriate component based on current URL
 * 
 * This is the entry point that gets rendered in index.js
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
