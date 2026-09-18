import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import kioskRoutes from './routes/kioskRoutes.js';
import printRoutes from './routes/printRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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
