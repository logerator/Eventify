import './AdminEvents.css';
import { useEffect, useState } from 'react';

// Base URL for API calls - points to production backend server
const API_BASE_URL = 'https://eventify-production-bbb4.up.railway.app';

export default function AdminEvents() {
	// State variables for managing events and UI
	const [events, setEvents] = useState([]); // All events from database
	const [loading, setLoading] = useState(false); // Loading state for API calls
	const [error, setError] = useState(''); // Error messages to display
	const [showModal, setShowModal] = useState(false); // Controls modal visibility
	const [editingEvent, setEditingEvent] = useState(null); // Event being edited (null = creating new)
	
	/**
	 * Form data state - holds all input values for create/edit modal
	 * Used for both creating new events and editing existing ones
	 */
	const [formData, setFormData] = useState({
		title: '',
		date: '',
		location: '',
		category: ''
	});

	/**
	 * Fetches all events from the backend API
	 * Called on component mount and after create/update/delete operations
	 */
	const loadEvents = async () => {
		setLoading(true);
		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/events`);
			if (!res.ok) throw new Error('Failed to load events');
			
			const data = await res.json();
			// Ensure events is always an array (defensive programming)
			setEvents(Array.isArray(data.events) ? data.events : []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	/**
	 * useEffect - Runs once when component mounts
	 * Loads all events on initial page load
	 */
	useEffect(() => {
		loadEvents();
	}, []); // Empty dependency array = run only once

	/**
	 * Opens modal for creating a new event
	 * Clears editingEvent and resets form to empty state
	 */
	const openAddModal = () => {
		setEditingEvent(null); // null = creating new event
		// Reset form with all empty fields
		setFormData({ title: '', date: '', location: '', category: '', imageUrl: '', themeColor: '', description: '' });
		setShowModal(true);
	};

	/**
	 * Opens modal for editing an existing event
	 * Pre-fills form with the event's current data
	 * @param {Object} event - The event object to edit
	 */
	const openEditModal = (event) => {
		setEditingEvent(event); // Store event being edited
		// Pre-fill form with existing event data
		setFormData({
			title: event.title,
			date: event.date,
			location: event.location,
			category: event.category,
			imageUrl: event.imageUrl || '', // Use empty string if null
			themeColor: event.themeColor || '',
			description: event.description || ''
		});
		setShowModal(true);
	};

	/**
	 * Closes the modal and resets all form state
	 * Called when clicking close button, cancel, or after successful save
	 */
	const closeModal = () => {
		setShowModal(false);
		setEditingEvent(null);
		setFormData({ title: '', date: '', location: '', category: '', imageUrl: '', themeColor: '', description: '' });
	};

	/**
	 * Handles form submission for creating or updating an event
	 * Determines whether to use POST (create) or PUT (update) based on editingEvent
	 * @param {Event} e - Form submit event
	 */
	const handleSubmit = async (e) => {
		e.preventDefault(); // Prevent default form submission
		setError('');

		try {
			// Determine API endpoint and HTTP method based on create vs edit
			const url = editingEvent
				? `${API_BASE_URL}/api/events/${editingEvent.id}` // PUT to /api/events/:id for update
				: `${API_BASE_URL}/api/events`; // POST to /api/events for create

			const method = editingEvent ? 'PUT' : 'POST';
			
			// Get JWT token from localStorage for authentication
			const token = localStorage.getItem('token');

			// Send request to backend
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}` // Include JWT token (admin required)
				},
				body: JSON.stringify(formData) // Send form data as JSON
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to save event');
			}

			// Success: reload events list and close modal
			await loadEvents();
			closeModal();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		}
	};

	/**
	 * Deletes an event after confirmation
	 * Shows browser confirmation dialog before proceeding
	 * @param {number} eventId - ID of the event to delete
	 */
	const handleDelete = async (eventId) => {
		// Show confirmation dialog - return if user cancels
		if (!window.confirm('Are you sure you want to delete this event?')) return;

		setError('');
		try {
			const token = localStorage.getItem('token');
			
			// Send DELETE request to backend
			const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` } // Include JWT token (admin required)
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to delete event');
			}

			// Success: reload events list to show updated data
			await loadEvents();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		}
	};

	return (
		<div className="admin-events-page">
			{/* Header section with title and Add Event button */}
			<div className="admin-header">
				<div>
					<h1>Admin Events</h1>
					<p className="admin-subtitle">Manage all events - add, edit, or delete.</p>
				</div>
				{/* Button to open modal for creating new event */}
				<button className="add-event-btn" onClick={openAddModal}>
					+ Add Event
				</button>
			</div>

			{/* Display error message if any operation failed */}
			{error && <div className="error-box">{error}</div>}

			{/* Main content container */}
			<div className="admin-container">
				<div className="admin-panel">
					<h2>All Events ({events.length})</h2>
					{loading ? (
						// Show loading state while fetching events
						<p className="muted">Loading events...</p>
					) : events.length === 0 ? (
						// Show empty state if no events exist
						<p className="muted">No events found. Create your first event!</p>
					) : (
						// Display list of events
						<ul className="admin-event-list">
							{events.map((event) => (
								<li key={event.id} className="admin-event-card">
									{/* Event details */}
									<div className="event-main">
										<div className="event-title">{event.title}</div>
										<div className="event-meta">
											{event.date} • {event.location} • {event.category}
										</div>
									</div>
									{/* Action buttons for each event */}
									<div className="event-actions">
										{/* Edit button - opens modal with event data pre-filled */}
										<button 
											className="edit-btn"
											onClick={() => openEditModal(event)}
										>
											Edit
										</button>
										{/* Delete button - shows confirmation then deletes */}
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

			{/* MODAL - Only rendered when showModal is true */}
			{showModal && (
				// Overlay - clicking it closes the modal
				<div className="modal-overlay" onClick={closeModal}>
					{/* Modal content - clicking inside doesn't close (stopPropagation) */}
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						{/* Modal header with title and close button */}
						<div className="modal-header">
							<h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
							<button className="close-btn" onClick={closeModal}>×</button>
						</div>
						
						{/* Form for creating/editing event */}
						<form onSubmit={handleSubmit}>
							{/* Event Title input */}
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

							{/* Date input */}
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

							{/* Location input */}
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

							{/* Category input */}
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

							{/* Modal action buttons */}
							<div className="modal-actions">
								{/* Cancel button - closes modal without saving */}
								<button type="button" className="cancel-btn" onClick={closeModal}>
									Cancel
								</button>
								{/* Submit button - text changes based on create vs edit */}
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