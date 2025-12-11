// Generate unique user ID
let userId = localStorage.getItem('userId');
if (!userId) {
	userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
	localStorage.setItem('userId', userId);
}

// State
let myName = localStorage.getItem('userName') || 'Anonymous';
let myColor = localStorage.getItem('userColor') || '#6366f1';
let cursors = new Map();
let lastUpdateTime = 0;
const UPDATE_THROTTLE = 16; // Send updates every 16ms (~60fps)
let isPolling = false;

// Smooth interpolation state
const cursorStates = new Map(); // Store target and current positions for interpolation

// DOM Elements
const nameInput = document.getElementById('nameInput');
const colorInput = document.getElementById('colorInput');
const colorPreview = document.getElementById('colorPreview');
const cursorsContainer = document.getElementById('cursorsContainer');
const cursorCountEl = document.getElementById('cursorCount');
const demoModal = document.getElementById('demoModal');

// Initialize inputs
nameInput.value = myName;
colorInput.value = myColor;
colorPreview.textContent = myColor;

// Demo modal functions
function closeDemoModal() {
	demoModal.classList.add('hidden');
	localStorage.setItem('demoSeen', 'true');
}

function showDemoModal() {
	demoModal.classList.remove('hidden');
}

// Check if user has seen demo
if (localStorage.getItem('demoSeen')) {
	demoModal.classList.add('hidden');
}

// Update name
nameInput.addEventListener('input', (e) => {
	myName = e.target.value.trim() || 'Anonymous';
	localStorage.setItem('userName', myName);
});

// Update color
colorInput.addEventListener('input', (e) => {
	myColor = e.target.value;
	colorPreview.textContent = myColor;
	localStorage.setItem('userColor', myColor);
});

// Create cursor element
function createCursorElement(cursor, isMine = false) {
	const cursorEl = document.createElement('div');
	cursorEl.className = `cursor${isMine ? ' my-cursor' : ''}`;
	cursorEl.id = `cursor-${cursor.userId}`;
	cursorEl.style.color = cursor.color;

	cursorEl.innerHTML = `
        <div class="cursor-pointer"></div>
        <div class="cursor-label">${cursor.name}</div>
    `;

	return cursorEl;
}

// Smooth interpolation function (lerp)
function lerp(start, end, factor) {
	return start + (end - start) * factor;
}

// Update cursor position with smooth interpolation
function updateCursorPosition(cursorEl, targetX, targetY, userId) {
	if (!cursorStates.has(userId)) {
		// Initialize state - convert percentage to pixels
		const pixelX = (targetX / 100) * window.innerWidth;
		const pixelY = (targetY / 100) * window.innerHeight;

		cursorStates.set(userId, {
			currentX: pixelX,
			currentY: pixelY,
			targetX: pixelX,
			targetY: pixelY,
		});
	}

	const state = cursorStates.get(userId);
	// Convert percentage to pixels
	state.targetX = (targetX / 100) * window.innerWidth;
	state.targetY = (targetY / 100) * window.innerHeight;
}

// Animation loop for smooth cursor movement
let frameCounter = 0;
function animateCursors() {
	frameCounter++;

	cursorStates.forEach((state, userId) => {
		// Store previous position
		const prevX = state.currentX;
		const prevY = state.currentY;

		// Interpolate towards target position
		const lerpFactor = 0.35; // Higher = faster, lower = smoother
		state.currentX = lerp(state.currentX, state.targetX, lerpFactor);
		state.currentY = lerp(state.currentY, state.targetY, lerpFactor);

		// Update DOM
		const cursorEl = document.getElementById(`cursor-${userId}`);
		if (cursorEl) {
			cursorEl.style.left = `${state.currentX}px`;
			cursorEl.style.top = `${state.currentY}px`;

			// Create trail for all cursors equally
			const cursor = cursors.get(userId);
			if (cursor && frameCounter % 2 === 0) {
				// Every 2nd frame for more visible trails
				// Calculate distance moved
				const dx = state.currentX - prevX;
				const dy = state.currentY - prevY;
				const distance = Math.sqrt(dx * dx + dy * dy);

				// Only create trail if cursor is moving
				if (distance > 0.3) {
					// Convert back to percentage for trail
					const trailX = (state.currentX / window.innerWidth) * 100;
					const trailY = (state.currentY / window.innerHeight) * 100;
					createTrailParticle(trailX, trailY, cursor.color);
				}
			}
		}
	});

	requestAnimationFrame(animateCursors);
}

// Start animation loop
animateCursors();

// Trail system with multiple particles
const trailParticles = [];
const MAX_TRAIL_PARTICLES = 20;

