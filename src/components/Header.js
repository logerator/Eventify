import './Header.css';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
	const location = useLocation();

	const isWelcomePage = location.pathname === "/";

	return (
		<header className="header-container">
			<div className="logo-wrapper">
				<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
				<h3 className="brand-name">Eventify</h3>
			</div>

			<nav>
				{isWelcomePage && (
					<>
						<Link to="/login">
							<button className="login-btn">Login</button>
						</Link>
						<Link to="/signup">
							<button className="signup-btn">Sign Up</button>
						</Link>
					</>
				)}
			</nav>

		</header>
	);
}
