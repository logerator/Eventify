import './Header.css';

export default function Header() {
		return (
			<header className="header-container">
				<div className="logo-wrapper">
					<img src="/eventify-logo-clear.png" alt="Eventify Logo" className="logo-img" />
					<h3 className="brand-name">Eventify</h3>
				</div>
			</header>
	);
}