function createTrailParticle(x, y, color) {
	const particle = document.createElement('div');
	particle.className = 'cursor-trail';
	particle.style.left = `${x}%`;
	particle.style.top = `${y}%`;
	particle.style.color = color;
	document.body.appendChild(particle);

	const particleData = {
		element: particle,
		life: 1.0,
		x: x,
		y: y,
	};

	trailParticles.push(particleData);

	// Remove old particles
	if (trailParticles.length > MAX_TRAIL_PARTICLES) {
		const old = trailParticles.shift();
		old.element.remove();
	}
}

// Animate trail particles
function animateTrails() {
	for (let i = trailParticles.length - 1; i >= 0; i--) {
		const particle = trailParticles[i];
		particle.life -= 0.02;

		if (particle.life <= 0) {
			particle.element.remove();
			trailParticles.splice(i, 1);
		} else {
			particle.element.style.opacity = particle.life;
			particle.element.style.transform = `scale(${particle.life})`;
		}
	}

	requestAnimationFrame(animateTrails);
}

// Start trail animation
animateTrails();

// Send cursor position to server
async function sendCursorPosition(x, y) {
	try {
		await fetch('/api/cursor', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, x, y, color: myColor, name: myName }),
		});
	} catch (error) {
		console.error('Error sending cursor position:', error);
	}
}

// Handle mouse move - update my own cursor position immediately
document.addEventListener('mousemove', (e) => {
	const now = Date.now();

	// Calculate percentage position
	const x = (e.clientX / window.innerWidth) * 100;
	const y = (e.clientY / window.innerHeight) * 100;

	// Update my own cursor state immediately for responsiveness
	if (cursorStates.has(userId)) {
		const state = cursorStates.get(userId);
		state.targetX = e.clientX;
		state.targetY = e.clientY;
		state.currentX = e.clientX; // No interpolation for own cursor
		state.currentY = e.clientY;
	}

	// Throttle server updates
	if (now - lastUpdateTime < UPDATE_THROTTLE) {
		return;
	}
	lastUpdateTime = now;

	// Send to server
	sendCursorPosition(x, y);
});

// Render all cursors
function renderCursors(cursorsList) {
	// Remove cursors that no longer exist
	const existingIds = new Set(cursorsList.map((c) => c.userId));
	for (const [id, _] of cursors.entries()) {
		if (!existingIds.has(id)) {
			const el = document.getElementById(`cursor-${id}`);
			if (el) el.remove();
			cursors.delete(id);
			cursorStates.delete(id);
		}
	}

	// Update or create cursors
	cursorsList.forEach((cursor) => {
		const isMine = cursor.userId === userId;
		let cursorEl = document.getElementById(`cursor-${cursor.userId}`);

		if (!cursorEl) {
			cursorEl = createCursorElement(cursor, isMine);
			cursorsContainer.appendChild(cursorEl);
		} else {
			// Update color and name if changed
			cursorEl.style.color = cursor.color;
			const label = cursorEl.querySelector('.cursor-label');
			if (label) label.textContent = cursor.name;
		}

		// Use smooth interpolation
		updateCursorPosition(cursorEl, cursor.x, cursor.y, cursor.userId);
		cursors.set(cursor.userId, cursor);
	});

	// Update count (excluding self)
	const otherCursors = cursorsList.filter((c) => c.userId !== userId).length;
	cursorCountEl.textContent = otherCursors;
}

// Long polling function
async function longPoll() {
	if (isPolling) return;
	isPolling = true;

	try {
		const response = await fetch('/events', {
			method: 'GET',
			headers: { Accept: 'application/json' },
		});

		if (response.ok) {
			const data = await response.json();
			if (data.type === 'cursors_update' && data.cursors) {
				renderCursors(data.cursors);
			}
		}
	} catch (error) {
		console.error('Long poll error:', error);
	} finally {
		isPolling = false;
		// Immediately start next poll with minimal delay
		setTimeout(longPoll, 50);
	}
}

// Load initial cursors
async function loadInitialCursors() {
	try {
		const response = await fetch('/api/cursors');
		const data = await response.json();
		if (data.success && data.cursors) {
			renderCursors(data.cursors);
		}
	} catch (error) {
		console.error('Failed to load cursors:', error);
	}
}

// Initialize
async function init() {
	console.log('🖱️ Collaborative Mouse Tracker initialized');
	console.log('👤 User ID:', userId);
	await loadInitialCursors();
	longPoll();
}

// Start the app
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

// Send position on page load to register presence
window.addEventListener('load', () => {
	sendCursorPosition(50, 50);
});
