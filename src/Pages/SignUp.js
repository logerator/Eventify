import './SignUp.css';
import { useState } from 'react';

function SignUp() {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]);

	const validatePasswrod = (pass) => {
		const rules = [];
		if (pass.length < 8) rules.push("Password must be at least 8 characters long.");
		if (!/[A-Z]/.test(pass)) rules.push("Password must contain at least one uppercase letter.");
		if (!/[a-z]/.test(pass)) rules.push("Password must contain at least one lowercase letter.");
		if (!/[0-9]/.test(pass)) rules.push("Password must contain at least one number.");
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) rules.push("Password must contain at least one special character.");
		return rules;
	};

	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		setError(validatePasswrod(newPassword));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const validationErrors = validatePasswrod(password);
		if (validationErrors.length > 0) {
			setError(validationErrors);
			return;
		}

		if (password !== confirmPassword) {
			setError(["Passwords do not match."]);
			return;
		}

		//Submit form logic here
		console.log("Form submitted successfully!");
	};

	return (
		<div className="signup-page">
			<div className="signup-box">
				<h1>Sign Up</h1>
				<form className="signup-form" onSubmit={handleSubmit}>
					<input type="text"		placeholder="Username"			
					required className="input-field"/> <br />

					<input type="email"		placeholder="Email"				
					required className="input-field"/> <br />

					<input type="password"	placeholder="Password"			
					required className="input-field"
					value={password} onChange={handlePasswordChange}/> <br />

					<input type="password"	placeholder="Confirm Password"	
					required className="input-field"
					value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/> <br />

					{error.length > 0 && (
						<div className="error-messages">
							{error.map((err, index) => (
								<p key={index} className="error-text">{err}</p>
							))}
						</div>
					)}

					<button type="submit" className="submit-btn">Create Account</button>
				</form>
			</div>
		</div>
	);
}

export default SignUp;