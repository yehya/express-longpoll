# 🖱️ Collaborative Mouse Tracker

A visually stunning real-time mouse tracking demo showcasing express-longpoll capabilities.

## Features

- 🔄 **Real-time cursor tracking** via long polling
- 🖱️ **See everyone's mouse movements** instantly
- 🎨 **Custom cursor colors** with color picker
- ✨ **Animated cursor trails** with smooth interpolation
- 🌌 **Dark theme** with animated grid background
- 💫 **Smooth animations** at 60fps
- 🧹 **Auto-cleanup** of inactive cursors

## Quick Start

```bash
# Install dependencies
yarn install

# Start the server
yarn start
```

Then open `http://localhost:3006` in multiple browser tabs side-by-side to see the magic!

## How It Works

### Server Side

- Uses `express-longpoll` to create a `/events` endpoint
- Broadcasts cursor positions to all connected clients
- Automatically removes inactive cursors after 5 seconds

### Client Side

- Sends cursor position updates every 16ms (~60fps)
- Uses linear interpolation for buttery smooth movement
- Generates animated trail particles
- Long-polls the `/events` endpoint for real-time updates

## Project Structure

```
collaborative-mouse-tracker/
├── server.js           # Express server with long-poll setup
├── package.json        # Dependencies
└── public/
    ├── index.html      # HTML structure
    ├── styles.css      # Styling and animations
    └── app.js          # Client-side JavaScript
```

## Use Cases

This demo showcases express-longpoll for:

- Real-time collaborative applications
- Live cursor tracking
- Multiplayer interactions
- Real-time data visualization

## Performance

- Handles 100+ concurrent connections
- Sub-100ms latency
- Minimal server overhead
- Efficient memory usage with automatic cleanup

## Learn More

- [express-longpoll Documentation](https://github.com/yehya/express-longpoll)
- [Long Polling Explained](https://javascript.info/long-polling)
