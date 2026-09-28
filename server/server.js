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

// Ensure MongoDB is connected before handling API requests (Vercel Serverless support)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'MongoDB connection failed. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 allowed.' 
    });
  }
});

// Routes
app.use('/api/kiosks', kioskRoutes);
app.use('/api/print', printRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Exopy Smart Kiosk API Engine',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Exopy Server] Server running in dark mode engine on http://localhost:${PORT}`);
  });
}

export default app;
