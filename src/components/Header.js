import './Header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
	const location = useLocation();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const isWelcomePage = location.pathname === "/";
	const isLoginOrSignUpPage = location.pathname === "/login_or_signup";
	const isEventsPage = location.pathname === "/events";
	const isProfileSettingsPage = location.pathname === "/profile_settings";

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		} else {
			setUser(null);
		}
	}, [location.pathname]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setUser(null);
		setDropdownOpen(false);
		navigate("/");
	};

	return (
		<header className="header-container">
			<Link to="/" className="logo-wrapper">
				<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
				<h3 className="brand-name">Eventify</h3>
			</Link>

			<nav>
				{!user && (
					<>
						<Link to="/events" className="events-btn">
							Events
						</Link>

						<Link to="/login_or_signup" className="signup-btn">
							Login/Sign Up
						</Link>
					</>
				)}

				{user && (
					<>
						<Link to="/events" className="events-btn">
							Events
						</Link>

						<div className="dropdown">
							<button 
								className="profile-link"
								onClick={() => setDropdownOpen(!dropdownOpen)}
							>
								Hello, {user.name}! ▾
							</button>
							
							{dropdownOpen && (
								<div className="dropdown-menu">
									{user?.is_admin && (
										<Link 
											to="/admin_events" 
											className="dropdown-item"
											onClick={() => setDropdownOpen(false)}
										>
											Admin Events
										</Link>
									)}
									<Link 
										to="/profile_settings" 
										className="dropdown-item"
										onClick={() => setDropdownOpen(false)}
									>
										Profile Settings
									</Link>
									<button 
										className="dropdown-item logout-btn"
										onClick={handleLogout}
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
