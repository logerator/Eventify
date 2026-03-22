import './Login.css';

function Login() {
	return (
		<div className="login-page">
			<div className="login-box">
				<h1>Login</h1>
				<form className='login-form'>
					<input type="email"		placeholder="Email"		className="input-field"/> <br />
					<input type="password"	placeholder="Password"	className="input-field"/> <br />
					<button type="submit" className="submit-btn">Login</button>
				</form>
			</div>
		</div>
	);
}

export default Login;