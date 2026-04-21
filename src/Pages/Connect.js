import './Connect.css';
import { useMemo, useState } from 'react';

function Connect() {
	/**
	 * useMemo - Creates a static list of demo users
	 * In a real app, this would be fetched from a database
	 * Each user has: id, name, interests array, and online status
	 * Memoized to prevent recreation on every render
	 */
	const users = useMemo(
		() => [
			{ id: 1, name: 'Maya', interests: ['Tech', 'Startups'], status: 'Online' },
			{ id: 2, name: 'Noah', interests: ['Music', 'Photography'], status: 'Online' },
			{ id: 3, name: 'Sofia', interests: ['Food', 'Art'], status: 'Away' },
			{ id: 4, name: 'Ethan', interests: ['Sports', 'Fitness'], status: 'Offline' },
			{ id: 5, name: 'Ava', interests: ['Gaming', 'Design'], status: 'Online' },
		],
		[] // Empty dependency array = never recreates
	);

	/**
	 * State: Currently selected user ID for the chat view
	 * Defaults to first user in the list
	 */
	const [activeUserId, setActiveUserId] = useState(users[0]?.id ?? null);
	
	/**
	 * useMemo - Finds the currently active user object based on activeUserId
	 * Recalculates when users array or activeUserId changes
	 */
	const activeUser = useMemo(() => users.find((u) => u.id === activeUserId) ?? null, [users, activeUserId]);

	/**
	 * State: Stores all conversation histories
	 * Structure: { userId: [{ id, from, text }, ...] }
	 * Initialized with demo messages for each user
	 */
	const [conversations, setConversations] = useState(() => {
		const initial = {};
		// Create initial conversation for each user with 2 demo messages
		for (const u of users) {
			initial[u.id] = [
				{ id: 1, from: u.name, text: `Hey! I saw you're using Eventify — want to go to an event this week?` },
				{ id: 2, from: 'You', text: 'Sure! What kind of events are you into?' },
			];
		}
		return initial;
	});

	/**
	 * State: Current draft message being typed in the input field
	 */
	const [draft, setDraft] = useState('');

	/**
	 * Gets the messages for the currently active conversation
	 * Returns empty array if no user is selected
	 */
	const activeMessages = activeUser ? conversations[activeUser.id] ?? [] : [];

	/**
	 * Sends a message in the current conversation
	 * - Adds user's message immediately
	 * - Simulates a reply from the other user after 500ms delay
	 * In a real app, this would send to a backend and receive real replies
	 */
	const send = async () => {
		if (!activeUser) return; // No user selected
		const text = draft.trim();
		if (!text) return; // Empty message

		// Clear input field immediately
		setDraft('');
		
		// Add user's message to conversation
		setConversations((prev) => {
			const next = { ...prev }; // Copy conversations object
			const list = next[activeUser.id] ? [...next[activeUser.id]] : []; // Copy message array
			list.push({ id: Date.now(), from: 'You', text }); // Add new message
			next[activeUser.id] = list; // Update conversation
			return next;
		});

		// Simulate reply from other user after 500ms
		setTimeout(() => {
			setConversations((prev) => {
				const next = { ...prev };
				const list = next[activeUser.id] ? [...next[activeUser.id]] : [];
				
				// Array of possible random replies
				const replies = [
					'That sounds awesome. Want to check the Events page together?',
					'I\'m down! Which category are you browsing?',
					'Nice! I can share a couple events I saved.',
					'Cool — I\'m free this weekend if you are.',
				];
				
				// Add random reply from the other user
				list.push({
					id: Date.now() + 1, // Unique ID
					from: activeUser.name, // Reply from the other user
					text: replies[Math.floor(Math.random() * replies.length)], // Random reply
				});
				next[activeUser.id] = list;
				return next;
			});
		}, 500); // 500ms delay
	};

	return (
		<div className="connect-page">
			{/* Header section with title and subtitle */}
			<div className="connect-header">
				<h1>Connect</h1>
				<p className="connect-subtitle">Chat with people who share your interests (demo data).</p>
			</div>

			{/* Main layout - sidebar + chat area */}
			<div className="connect-layout">
				
				{/* LEFT SIDEBAR: List of users */}
				<div className="connect-sidebar">
					<h2>People</h2>
					<ul className="user-list">
						{users.map((u) => (
							<li key={u.id}>
								{/* User button - clicking selects this user for chat */}
								<button
									className={u.id === activeUserId ? 'user-btn active' : 'user-btn'}
									onClick={() => setActiveUserId(u.id)}
								>
									{/* User name and online status */}
									<div className="user-row">
										<div className="user-name">{u.name}</div>
										{/* Status indicator with conditional CSS class */}
										<div className={
											u.status === 'Online' ? 'user-status online' : 
											u.status === 'Away' ? 'user-status away' : 
											'user-status offline'
										}>
											{u.status}
										</div>
									</div>
									{/* User's interests (joined with bullet separator) */}
									<div className="user-interests">{u.interests.join(' • ')}</div>
								</button>
							</li>
						))}
					</ul>
				</div>

				{/* RIGHT PANEL: Chat area */}
				<div className="connect-chat">
					
					{/* Chat header - shows selected user's name and interests */}
					<div className="chat-topbar">
						<div>
							<div className="chat-title">{activeUser ? activeUser.name : 'Select someone'}</div>
							<div className="chat-meta">{activeUser ? activeUser.interests.join(' • ') : ''}</div>
						</div>
					</div>

					{/* Message display area */}
					<div className="chat-messages">
						{activeMessages.length === 0 ? (
							// Show empty state if no messages
							<div className="chat-empty">No messages yet.</div>
						) : (
							// Display all messages in the conversation
							activeMessages.map((m) => (
								<div 
									key={m.id} 
									// Apply different CSS class based on who sent the message
									className={m.from === 'You' ? 'msg msg-you' : 'msg msg-them'}
								>
									{/* Sender name */}
									<div className="msg-from">{m.from}</div>
									{/* Message text */}
									<div className="msg-text">{m.text}</div>
								</div>
							))
						)}
					</div>

					{/* Message input area at bottom */}
					<div className="chat-input-row">
						{/* Text input field */}
						<input
							className="chat-input"
							type="text"
							value={draft}
							placeholder={activeUser ? `Message ${activeUser.name}...` : 'Select someone to chat'}
							onChange={(e) => setDraft(e.target.value)}
							// Allow sending message by pressing Enter key
							onKeyDown={(e) => {
								if (e.key === 'Enter') send();
							}}
							disabled={!activeUser} // Disable if no user selected
						/>
						{/* Send button */}
						<button 
							className="chat-send" 
							onClick={send} 
							disabled={!activeUser || !draft.trim()} // Disable if no user or empty message
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Connect;
