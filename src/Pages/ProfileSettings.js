import './ProfileSettings.css';
import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

function ProfileSettings() {
	const [username, setUsername] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]);
	const { toasts, addToast } = useToast();
	const token = localStorage.getItem('token');

	useEffect(() => {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			try {
				const u = JSON.parse(storedUser);
				if (u && u.name) setUsername(u.name);
			} catch {
				// ignore
			}
		}
	}, []);

	const validatePassword = (pass) => {
		const rules = [];
		if (pass.length < 8) rules.push("Password must be at least 8 characters long.");
		if (!/[A-Z]/.test(pass)) rules.push("Password must contain at least one uppercase letter.");
		if (!/[a-z]/.test(pass)) rules.push("Password must contain at least one lowercase letter.");
		if (!/[0-9]/.test(pass)) rules.push("Password must contain at least one number.");
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) rules.push("Password must contain at least one special character.");
		return rules;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError([]);
		if (!token) {
			addToast('Please log in to update your profile.', 'error');
			return;
		}

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

		try {
			const payload = {
				name: username,
				currentPassword: currentPassword || undefined,
				newPassword: newPassword || undefined,
			};
			const res = await fetch('http://localhost:5050/api/user/me', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				addToast(data.message || 'Failed to update profile.', 'error');
				return;
			}
			if (data.user) {
				localStorage.setItem('user', JSON.stringify(data.user));
			}
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			addToast('Profile updated successfully!', 'success');
		} catch (err) {
			console.error(err);
			addToast('Could not connect to the server.', 'error');
		}
	};

	return (
		<>
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

							<button type="submit" className="save-settings-btn">Save Changes</button>
						</form>
					</div>
				</div>
			</div>

			<Toast toasts={toasts} />
		</>
	);
}

export default ProfileSettings;
