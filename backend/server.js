require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./src/config/database');
const { initRedis } = require('./src/config/redis');
const { initSocket } = require('./src/services/websocket.service');

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();