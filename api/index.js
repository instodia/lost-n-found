import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../server/models/Item.js';
import Claim from '../server/models/Claim.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Cached MongoDB Connection for Serverless Lambdas
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://instodia:srgi-project@cluster0.sobnsav.mongodb.net/findit?retryWrites=true&w=majority';
    const db = await mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds if DB unreachable
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Serverless Connected to MongoDB Atlas');
  } catch (err) {
    isConnected = false;
    console.error('❌ Serverless MongoDB Connection Error:', err.message);
  }
};

// Middleware to ensure DB is connected before request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    // avoid unhandled rejection
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverless: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// --- ITEMS API ---

// 1. Get all items
app.get('/api/items', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connecting or unavailable' });
    }
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get single item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create new item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CLAIMS API ---

// Get all claims
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a claim
app.post('/api/claims', async (req, res) => {
  try {
    const newClaim = new Claim(req.body);
    const saved = await newClaim.save();
    await Item.findByIdAndUpdate(req.body.itemId, { status: 'PENDING_CLAIM' });
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update claim status
app.put('/api/claims/:id', async (req, res) => {
  try {
    const { status, reporterNotes } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status, reporterNotes },
      { new: true }
    );
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    if (status === 'APPROVED') {
      await Item.findByIdAndUpdate(claim.itemId, { status: 'RESOLVED' });
    }

    res.json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default app;
