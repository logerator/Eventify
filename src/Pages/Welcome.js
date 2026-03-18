import './Welcome.css';
import React from 'react';

function Welcome() {
	return (
		<div className="welcome-container">
			<div className="welcome-title">
				<h1>Welcome To <br /> Eventify!</h1>
			</div>
			<div className="welcome-text">
				<p>Discover and create amazing events with Eventify.</p>
			</div>
		</div>
	);
}

export default Welcome;