import express from 'express';
import Kiosk from '../models/Kiosk.js';

const router = express.Router();

// Sample seed data for Exopy Smart Kiosks (Indore Locations)
const DEFAULT_KIOSKS = [
  {
    kioskId: 'EX-01',
    name: 'Gyan Sagar Vidya Niketan School Kiosk',
    location: 'Near Gyan Sagar Vidya Niketan School, Annapurna Road, Indore',
    coordinates: { lat: 22.705, lng: 75.845 },
    status: 'ONLINE',
    supportsColor: true,
    paperLevelPercent: 90,
    tonerLevelPercent: 95,
    distanceMeters: 25,
    queueCount: 1,
    pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
  },
  {
    kioskId: 'EX-02',
    name: 'Mhow Naka Square Kiosk',
    location: 'Mhow Naka Circle, Main Market Arcade, Indore',
    coordinates: { lat: 22.708, lng: 75.852 },
    status: 'ONLINE',
    supportsColor: false, // B&W ONLY Edge Case!
    paperLevelPercent: 55,
    tonerLevelPercent: 75,
    distanceMeters: 40,
    queueCount: 2,
    pricing: { bwPerPage: 1.5, colorPerPage: 0.0 }
  },
  {
    kioskId: 'EX-03',
    name: 'Rajwada Palace Concourse Kiosk',
    location: 'Rajwada Palace Heritage Square, MG Road, Indore',
    coordinates: { lat: 22.719, lng: 75.857 },
    status: 'LOW_PAPER', // Hardware Warning Edge Case!
    supportsColor: true,
    paperLevelPercent: 5, // Out of paper soon!
    tonerLevelPercent: 15,
    distanceMeters: 15,
    queueCount: 0,
    pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
  },
  {
    kioskId: 'EX-04',
    name: 'Vijay Nagar Square Kiosk',
    location: 'Opposite C21 Mall, Vijay Nagar, Indore',
    coordinates: { lat: 22.753, lng: 75.893 },
    status: 'OFFLINE', // Offline Kiosk Edge Case!
    supportsColor: true,
    paperLevelPercent: 0,
    tonerLevelPercent: 0,
    distanceMeters: 350,
    queueCount: 0,
    pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
  }
];

// @route   GET /api/kiosks
// @desc    Get all available Exopy smart kiosks
router.get('/', async (req, res) => {
  try {
    let kiosks = await Kiosk.find();
    if (!kiosks || kiosks.length === 0) {
      kiosks = await Kiosk.insertMany(DEFAULT_KIOSKS);
    }
    res.json({ success: true, count: kiosks.length, data: kiosks });
  } catch (err) {
    res.json({ success: true, count: DEFAULT_KIOSKS.length, data: DEFAULT_KIOSKS, isFallback: true });
  }
});

// @route   POST /api/kiosks/seed
// @desc    Reset/seed default kiosks
router.post('/seed', async (req, res) => {
  try {
    await Kiosk.deleteMany({});
    const kiosks = await Kiosk.insertMany(DEFAULT_KIOSKS);
    res.json({ success: true, message: 'Kiosks re-seeded successfully with Indore locations', data: kiosks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
