import './ProfileSettings.css';
import { useState } from 'react';

function ProfileSettings() {
	const [username, setUsername] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]);
	const [success, setSuccess] = useState('');

	//checks password against rules and returns an array of error messages if any rules are violated
	const validatePassword = (pass) => {
		const rules = [];
		if (pass.length < 8) rules.push("Password must be at least 8 characters long.");
		if (!/[A-Z]/.test(pass)) rules.push("Password must contain at least one uppercase letter.");
		if (!/[a-z]/.test(pass)) rules.push("Password must contain at least one lowercase letter.");
		if (!/[0-9]/.test(pass)) rules.push("Password must contain at least one number.");
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) rules.push("Password must contain at least one special character.");
		return rules;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError([]);
		setSuccess('');

		//Validate new password if provided
		if (newPassword) {
			const validationErrors = validatePassword(newPassword);
			if (validationErrors.length > 0) {
				setError(validationErrors);
				return;
			}

			if (newPassword !== confirmPassword) {
				setError(["Passwords do not match."]);
				return;
			}
		}

		//Submit form logic here
		console.log("Profile updated successfully!");
		setSuccess("Profile updated successfully!");
	};

	return (
		<div className="profile-settings-page">
			<div className="profile-settings-header">
				<div>
					<h1>Profile Settings</h1>
					<p className="profile-settings-subtitle">Manage your account information and preferences.</p>
				</div>
			</div>

			<div className="settings-container">
				<div className="settings-panel">
					<form className="settings-form" onSubmit={handleSubmit}>
						<h2>Account Information</h2>
						<p className="muted">Update your profile details here.</p>

						<div className="form-group">
							<label htmlFor="username">Username</label>
							<input
								id="username"
								type="text"
								placeholder="Enter new username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="current-password">Current Password</label>
							<input
								id="current-password"
								type="password"
								placeholder="Enter current password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="new-password">New Password</label>
							<input
								id="new-password"
								type="password"
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="confirm-password">Confirm New Password</label>
							<input
								id="confirm-password"
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>

						{error.length > 0 && (
							<div className="error-messages">
								{error.map((err, index) => (
									<p key={index} className="error-text">{err}</p>
								))}
							</div>
						)}

						{success && (
							<div className="success-message">
								<p>{success}</p>
							</div>
						)}

						<button type="submit" className="save-settings-btn">Save Changes</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default ProfileSettings;