import './Events.css';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000';

function Events() {
	const [health, setHealth] = useState(null);
	const [events, setEvents] = useState([]);
	const [myEvents, setMyEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState('all');

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
		setError('');
		try {
			const [healthRes, eventsRes, myEventsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/health`),
				fetch(`${API_BASE_URL}/api/events`),
				fetch(`${API_BASE_URL}/api/my-events`),
			]);

			if (!healthRes.ok) throw new Error('Health check failed');
			if (!eventsRes.ok) throw new Error('Failed to load events');
			if (!myEventsRes.ok) throw new Error('Failed to load My Events');

			const healthJson = await healthRes.json();
			const eventsJson = await eventsRes.json();
			const myEventsJson = await myEventsRes.json();

			setHealth(healthJson);
			setEvents(Array.isArray(eventsJson.events) ? eventsJson.events : []);
			setMyEvents(Array.isArray(myEventsJson.events) ? myEventsJson.events : []);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const saveEvent = async (eventId) => {
		setError('');
		try {
			const res = await fetch(`${API_BASE_URL}/api/my-events`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ eventId }),
			});

			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				throw new Error(json.error || 'Failed to save event');
			}

			await load();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Unknown error');
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

			{error && <div className="error-box">{error}</div>}

			<div className="events-grid">
				<div className="events-panel">
					<h2>All Events</h2>
					{filteredEvents.length === 0 ? (
						<p className="muted">No matching events found.</p>
					) : (
						<ul className="event-list">
							{filteredEvents.map((e) => (
								<li key={e.id} className="event-card">
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

				<div className="events-panel my-events-panel">
					<h2>My Events</h2>
					{myEvents.length === 0 ? (
						<p className="muted">You haven't saved any events yet.</p>
					) : (
						<ul className="event-list">
							{myEvents.map((e) => (
								<li key={e.id} className="event-card">
									<div className="event-main">
										<div className="event-title">{e.title}</div>
										<div className="event-meta">{e.date} • {e.location} • {e.category}</div>
									</div>
									<button className="remove-btn">Remove</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

export default Events;
