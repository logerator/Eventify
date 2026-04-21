import './Events.css';
import { useEffect, useMemo, useState } from 'react';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_BASE_URL = 'https://eventify-production-bbb4.up.railway.app';

function Events() {
	const [health, setHealth] = useState(null);
	const [events, setEvents] = useState([]);
	const [myEvents, setMyEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('all');
	const { toasts, addToast } = useToast();
	const token = localStorage.getItem('token');

	const myEventIds = useMemo(() => new Set(myEvents.map((e) => e.id)), [myEvents]);

	const categories = useMemo(() => {
		const allCategories = events.map((e) => (e.category || 'Other'));
		return ['all', ...Array.from(new Set(allCategories)).sort()];
	}, [events]);

	const filteredEvents = useMemo(() => {
		const query = search.trim().toLowerCase();
		return events.filter((e) => {
			const matchesCategory = category === 'all' || (e.category || 'Other') === category;
			const matchesSearch =
				!query ||
				e.title.toLowerCase().includes(query) ||
				e.location.toLowerCase().includes(query) ||
				(e.category || 'Other').toLowerCase().includes(query);
			return matchesCategory && matchesSearch;
		});
	}, [events, category, search]);

	const load = async () => {
		setLoading(true);
		try {
			const [healthRes, eventsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/health`),
				fetch(`${API_BASE_URL}/api/events`),
			]);

			if (!healthRes.ok) throw new Error('Health check failed');
			if (!eventsRes.ok) throw new Error('Failed to load events');

			const healthJson = await healthRes.json();
			const eventsJson = await eventsRes.json();

			setHealth(healthJson);
			setEvents(Array.isArray(eventsJson.events) ? eventsJson.events : []);

			if (token) {
				const myEventsRes = await fetch(`${API_BASE_URL}/api/my-events`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (myEventsRes.ok) {
					const myEventsJson = await myEventsRes.json();
					setMyEvents(Array.isArray(myEventsJson.events) ? myEventsJson.events : []);
				} else if (myEventsRes.status === 401) {
					setMyEvents([]);
				} else {
					throw new Error('Failed to load My Events');
				}
			} else {
				setMyEvents([]);
			}
		} catch (e) {
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const saveEvent = async (eventId) => {
		if (!token) {
			addToast('Please log in to save events.', 'error');
			return;
		}
		try {
			const res = await fetch(`${API_BASE_URL}/api/my-events`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ eventId }),
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to save event');
			}

			addToast('Event saved!', 'success');
			await load();
		} catch (e) {
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		}
	};

	const removeEvent = async (eventId) => {
		if (!token) return;
		try {
			const res = await fetch(`${API_BASE_URL}/api/my-events/${eventId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to remove event');
			}
			addToast('Removed from My Events.', 'success');
			await load();
		} catch (e) {
			addToast(e instanceof Error ? e.message : 'Unknown error', 'error');
		}
	};

	return (
		<div className="events-page">
			<div className="events-header">
				<div>
					<h1>Events</h1>
					<p className="events-subtitle">Search, filter, and save events that match your interests.</p>
				</div>
				<div className="events-actions">
					<div className="search-group">
						<input
							className="search-input"
							type="search"
							value={search}
							placeholder="Search events, locations, categories..."
							onChange={(e) => setSearch(e.target.value)}
						/>
						<select
							className="filter-select"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							{categories.map((cat) => (
								<option key={cat} value={cat}>
									{cat === 'all' ? 'All categories' : cat}
								</option>
							))}
						</select>
					</div>
					<button className="refresh-btn" onClick={load} disabled={loading}>
						{loading ? 'Loading...' : 'Refresh'}
					</button>
				</div>
			</div>

			{health && (
				<div className="health-box">
					<strong>Backend status:</strong> {health.status} <span className="health-time">({health.time})</span>
				</div>
			)}

			<div className="events-grid">
				<div className="events-panel">
					<h2>All Events</h2>
					{filteredEvents.length === 0 ? (
						<p className="muted">No matching events found.</p>
					) : (
						<ul className="event-list">
							{filteredEvents.map((e) => (
								<li key={e.id} className="event-card" style={e.themeColor ? { borderLeft: `6px solid ${e.themeColor}` } : undefined}>
									{e.imageUrl && (
										<img className="event-image" src={e.imageUrl} alt={e.title} />
									)}
									<div className="event-main">
										<div className="event-title">{e.title}</div>
										<div className="event-meta">{e.date} • {e.location} • {e.category}</div>
									</div>
									<button
										className="save-btn"
										onClick={() => saveEvent(e.id)}
										disabled={myEventIds.has(e.id)}
									>
										{myEventIds.has(e.id) ? 'Saved' : 'Save'}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="events-panel my-events-panel" id="my-events">
					<h2>My Events</h2>
					{!token ? (
						<p className="muted">Log in to save events to your account.</p>
					) : myEvents.length === 0 ? (
						<p className="muted">You haven't saved any events yet.</p>
					) : (
						<ul className="event-list">
							{myEvents.map((e) => (
								<li key={e.id} className="event-card" style={e.themeColor ? { borderLeft: `6px solid ${e.themeColor}` } : undefined}>
									{e.imageUrl && (
										<img className="event-image" src={e.imageUrl} alt={e.title} />
									)}
									<div className="event-main">
										<div className="event-title">{e.title}</div>
										<div className="event-meta">{e.date} • {e.location} • {e.category}</div>
									</div>
									<button className="remove-btn" onClick={() => removeEvent(e.id)}>Remove</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<Toast toasts={toasts} />
		</div>
	);
}

export default Events;
