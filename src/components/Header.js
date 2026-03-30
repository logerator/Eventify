import './Header.css';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
	const location = useLocation();

	const isWelcomePage = location.pathname === "/";
	const isLoginOrSignUpPage = location.pathname === "/login_or_signup";
	const isEventsPage = location.pathname === "/events";

	return (
		<header className="header-container">
			{isLoginOrSignUpPage ? (
				<Link to="/" className="logo-wrapper">
					<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
					<h3 className="brand-name">Eventify</h3>
				</Link>
			) : (
				<div className="logo-wrapper">
					<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
					<h3 className="brand-name">Eventify</h3>
				</div>
			)}

			<nav>
				{(isWelcomePage || isEventsPage) && (
					<>
						<Link to="/events" className="login-btn">
							Events
						</Link>
						<Link to="/login_or_signup" className="signup-btn">
							Login/Sign Up
						</Link>
					</>
				)}
			</nav>

		</header>
	);
}
