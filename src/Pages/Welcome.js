import './Welcome.css';
import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
	const features = [
		{
			icon: '🔍',
			title: 'Discover Events',
			description: 'Browse and find amazing events happening near you'
		},
		{
			icon: '✏️',
			title: 'Create Events',
			description: 'Share and organize your own events with ease'
		},
		{
			icon: '👥',
			title: 'Connect',
			description: 'Meet people and build communities around shared interests'
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
							<div key={index} className="feature-card">
								<div className="feature-icon">{feature.icon}</div>
								<h3>{feature.title}</h3>
								<p>{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Welcome;