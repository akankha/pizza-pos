import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase, seedDatabase } from './db/database.js';
import { seedAdminUser } from './db/seedAdmin.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import usersRoutes from './routes/users.js';
import { sanitizeSql } from './middleware/validation.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Initialize database asynchronously
async function startServer() {
  try {
    await initDatabase();
    await seedDatabase();
    await seedAdminUser();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // More strict rate limiting for auth routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later.',
  });
  app.use('/api/auth/login', authLimiter);

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(sanitizeSql);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/users', usersRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join kitchen room
  socket.on('join:kitchen', () => {
    socket.join('kitchen');
    console.log('Kitchen display joined:', socket.id);
  });

  // New order created
  socket.on('order:created', (order) => {
    console.log('New order created:', order.id);
    io.to('kitchen').emit('order:new', order);
  });

  // Order status updated
  socket.on('order:status', ({ orderId, status }) => {
    console.log(`Order ${orderId} status updated to ${status}`);
    io.emit('order:updated', { orderId, status });
  });

  // Order paid
  socket.on('order:paid', (order) => {
    console.log('Order paid:', order.id);
    io.emit('order:completed', order);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

  httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🍕 Pizza POS Server Running         ║
║   Port: ${PORT}                       ║
║   WebSocket: Enabled                   ║
║   Database: MySQL (pizza_pos)         ║
╚════════════════════════════════════════╝
    `);
  });
}

// Start the server
startServer().catch(console.error);

export { io };
