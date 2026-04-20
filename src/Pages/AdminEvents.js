import './AdminEvents.css';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000';

export default function AdminEvents() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [editingEvent, setEditingEvent] = useState(null);
	
	const [formData, setFormData] = useState({
		title: '',
		date: '',
		location: '',
		category: ''
	});

	const loadEvents = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/events`);
			if (!res.ok) throw new Error('Failed to load events');
			
			const data = await res.json();
			setEvents(Array.isArray(data.events) ? data.events : []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvents();
	}, []);

	const openAddModal = () => {
		setEditingEvent(null);
		setFormData({ title: '', date: '', location: '', category: '' });
		setShowModal(true);
	};

	const openEditModal = (event) => {
		setEditingEvent(event);
		setFormData({
			title: event.title,
			date: event.date,
			location: event.location,
			category: event.category
		});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingEvent(null);
		setFormData({ title: '', date: '', location: '', category: '' });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		try {
			const url = editingEvent 
				? `${API_BASE_URL}/api/events/${editingEvent.id}`
				: `${API_BASE_URL}/api/events`;
			
			const method = editingEvent ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to save event');
			}

			await loadEvents();
			closeModal();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		}
	};

	const handleDelete = async (eventId) => {
		if (!window.confirm('Are you sure you want to delete this event?')) return;

		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to delete event');
			}

			await loadEvents();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		}
	};

	return (
		<div className="admin-events-page">
			<div className="admin-header">
				<div>
					<h1>Admin Events</h1>
					<p className="admin-subtitle">Manage all events - add, edit, or delete.</p>
				</div>
				<button className="add-event-btn" onClick={openAddModal}>
					+ Add Event
				</button>
			</div>

			{error && <div className="error-box">{error}</div>}

			<div className="admin-container">
				<div className="admin-panel">
					<h2>All Events ({events.length})</h2>
					{loading ? (
						<p className="muted">Loading events...</p>
					) : events.length === 0 ? (
						<p className="muted">No events found. Create your first event!</p>
					) : (
						<ul className="admin-event-list">
							{events.map((event) => (
								<li key={event.id} className="admin-event-card">
									<div className="event-main">
										<div className="event-title">{event.title}</div>
										<div className="event-meta">
											{event.date} • {event.location} • {event.category}
										</div>
									</div>
									<div className="event-actions">
										<button 
											className="edit-btn"
											onClick={() => openEditModal(event)}
										>
											Edit
										</button>
										<button 
											className="delete-btn"
											onClick={() => handleDelete(event.id)}
										>
											Delete
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{showModal && (
				<div className="modal-overlay" onClick={closeModal}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
							<button className="close-btn" onClick={closeModal}>×</button>
						</div>
						
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="title">Event Title</label>
								<input
									id="title"
									type="text"
									required
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Enter event title"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="date">Date</label>
								<input
									id="date"
									type="text"
									required
									value={formData.date}
									onChange={(e) => setFormData({ ...formData, date: e.target.value })}
									placeholder="e.g., Jan 15, 2026"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="location">Location</label>
								<input
									id="location"
									type="text"
									required
									value={formData.location}
									onChange={(e) => setFormData({ ...formData, location: e.target.value })}
									placeholder="Enter location"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="category">Category</label>
								<input
									id="category"
									type="text"
									required
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									placeholder="e.g., Music, Sports, Tech"
								/>
							</div>

							<div className="modal-actions">
								<button type="button" className="cancel-btn" onClick={closeModal}>
									Cancel
								</button>
								<button type="submit" className="submit-btn">
									{editingEvent ? 'Update Event' : 'Create Event'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}