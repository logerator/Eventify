import { useState, useCallback } from 'react';

export function useToast() {
	const [toasts, setToasts] = useState([]);

	const addToast = useCallback((message, type = 'success') => {
		const id = Date.now();
		setToasts(prev => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts(prev => prev.filter(t => t.id !== id));
		}, 3500);
	}, []);

	return { toasts, addToast };
}
