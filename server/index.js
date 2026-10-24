import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Item from './models/Item.js';
import Claim from './models/Claim.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FindIt API Server running' });
});

// --- ITEMS ROUTES ---

// 1. Get all items
app.get('/api/items', async (req, res) => {
  try {
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

// --- CLAIMS ROUTES ---

// Get claims
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit claim
app.post('/api/claims', async (req, res) => {
  try {
    const newClaim = new Claim(req.body);
    const saved = await newClaim.save();

    // Mark item as PENDING_CLAIM
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

    // If approved, mark item as RESOLVED
    if (status === 'APPROVED') {
      await Item.findByIdAndUpdate(claim.itemId, { status: 'RESOLVED' });
    }

    res.json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FindIt Backend Server running on http://localhost:${PORT}`);
});
