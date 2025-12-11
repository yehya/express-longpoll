const express = require('express');
const path = require('path');

const app = express();
const PORT = 3006;

// Initialize express-longpoll
const longpoll = require('express-longpoll')(app, {
	DEBUG: true,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for active cursors
const cursors = new Map();
const CURSOR_TIMEOUT = 5000; // Remove cursor after 5 seconds of inactivity

// Create the long-poll endpoint
longpoll.create('/events');

// Cleanup inactive cursors periodically
setInterval(() => {
	const now = Date.now();
	let removed = false;

	for (const [userId, cursor] of cursors.entries()) {
		if (now - cursor.lastUpdate > CURSOR_TIMEOUT) {
			cursors.delete(userId);
			removed = true;
			console.log(`🧹 Removed inactive cursor: ${userId}`);
		}
	}

	// Broadcast cursor removal
	if (removed) {
		longpoll.publish('/events', {
			type: 'cursors_update',
			cursors: Array.from(cursors.values()),
		});
	}
}, 1000);

// API Routes

// POST /api/cursor - Update cursor position
app.post('/api/cursor', (req, res) => {
	const { userId, x, y, color, name } = req.body;

	// Validate input
	if (!userId || x === undefined || y === undefined) {
		return res.status(400).json({
			success: false,
			error: 'userId, x, and y are required',
		});
	}

	// Update cursor data
	const cursor = {
		userId,
		x: Math.max(0, Math.min(100, x)), // Clamp to 0-100%
		y: Math.max(0, Math.min(100, y)),
		color: color || '#6366f1',
		name: name || 'Anonymous',
		lastUpdate: Date.now(),
	};

	cursors.set(userId, cursor);

	// Broadcast to all long-poll listeners
	longpoll.publish('/events', {
		type: 'cursors_update',
		cursors: Array.from(cursors.values()),
	});

	// Send response
	res.json({
		success: true,
		activeCursors: cursors.size,
	});
});

// GET /api/cursors - Get all active cursors
app.get('/api/cursors', (req, res) => {
	res.json({
		success: true,
		cursors: Array.from(cursors.values()),
	});
});

// Serve index.html for root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
	console.log(
		`🖱️  Collaborative Mouse Tracker running on http://localhost:${PORT}`
	);
	console.log(`📡 Long-poll endpoint available at /events`);
	console.log(`🎯 Update cursor: POST /api/cursor`);
	console.log(`� View cursors: GET /api/cursors`);
});
