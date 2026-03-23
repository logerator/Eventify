import './Header.css';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
	const location = useLocation();

	const isWelcomePage = location.pathname === "/";
	const isLoginPage = location.pathname === "/login";
	const isSignUpPage = location.pathname === "/signup";

	return (
		<header className="header-container">
			{(isLoginPage || isSignUpPage) ? (
				<Link to="/" className="logo-wrapper">
					<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
					<h3 className="brand-name">Eventify</h3>
				</Link>
			) : (
				<div to="/" className="logo-wrapper">
					<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
					<h3 className="brand-name">Eventify</h3>
				</div>
			)}

			<nav>
				{isWelcomePage && (
					<>
						<Link to="/login" className="login-btn">
							Login
						</Link>
						<Link to="/signup" className="signup-btn">
							Sign Up
						</Link>
					</>
				)}
			</nav>

		</header>
	);
}
