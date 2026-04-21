import './Welcome.css';
import { Link } from 'react-router-dom';

function Welcome() {
	/**
	 * Features array - defines the three main feature cards displayed on the welcome page
	 * Each feature has:
	 * - icon: emoji displayed at the top of the card
	 * - title: heading text for the feature
	 * - description: brief explanation of what the feature does
	 * - to: route path the card links to when clicked
	 */
	const features = [
		{
			icon: '🔍',
			title: 'Discover Events',
			description: 'Browse and find amazing events happening near you',
			to: '/events' // Links to main events page
		},
		{
			icon: '🔖',
			title: 'Save Events',
			description: 'Bookmark events you love and keep track of what\'s coming up',
			to: '/events#my-events' // Links to events page, scrolls to "My Events" section
		},
		{
			icon: '👥',
			title: 'Connect',
			description: 'Meet people and build communities around shared interests',
			to: '/connect' // Links to connect/community page
		}
	];

	return (
		// Main container for the entire welcome page
		<div className="welcome-container">
			{/* Content wrapper - centers and constrains the content width */}
			<div className="welcome-content">
				
				{/* Main title section - large "Welcome To Eventify!" heading */}
				<div className="welcome-title">
					<h1>Welcome To <br /> Eventify!</h1>
				</div>
				
				{/* Subtitle/tagline section */}
				<div className="welcome-text">
					<p>Discover and create amazing events with Eventify.</p>
				</div>
				
				{/* Primary call-to-action button - routes user to events page */}
				<Link to="/events" className="cta-button">Explore Events</Link>

				{/* Features section - displays the three main feature cards */}
				<div className="features-section">
					{/* Grid container for feature cards */}
					<div className="features-grid">
						{/* 
							Map through features array to create clickable feature cards
							Each card is a Link component that navigates to the specified route
						*/}
						{features.map((feature, index) => (
							<Link 
								key={index} // Unique key for React list rendering
								to={feature.to} // Destination route
								className="feature-card feature-card-link" // CSS classes for styling
							>
								{/* Icon display (emoji) */}
								<div className="feature-icon">{feature.icon}</div>
								
								{/* Feature title */}
								<h3>{feature.title}</h3>
								
								{/* Feature description */}
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
