import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
	// React Router hooks for navigation and location tracking
	const location = useLocation(); // Get current URL path
	const navigate = useNavigate(); // Function to programmatically navigate to routes
	
	// State variables
	const [user, setUser] = useState(null); // Current logged-in user object (null if not logged in)
	const [dropdownOpen, setDropdownOpen] = useState(false); // Controls user dropdown menu visibility

	// Boolean flags to check which page is currently active
	// These aren't currently used but can help with conditional rendering
	const isWelcomePage = location.pathname === "/";
	const isLoginOrSignUpPage = location.pathname === "/login_or_signup";
	const isEventsPage = location.pathname === "/events";
	const isProfileSettingsPage = location.pathname === "/profile_settings";

	/**
	 * useEffect - Loads user data from localStorage when component mounts or route changes
	 * 
	 * Runs every time the pathname changes (user navigates to a different page)
	 * This ensures the header updates when:
	 * - User logs in (redirects to /events)
	 * - User logs out (redirects to /)
	 * - User navigates between pages
	 */
	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			// Parse JSON string from localStorage into user object
			setUser(JSON.parse(storedUser));
		} else {
			// No user data = not logged in
			setUser(null);
		}
	}, [location.pathname]); // Re-run whenever the URL path changes

	/**
	 * Handles user logout
	 * - Removes authentication token and user data from localStorage
	 * - Clears user state
	 * - Closes dropdown menu
	 * - Redirects to home page
	 */
	const handleLogout = () => {
		// Clear authentication data from localStorage
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		
		// Clear user state (triggers header re-render)
		setUser(null);
		
		// Close dropdown menu
		setDropdownOpen(false);
		
		// Redirect to home/welcome page
		navigate("/");
	};

	return (
		<header className="header-container">
			{/* Logo section - clicking navigates to home page */}
			<Link to="/" className="logo-wrapper">
				<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
				<h3 className="brand-name">Eventify</h3>
			</Link>

			{/* Navigation menu - content changes based on login state */}
			<nav>
				{/* GUEST USER NAVIGATION (not logged in) */}
				{!user && (
					<>
						{/* Events link - browse events without logging in */}
						<Link to="/events" className="events-btn">
							Events
						</Link>

						{/* Login/Sign Up button */}
						<Link to="/login_or_signup" className="signup-btn">
							Login/Sign Up
						</Link>
					</>
				)}

				{/* LOGGED-IN USER NAVIGATION */}
				{user && (
					<>
						{/* Events link */}
						<Link to="/events" className="events-btn">
							Events
						</Link>

						{/* User dropdown menu */}
						<div className="dropdown">
							{/* Dropdown toggle button - shows user's name */}
							<button 
								className="profile-link"
								onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown visibility
							>
								Hello, {user.name}! ▾
							</button>
							
							{/* Dropdown menu - only visible when dropdownOpen is true */}
							{dropdownOpen && (
								<div className="dropdown-menu">
									{/* Admin Events link - only visible if user is an admin */}
									{user?.is_admin && (
										<Link 
											to="/admin_events" 
											className="dropdown-item"
											onClick={() => setDropdownOpen(false)} // Close dropdown after click
										>
											Admin Events
										</Link>
									)}
									
									{/* Profile Settings link - visible to all logged-in users */}
									<Link 
										to="/profile_settings" 
										className="dropdown-item"
										onClick={() => setDropdownOpen(false)} // Close dropdown after click
									>
										Profile Settings
									</Link>
									
									{/* Logout button */}
									<button 
										className="dropdown-item logout-btn"
										onClick={handleLogout} // Logs out and redirects
									>
										Logout
									</button>
								</div>
							)}
						</div>
					</>
				)}
			</nav>

		</header>
	);
}
