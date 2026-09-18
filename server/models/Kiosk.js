import mongoose from 'mongoose';

const kioskSchema = new mongoose.Schema({
  kioskId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { 
    type: String, 
    enum: ['ONLINE', 'OFFLINE', 'LOW_PAPER', 'OUT_OF_PAPER', 'JAMMED'], 
    default: 'ONLINE' 
  },
  supportsColor: { type: Boolean, default: true },
  paperLevelPercent: { type: Number, default: 95 },
  tonerLevelPercent: { type: Number, default: 85 },
  distanceMeters: { type: Number, default: 25 }, // Distance from user
  queueCount: { type: Number, default: 0 },
  pricing: {
    bwPerPage: { type: Number, default: 2.0 },
    colorPerPage: { type: Number, default: 10.0 }
  }
}, { timestamps: true });

export default mongoose.models.Kiosk || mongoose.model('Kiosk', kioskSchema);
