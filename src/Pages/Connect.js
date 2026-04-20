import './Connect.css';
import { useMemo, useState } from 'react';

function Connect() {
	const users = useMemo(
		() => [
			{ id: 1, name: 'Maya', interests: ['Tech', 'Startups'], status: 'Online' },
			{ id: 2, name: 'Noah', interests: ['Music', 'Photography'], status: 'Online' },
			{ id: 3, name: 'Sofia', interests: ['Food', 'Art'], status: 'Away' },
			{ id: 4, name: 'Ethan', interests: ['Sports', 'Fitness'], status: 'Offline' },
			{ id: 5, name: 'Ava', interests: ['Gaming', 'Design'], status: 'Online' },
		],
		[]
	);

	const [activeUserId, setActiveUserId] = useState(users[0]?.id ?? null);
	const activeUser = useMemo(() => users.find((u) => u.id === activeUserId) ?? null, [users, activeUserId]);

	const [conversations, setConversations] = useState(() => {
		const initial = {};
		for (const u of users) {
			initial[u.id] = [
				{ id: 1, from: u.name, text: `Hey! I saw you’re using Eventify — want to go to an event this week?` },
				{ id: 2, from: 'You', text: 'Sure! What kind of events are you into?' },
			];
		}
		return initial;
	});

	const [draft, setDraft] = useState('');

	const activeMessages = activeUser ? conversations[activeUser.id] ?? [] : [];

	const send = async () => {
		if (!activeUser) return;
		const text = draft.trim();
		if (!text) return;

		setDraft('');
		setConversations((prev) => {
			const next = { ...prev };
			const list = next[activeUser.id] ? [...next[activeUser.id]] : [];
			list.push({ id: Date.now(), from: 'You', text });
			next[activeUser.id] = list;
			return next;
		});

		setTimeout(() => {
			setConversations((prev) => {
				const next = { ...prev };
				const list = next[activeUser.id] ? [...next[activeUser.id]] : [];
				const replies = [
					'That sounds awesome. Want to check the Events page together?',
					'I’m down! Which category are you browsing?',
					'Nice! I can share a couple events I saved.',
					'Cool — I’m free this weekend if you are.',
				];
				list.push({
					id: Date.now() + 1,
					from: activeUser.name,
					text: replies[Math.floor(Math.random() * replies.length)],
				});
				next[activeUser.id] = list;
				return next;
			});
		}, 500);
	};

	return (
		<div className="connect-page">
			<div className="connect-header">
				<h1>Connect</h1>
				<p className="connect-subtitle">Chat with people who share your interests (demo data).</p>
			</div>

			<div className="connect-layout">
				<div className="connect-sidebar">
					<h2>People</h2>
					<ul className="user-list">
						{users.map((u) => (
							<li key={u.id}>
								<button
									className={u.id === activeUserId ? 'user-btn active' : 'user-btn'}
									onClick={() => setActiveUserId(u.id)}
								>
									<div className="user-row">
										<div className="user-name">{u.name}</div>
										<div className={u.status === 'Online' ? 'user-status online' : u.status === 'Away' ? 'user-status away' : 'user-status offline'}>
											{u.status}
										</div>
									</div>
									<div className="user-interests">{u.interests.join(' • ')}</div>
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className="connect-chat">
					<div className="chat-topbar">
						<div>
							<div className="chat-title">{activeUser ? activeUser.name : 'Select someone'}</div>
							<div className="chat-meta">{activeUser ? activeUser.interests.join(' • ') : ''}</div>
						</div>
					</div>

					<div className="chat-messages">
						{activeMessages.length === 0 ? (
							<div className="chat-empty">No messages yet.</div>
						) : (
							activeMessages.map((m) => (
								<div key={m.id} className={m.from === 'You' ? 'msg msg-you' : 'msg msg-them'}>
									<div className="msg-from">{m.from}</div>
									<div className="msg-text">{m.text}</div>
								</div>
							))
						)}
					</div>

					<div className="chat-input-row">
						<input
							className="chat-input"
							type="text"
							value={draft}
							placeholder={activeUser ? `Message ${activeUser.name}...` : 'Select someone to chat'}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') send();
							}}
							disabled={!activeUser}
						/>
						<button className="chat-send" onClick={send} disabled={!activeUser || !draft.trim()}>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Connect;
