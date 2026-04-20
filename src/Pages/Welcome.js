import './Welcome.css';
import { Link } from 'react-router-dom';

function Welcome() {
	const features = [
		{
			icon: '🔍',
			title: 'Discover Events',
			description: 'Browse and find amazing events happening near you',
			to: '/events'
		},
		{
			icon: '🔖',
			title: 'Save Events',
			description: 'Bookmark events you love and keep track of what\'s coming up',
			to: '/events#my-events'
		},
		{
			icon: '👥',
			title: 'Connect',
			description: 'Meet people and build communities around shared interests',
			to: '/connect'
		}
	];

	return (
		<div className="welcome-container">
			<div className="welcome-content">
				<div className="welcome-title">
					<h1>Welcome To <br /> Eventify!</h1>
				</div>
				<div className="welcome-text">
					<p>Discover and create amazing events with Eventify.</p>
				</div>
				<Link to="/events" className="cta-button">Explore Events</Link>

				<div className="features-section">
					<div className="features-grid">
						{features.map((feature, index) => (
							<Link key={index} to={feature.to} className="feature-card feature-card-link">
								<div className="feature-icon">{feature.icon}</div>
								<h3>{feature.title}</h3>
								<p>{feature.description}</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Welcome;
