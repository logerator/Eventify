import './ProfileSettings.css';
import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

function ProfileSettings() {
	// State variables for form inputs
	const [username, setUsername] = useState(''); // User's display name
	const [currentPassword, setCurrentPassword] = useState(''); // Required to verify identity before changing password
	const [newPassword, setNewPassword] = useState(''); // New password user wants to set
	const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation of new password
	const [error, setError] = useState([]); // Array of validation error messages
	
	// Custom hook for displaying toast notifications
	const { toasts, addToast } = useToast();
	
	// Retrieve authentication token from localStorage (used for API authorization)
	const token = localStorage.getItem('token');

	/**
	 * useEffect - Runs once when component mounts
	 * Loads the current user's name from localStorage and populates the username field
	 */
	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			try {
				// Parse the JSON string stored in localStorage
				const u = JSON.parse(storedUser);
				// If user object exists and has a name, populate the username field
				if (u && u.name) setUsername(u.name);
			} catch {
				// Silently ignore JSON parse errors (corrupted data)
			}
		}
	}, []); // Empty dependency array = run only once on mount

	/**
	 * Validates password against security requirements
	 * @param {string} pass - The password to validate
	 * @returns {Array<string>} Array of error messages (empty if valid)
	 * 
	 * Password must have:
	 * - At least 8 characters
	 * - At least one uppercase letter
	 * - At least one lowercase letter
	 * - At least one number
	 * - At least one special character
	 */
	const validatePassword = (pass) => {
		const rules = [];
		if (pass.length < 8) rules.push("Password must be at least 8 characters long.");
		if (!/[A-Z]/.test(pass)) rules.push("Password must contain at least one uppercase letter.");
		if (!/[a-z]/.test(pass)) rules.push("Password must contain at least one lowercase letter.");
		if (!/[0-9]/.test(pass)) rules.push("Password must contain at least one number.");
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) rules.push("Password must contain at least one special character.");
		return rules;
	};

	/**
	 * Handles form submission for updating user profile
	 * Can update username only, password only, or both
	 * Requires current password if changing to a new password
	 */
	const handleSubmit = async (e) => {
		e.preventDefault(); // Prevent default form submission behavior
		setError([]); // Clear any previous error messages
		
		// Check if user is logged in (has authentication token)
		if (!token) {
			addToast('Please log in to update your profile.', 'error');
			return;
		}

		// If user wants to change password, validate the new password
		if (newPassword) {
			const validationErrors = validatePassword(newPassword);
			if (validationErrors.length > 0) {
				setError(validationErrors); // Display validation errors
				return;
			}

			// Check if new password and confirmation match
			if (newPassword !== confirmPassword) {
				setError(["Passwords do not match."]);
				return;
			}
		}

		try {
			// Build the request payload
			// Only include password fields if user is changing password
			const payload = {
				name: username, // Always send username (may or may not have changed)
				currentPassword: currentPassword || undefined, // Only include if provided
				newPassword: newPassword || undefined, // Only include if provided
			};
			
			// Send PUT request to update profile endpoint
			const res = await fetch('https://eventify-production-9f2a.up.railway.app/api/user/me', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`, // Include JWT token for authentication
				},
				body: JSON.stringify(payload),
			});
			
			// Parse response JSON, use empty object if parsing fails
			const data = await res.json().catch(() => ({}));
			
			// Handle non-OK responses (validation errors, wrong current password, etc.)
			if (!res.ok) {
				addToast(data.message || 'Failed to update profile.', 'error');
				return;
			}
			
			// Success: update localStorage with new user data
			if (data.user) {
				localStorage.setItem('user', JSON.stringify(data.user));
			}
			
			// Clear password fields for security (username keeps its value)
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			
			// Show success notification
			addToast('Profile updated successfully!', 'success');
		} catch (err) {
			// Handle network errors or other exceptions
			console.error(err);
			addToast('Could not connect to the server.', 'error');
		}
	};

	return (
		<>
			{/* Main page container */}
			<div className="profile-settings-page">
				
				{/* Header section with title and subtitle */}
				<div className="profile-settings-header">
					<div>
						<h1>Profile Settings</h1>
						<p className="profile-settings-subtitle">Manage your account information and preferences.</p>
					</div>
				</div>

				{/* Settings container - holds the form panel */}
				<div className="settings-container">
					{/* White panel/card containing the form */}
					<div className="settings-panel">
						<form className="settings-form" onSubmit={handleSubmit}>
							<h2>Account Information</h2>
							<p className="muted">Update your profile details here.</p>

							{/* Username input field */}
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

							{/* Current password field - required to verify identity before password change */}
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

							{/* New password field - leave empty if not changing password */}
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

							{/* Confirm new password field - must match new password */}
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

							{/* Display validation errors if any exist */}
							{error.length > 0 && (
								<div className="error-messages">
									{error.map((err, index) => (
										<p key={index} className="error-text">{err}</p>
									))}
								</div>
							)}

							{/* Submit button to save changes */}
							<button type="submit" className="save-settings-btn">Save Changes</button>
						</form>
					</div>
				</div>
			</div>

			{/* Toast notification component - displays success/error messages */}
			<Toast toasts={toasts} />
		</>
	);
}

export default ProfileSettings;
