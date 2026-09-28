import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import kioskRoutes from './routes/kioskRoutes.js';
import printRoutes from './routes/printRoutes.js';

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint (always accessible for diagnosis)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let dbError = null;
  try {
    await connectDB();
    dbStatus = 'CONNECTED';
  } catch (e) {
    dbStatus = 'FAILED';
    dbError = e.message;
  }

  res.json({
    status: 'ONLINE',
    dbStatus,
    dbError,
    system: 'Exopy Smart Kiosk API Engine',
    timestamp: new Date().toISOString()
  });
});

// Ensure MongoDB is connected before handling API print & kiosk requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    res.status(500).json({ 
      success: false, 
      error: `MongoDB connection error: ${err.message}` 
    });
  }
});

// Routes
app.use('/api/kiosks', kioskRoutes);
app.use('/api/print', printRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Exopy Server] Server running in dark mode engine on http://localhost:${PORT}`);
  });
}

export default app;
