import './Events.css';
import { useEffect, useMemo, useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

// Base URL for all API calls - points to production backend server
const API_BASE_URL = 'https://eventify-production-9f2a.up.railway.app';

function Events() {
	// State variables for managing component data and UI
	const [health, setHealth] = useState(null); // Backend health check status
	const [events, setEvents] = useState([]); // All available events from database
	const [myEvents, setMyEvents] = useState([]); // User's saved events
	const [loading, setLoading] = useState(false); // Loading state for API calls
	const [search, setSearch] = useState(''); // Search query text
	const [category, setCategory] = useState('all'); // Selected category filter
	
	// Custom hook for displaying toast notifications
	const { toasts, addToast } = useToast();
	
	// Get authentication token from localStorage (null if not logged in)
	const token = localStorage.getItem('token');

	/**
	 * useMemo - Creates a Set of saved event IDs for quick lookup
	 * This allows O(1) time complexity when checking if an event is saved
	 * Recalculates only when myEvents array changes
	 */
	const myEventIds = useMemo(() => new Set(myEvents.map((e) => e.id)), [myEvents]);

	/**
	 * useMemo - Generates sorted list of unique categories from all events
	 * Always includes 'all' as the first option
	 * Recalculates only when events array changes
	 */
	const categories = useMemo(() => {
		const allCategories = events.map((e) => (e.category || 'Other'));
		// Create Set to remove duplicates, convert to array, sort alphabetically
		return ['all', ...Array.from(new Set(allCategories)).sort()];
	}, [events]);

	/**
	 * useMemo - Filters events based on search query and category selection
	 * Searches in: title, location, and category fields
	 * Recalculates when events, category, or search changes
	 */
	const filteredEvents = useMemo(() => {
		const query = search.trim().toLowerCase();
		return events.filter((e) => {
			// Check if event matches selected category (or 'all' is selected)
			const matchesCategory = category === 'all' || (e.category || 'Other') === category;
			
			// Check if event matches search query (title, location, or category)
			const matchesSearch =
				!query || // Empty search matches everything
				e.title.toLowerCase().includes(query) ||
				e.location.toLowerCase().includes(query) ||
				(e.category || 'Other').toLowerCase().includes(query);
			
			// Event must match both category and search criteria
			return matchesCategory && matchesSearch;
		});
	}, [events, category, search]);

	/**
	 * Loads all events and user's saved events from the backend
	 * Makes parallel API calls for better performance
	 * Handles both logged-in and guest users
	 */
	const load = async () => {
		setLoading(true);
		try {
			// Make parallel requests for health check and all events (faster than sequential)
			const [healthRes, eventsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/health`),
				fetch(`${API_BASE_URL}/api/events`),
			]);

			// Check if requests were successful
			if (!healthRes.ok) throw new Error('Health check failed');
			if (!eventsRes.ok) throw new Error('Failed to load events');

			// Parse JSON responses
			const healthJson = await healthRes.json();
			const eventsJson = await eventsRes.json();

			// Update state with fetched data
			setHealth(healthJson);
			setEvents(Array.isArray(eventsJson.events) ? eventsJson.events : []);

			// If user is logged in, fetch their saved events
			if (token) {
				const myEventsRes = await fetch(`${API_BASE_URL}/api/my-events`, {
					headers: { Authorization: `Bearer ${token}` }, // Include JWT token
				});
				
				if (myEventsRes.ok) {
					const myEventsJson = await myEventsRes.json();
					setMyEvents(Array.isArray(myEventsJson.events) ? myEventsJson.events : []);
				} else if (myEventsRes.status === 401) {
					// Token is invalid/expired - user needs to log in again
					setMyEvents([]);
				} else {
					throw new Error('Failed to load My Events');
				}
			} else {
				// No token = guest user, no saved events
				setMyEvents([]);
			}
		} catch (e) {
			// Display error notification
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		} finally {
			// Always set loading to false, even if error occurred
			setLoading(false);
		}
	};

	/**
	 * useEffect - Runs once when component mounts
	 * Loads all events and saved events on initial page load
	 */
	useEffect(() => {
		load();
	}, []); // Empty dependency array = run only once on mount

	/**
	 * Saves an event to user's "My Events" list
	 * @param {number} eventId - ID of the event to save
	 */
	const saveEvent = async (eventId) => {
		// Check if user is logged in
		if (!token) {
			addToast('Please log in to save events.', 'error');
			return;
		}
		
		try {
			// Send POST request to save event
			const res = await fetch(`${API_BASE_URL}/api/my-events`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json', 
					Authorization: `Bearer ${token}` // Include JWT token
				},
				body: JSON.stringify({ eventId }),
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to save event');
			}

			// Success: show notification and reload data
			addToast('Event saved!', 'success');
			await load(); // Reload to update "My Events" list
		} catch (e) {
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		}
	};

	/**
	 * Removes an event from user's "My Events" list
	 * @param {number} eventId - ID of the event to remove
	 */
	const removeEvent = async (eventId) => {
		if (!token) return; // Only logged-in users can remove events
		
		try {
			// Send DELETE request to remove event
			const res = await fetch(`${API_BASE_URL}/api/my-events/${eventId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` }, // Include JWT token
			});
			
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to remove event');
			}
			
			// Success: show notification and reload data
			addToast('Removed from My Events.', 'success');
			await load(); // Reload to update "My Events" list
		} catch (e) {
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		}
	};

	return (
		<div className="events-page">
			{/* Header section with title, search, filter, and refresh controls */}
			<div className="events-header">
				<div>
					<h1>Events</h1>
					<p className="events-subtitle">Search, filter, and save events that match your interests.</p>
				</div>
				
				{/* Search and filter controls */}
				<div className="events-actions">
					<div className="search-group">
						{/* Search input - filters events by title, location, category */}
						<input
							className="search-input"
							type="search"
							value={search}
							placeholder="Search events, locations, categories..."
							onChange={(e) => setSearch(e.target.value)}
						/>
						
						{/* Category dropdown filter */}
						<select
							className="filter-select"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							{/* Dynamically generate category options from events */}
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat === 'all' ? 'All categories' : cat}
								</option>
							))}
						</select>
					</div>
					
					{/* Refresh button - manually reload events from server */}
					<button className="refresh-btn" onClick={load} disabled={loading}>
						{loading ? 'Loading...' : 'Refresh'}
					</button>
				</div>
			</div>

			{/* Backend health status indicator (shows server status and timestamp) */}
			{health && (
				<div className="health-box">
					<strong>Backend status:</strong> {health.status} <span className="health-time">({health.time})</span>
				</div>
			)}

			{/* Main content grid - two panels side by side */}
			<div className="events-grid">
				
				{/* LEFT PANEL: All Events */}
				<div className="events-panel">
					<h2>All Events</h2>
					{filteredEvents.length === 0 ? (
						// Show message if no events match search/filter
						<p className="muted">No matching events found.</p>
					) : (
						// Display list of events
						<ul className="event-list">
							{filteredEvents.map((e) => (
								<li 
									key={e.id} 
									className="event-card" 
									// Apply colored left border if event has a theme color
									style={e.themeColor ? { borderLeft: `6px solid ${e.themeColor}` } : undefined}
								>
									{/* Event image (if available) */}
									{e.imageUrl && (
										<img className="event-image" src={e.imageUrl} alt={e.title} />
									)}
									
									{/* Event details */}
									<div className="event-main">
										<div className="event-title">{e.title}</div>
										<div className="event-meta">{e.date} • {e.location} • {e.category}</div>
									</div>
									
									{/* Save button - disabled if already saved */}
									<button
										className="save-btn"
										onClick={() => saveEvent(e.id)}
										disabled={myEventIds.has(e.id)} // Disable if event is already saved
									>
										{myEventIds.has(e.id) ? 'Saved' : 'Save'}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				{/* RIGHT PANEL: My Events (User's Saved Events) */}
				<div className="events-panel my-events-panel" id="my-events">
					<h2>My Events</h2>
					{!token ? (
						// Show login prompt if user is not logged in
						<p className="muted">Log in to save events to your account.</p>
					) : myEvents.length === 0 ? (
						// Show message if logged-in user has no saved events
						<p className="muted">You haven't saved any events yet.</p>
					) : (
						// Display list of saved events
						<ul className="event-list">
							{myEvents.map((e) => (
								<li 
									key={e.id} 
									className="event-card" 
									// Apply colored left border if event has a theme color
									style={e.themeColor ? { borderLeft: `6px solid ${e.themeColor}` } : undefined}
								>
									{/* Event image (if available) */}
									{e.imageUrl && (
										<img className="event-image" src={e.imageUrl} alt={e.title} />
									)}
									
									{/* Event details */}
									<div className="event-main">
										<div className="event-title">{e.title}</div>
										<div className="event-meta">{e.date} • {e.location} • {e.category}</div>
									</div>
									
									{/* Remove button - deletes event from saved list */}
									<button className="remove-btn" onClick={() => removeEvent(e.id)}>Remove</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Toast notification component - displays success/error messages */}
			<Toast toasts={toasts} />
		</div>
	);
}

export default Events;
