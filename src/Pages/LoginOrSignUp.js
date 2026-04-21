/*
 * Login and Sign-up Page Animation and Structure
 * Original code and tutorial by: Code with Patel
 * Video Title: Animated Login Page Using Html css & Javascript || Animated Registration Page
 * URL: https://www.youtube.com/watch?v=wimb40eZdGs
 * Accessed on: 3/29/2026
 */

import './LoginOrSignUp.css';
import React, { useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

// SVG icon component for "show password" (eye open)
function EyeIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
			<circle cx="12" cy="12" r="3"/>
		</svg>
	);
}

// SVG icon component for "hide password" (eye with slash)
function EyeOffIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
			<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
			<line x1="1" y1="1" x2="23" y2="23"/>
		</svg>
	);
}

function LoginOrSignUp() {
	// State to toggle between login and sign-up forms
			const [isSignUp, setIsSignUp] = useState(false);

	// Sign-up form password states
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]); // Array of validation error messages

	// Sign-up form input states
	const [signupName, setSignupName] = useState('');
	const [signupEmail, setSignupEmail] = useState('');
	
	// Login form input states
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	// States to toggle password visibility for each password field
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Custom hook for displaying toast notifications
	const { toasts, addToast } = useToast();

	/**
	 * Toggles between login and sign-up forms
	 * Clears all input fields and error messages when switching
	 */
	const toggleForm = () => {
		setIsSignUp(!isSignUp);

		// Clear all form inputs and errors
		setSignupName('');
		setSignupEmail('');
		setLoginEmail('');
		setLoginPassword('');
		setPassword('');
		setConfirmPassword('');
		setError([]);
	};

	/**
	 * Validates password against security rules
	 * @param {string} pass - The password to validate
	 * @returns {Array<string>} Array of error messages (empty if valid)
	 */
	const validatePassword = (pass) => {
		const rules = [];
		// Check minimum length (8 characters)
		if (pass.length < 8) rules.push("Password must be at least 8 characters long.");
		// Check for at least one uppercase letter
		if (!/[A-Z]/.test(pass)) rules.push("Password must contain at least one uppercase letter.");
		// Check for at least one lowercase letter
		if (!/[a-z]/.test(pass)) rules.push("Password must contain at least one lowercase letter.");
		// Check for at least one number
		if (!/[0-9]/.test(pass)) rules.push("Password must contain at least one number.");
		// Check for at least one special character
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) rules.push("Password must contain at least one special character.");
		return rules;
	};

	/**
	 * Handles password input changes and performs real-time validation
	 * Updates error state as user types
	 */
	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		// Validate password and update error messages in real-time
		setError(validatePassword(newPassword));
	};

	/**
	 * Handles sign-up form submission
	 * Validates inputs, sends data to backend, and handles response
	 */
	const handleSignUpSubmit = async (e) => {
		e.preventDefault(); // Prevent default form submission
		setError([]);

		// Validate password one final time before submission
		const validationErrors = validatePassword(password);
		if (validationErrors.length > 0) {
			setError(validationErrors);
			return;
		}

		// Check if passwords match
		if (password !== confirmPassword) {
			setError(["Passwords do not match."]);
			return;
		}

		try {
			// Send POST request to signup API endpoint
			const res = await fetch("https://eventify-production-9f2a.up.railway.app/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name: signupName,
					email: signupEmail,
					password
				})
			});

			const data = await res.json();

			// Handle non-OK responses (errors from backend)
			if (!res.ok) {
				addToast(data.message || "Signup failed.", 'error');
				return;
			}

			// Success: show success toast and switch to login form
			addToast("Account created! Please sign in.", 'success');
			
			// Clear sign-up form fields
			setSignupName('');
			setSignupEmail('');
			setPassword('');
			setConfirmPassword('');
			
			// Switch to login form
			setIsSignUp(false);
		} catch (err) {
			// Handle network errors or other exceptions
			console.error(err);
			addToast("Could not connect to the server.", 'error');
		}
	};

	/**
	 * Handles login form submission
	 * Authenticates user and redirects to events page on success
	 */
	const handleLoginSubmit = async (e) => {
		e.preventDefault(); // Prevent default form submission

		try {
			// Send POST request to login API endpoint
			const res = await fetch("https://eventify-production-9f2a.up.railway.app/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email: loginEmail,
					password: loginPassword
				})
			});

			const data = await res.json();

			// Handle non-OK responses (invalid credentials, etc.)
			if (!res.ok) {
				addToast(data.message || "Login failed.", 'error');
				return;
			}

			// Success: store authentication token and user data in localStorage
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			// Redirect user to events page after successful login
			window.location.href = "/events";
		} catch (err) {
			// Handle network errors or other exceptions
			console.error(err);
			addToast("Could not connect to the server.", 'error');
		}
	};

	return (
		<>
			{/* Main container - 'active' class added when isSignUp is true */}
			<div className={`container ${isSignUp ? "active" : ""}`}>
				
				{/* SIGN-UP FORM SECTION */}
				<div className="form-container sign-up">
					<form onSubmit={handleSignUpSubmit}>
						<h1>Create Account</h1>
						<span>Register with E-mail</span>
						
						{/* Name input field */}
						<input
							type="text"
							placeholder="Name"
							required
							value={signupName}
							onChange={(e) => setSignupName(e.target.value)}
						/>
						
						{/* Email input field */}
						<input
							type="email"
							placeholder="E-mail"
							required
							value={signupEmail}
							onChange={(e) => setSignupEmail(e.target.value)}
						/>
						
						{/* Password input with show/hide toggle */}
						<div className="password-wrapper">
							<input
								type={showSignupPassword ? 'text' : 'password'}
								placeholder="Password"
								required
								value={password}
								onChange={handlePasswordChange} // Real-time validation
							/>
							{/* Toggle button to show/hide password */}
							<button type="button" className="eye-btn" onClick={() => setShowSignupPassword(v => !v)}>
								{showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>
						
						{/* Confirm Password input with show/hide toggle */}
						<div className="password-wrapper">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Confirm Password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							{/* Toggle button to show/hide confirm password */}
							<button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(v => !v)}>
								{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>

						{/* Display validation errors if any exist */}
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

				{/* LOGIN FORM SECTION */}
				<div className="form-container login">
					<form onSubmit={handleLoginSubmit}>
						<h1>Login</h1>
						<span>Login With Email & Password</span>
						
						{/* Email input field */}
						<input
							type="email"
							placeholder="E-mail"
							required
							value={loginEmail}
							onChange={(e) => setLoginEmail(e.target.value)}
						/>
						
						{/* Password input with show/hide toggle */}
						<div className="password-wrapper">
							<input
								type={showLoginPassword ? 'text' : 'password'}
								placeholder="Password"
								required
								value={loginPassword}
								onChange={(e) => setLoginPassword(e.target.value)}
							/>
							{/* Toggle button to show/hide password */}
							<button type="button" className="eye-btn" onClick={() => setShowLoginPassword(v => !v)}>
								{showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>
						
						<button type="submit">Sign In</button>
					</form>
				</div>

				{/* TOGGLE CONTAINER - Animated panel that slides between login/signup */}
				<div className="toggle-container">
					<div className="toggle">
						{/* Left panel - shown when on signup form */}
						<div className="toggle-panel toggle-left">
							<h1>Welcome Back To <br /> Eventify!</h1>
							<p>Login With Email & Password</p>
							{/* Button to switch to login form */}
							<button className="hidden" type="button" onClick={toggleForm}>Sign In</button>
						</div>

						{/* Right panel - shown when on login form */}
						<div className="toggle-panel toggle-right">
							<h1>Welcome To <br /> Eventify!</h1>
							<p>Create An Account And Start Discovering!</p>
							{/* Button to switch to signup form */}
							<button className="hidden" type="button" onClick={toggleForm}>Sign Up</button>
						</div>
					</div>
				</div>
			</div>

			{/* Toast notification component - displays success/error messages */}
			<Toast toasts={toasts} />
		</>
	);
}

export default LoginOrSignUp;
