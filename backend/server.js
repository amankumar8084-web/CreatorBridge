require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./src/config/database');
const { initRedis } = require('./src/config/redis');
const { initSocket } = require('./src/services/websocket.service');

const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:5173',
  'https://creatorbridge-iota.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Initialize services
const startServer = async () => {
  try {
    await connectDB();
    await initRedis();
    initSocket(io);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);

      // Self-ping every 5 minutes to keep Render from sleeping
      const HEALTH_URL = process.env.RENDER_HEALTH_URL || 'https://creatorbridge.onrender.com/api/health';
      setInterval(async () => {
        try {
          const res = await fetch(HEALTH_URL);
          console.log(`[Health Ping] ${new Date().toISOString()} - Status: ${res.status}`);
        } catch (err) {
          console.error(`[Health Ping] Failed:`, err.message);
        }
      }, 5 * 60 * 1000); // every 5 minutes
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();