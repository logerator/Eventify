import './LoginOrSignUp.css';
import React, { useState } from 'react';

function LoginOrSignUp() {
	const [isSignUp, setIsSignUp] = useState(false);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]);

	const toggleForm = () => {
		setIsSignUp(!isSignUp);

		//clears errors and previous input when switching forms
		setPassword('');
		setConfirmPassword('');
		setError([]);
	};

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

	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		setError(validatePassword(newPassword));
	};

	const handleSignUpSubmit = (e) => {
		e.preventDefault();

		const validationErrors = validatePassword(password);
		if (validationErrors.length > 0) {
			setError(validationErrors);
			return;
		}

		if (password !== confirmPassword) {
			setError(["Passwords do not match."]);
			return;
		}

		//Submit form logic here
		console.log("Sign up form submitted successfully!");
	};

	const handleLoginSubmit = (e) => {
		e.preventDefault();
		//Login form logic here
		console.log("Login form submitted successfully!");
	};

	return (
		<div className={`container ${isSignUp ? "active" : ""}`}>
			<div className="form-container sign-up">
				<form onSubmit={handleSignUpSubmit}>
					<h1>Create Account</h1>
					<span>Register with E-mail</span>
					<input type="text" placeholder="Name" required />
					<input type="email" placeholder="E-mail" required />
					<input 
						type="password" 
						placeholder="Password" 
						required
						value={password}
						onChange={handlePasswordChange}
					/>
					<input 
						type="password" 
						placeholder="Confirm Password" 
						required
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					
					{error.length > 0 && (
						<div className="error-messages">
							{error.map((err, index) => (
								<p key={index} className="error-text">{err}</p>
							))}
						</div>
					)}
					
					<button type="submit">Sign Up</button>
				</form>
			</div>

			<div className="form-container login">
				<form onSubmit={handleLoginSubmit}>
					<h1>Login</h1>
					<span>Login With Email & Password</span>
					<input type="email" placeholder="E-mail" required />
					<input type="password" placeholder="Password" required />
					<a href="#">Forgot Password?</a>
					<button type="submit">Sign In</button>
				</form>
			</div>

			<div className="toggle-container">
				<div className="toggle">
					<div className="toggle-panel toggle-left">
						<h1>Welcome Back To <br /> Eventify!</h1>
						<p>Login With Email & Password</p>
						<button className="hidden" type="button" onClick={toggleForm}>Sign In</button>
					</div>

					<div className="toggle-panel toggle-right">
						<h1>Welcome To <br /> Eventify!</h1>
						<p>Create An Account And Start Discovering!</p>
						<button className="hidden" type="button" onClick={toggleForm}>Sign Up</button>
					</div>
				</div>
			</div>

		</div>

	);
}

export default LoginOrSignUp;