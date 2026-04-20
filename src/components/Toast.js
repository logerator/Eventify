import './Toast.css';

function Toast({ toasts }) {
	if (!toasts.length) return null;
	return (
		<div className="toast-container">
			{toasts.map(t => (
				<div key={t.id} className={`toast toast-${t.type}`}>
					{t.message}
				</div>
			))}
		</div>
	);
}

export default Toast;
