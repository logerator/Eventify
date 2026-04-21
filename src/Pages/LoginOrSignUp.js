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

function EyeIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
			<circle cx="12" cy="12" r="3"/>
		</svg>
	);
}

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
	const [isSignUp, setIsSignUp] = useState(false);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState([]);

	const [signupName, setSignupName] = useState('');
	const [signupEmail, setSignupEmail] = useState('');
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { toasts, addToast } = useToast();

	const toggleForm = () => {
		setIsSignUp(!isSignUp);

		//clears errors and previous input when switching forms
		setSignupName('');
		setSignupEmail('');
		setLoginEmail('');
		setLoginPassword('');
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

	const handleSignUpSubmit = async (e) => {
		e.preventDefault();
		setError([]);

		const validationErrors = validatePassword(password);
		if (validationErrors.length > 0) {
			setError(validationErrors);
			return;
		}

		if (password !== confirmPassword) {
			setError(["Passwords do not match."]);
			return;
		}

		try {
			const res = await fetch("https://eventify-production-bbb4.up.railway.app/api/auth/signup", {
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

			if (!res.ok) {
				addToast(data.message || "Signup failed.", 'error');
				return;
			}

			addToast("Account created! Please sign in.", 'success');
			setSignupName('');
			setSignupEmail('');
			setPassword('');
			setConfirmPassword('');
			setIsSignUp(false);
		} catch (err) {
			console.error(err);
			addToast("Could not connect to the server.", 'error');
		}
	};

	const handleLoginSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch("https://eventify-production-bbb4.up.railway.app/api/auth/login", {
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

			if (!res.ok) {
				addToast(data.message || "Login failed.", 'error');
				return;
			}

			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			//Send user to events page after successful login
			window.location.href = "/events";
		} catch (err) {
			console.error(err);
			addToast("Could not connect to the server.", 'error');
		}
	};

	return (
		<>
			<div className={`container ${isSignUp ? "active" : ""}`}>
				<div className="form-container sign-up">
					<form onSubmit={handleSignUpSubmit}>
						<h1>Create Account</h1>
						<span>Register with E-mail</span>
						<input
							type="text"
							placeholder="Name"
							required
							value={signupName}
							onChange={(e) => setSignupName(e.target.value)}
						/>
						<input
							type="email"
							placeholder="E-mail"
							required
							value={signupEmail}
							onChange={(e) => setSignupEmail(e.target.value)}
						/>
						<div className="password-wrapper">
							<input
								type={showSignupPassword ? 'text' : 'password'}
								placeholder="Password"
								required
								value={password}
								onChange={handlePasswordChange}
							/>
							<button type="button" className="eye-btn" onClick={() => setShowSignupPassword(v => !v)}>
								{showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>
						<div className="password-wrapper">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Confirm Password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							<button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(v => !v)}>
								{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>

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
						<input
							type="email"
							placeholder="E-mail"
							required
							value={loginEmail}
							onChange={(e) => setLoginEmail(e.target.value)}
						/>
						<div className="password-wrapper">
							<input
								type={showLoginPassword ? 'text' : 'password'}
								placeholder="Password"
								required
								value={loginPassword}
								onChange={(e) => setLoginPassword(e.target.value)}
							/>
							<button type="button" className="eye-btn" onClick={() => setShowLoginPassword(v => !v)}>
								{showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
							</button>
						</div>
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

			<Toast toasts={toasts} />
		</>
	);
}

export default LoginOrSignUp;
