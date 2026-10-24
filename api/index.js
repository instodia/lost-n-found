import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from '../server/models/Item.js';
import Claim from '../server/models/Claim.js';
import User from '../server/models/User.js';
import ActivityLog from '../server/models/ActivityLog.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Cached MongoDB Connection for Serverless Lambdas
let cachedPromise = null;
let lastError = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!cachedPromise) {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://instodia:srgi-project@cluster0.sobnsav.mongodb.net/findit?retryWrites=true&w=majority';
    cachedPromise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 9000,
      connectTimeoutMS: 9000,
    });
  }

  try {
    await cachedPromise;
    lastError = null;
    console.log('✅ Serverless Connected to MongoDB Atlas');
  } catch (err) {
    cachedPromise = null;
    lastError = err.message;
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
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {}
  }
  res.json({
    status: 'ok',
    serverless: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    error: lastError,
  });
});

// --- ITEMS API ---

// 1. Get all items
app.get('/api/items', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable: ' + (lastError || 'Connecting...') });
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
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable: ' + (lastError || 'Connecting...') });
    }
    const newItem = new Item(req.body);
    const saved = await newItem.save();
    console.log('✅ Item created in MongoDB:', saved._id, saved.title);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error creating item:', error.message);
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

// --- AUTH API ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) await connectDB();
    const { name, email, phone, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanName || !cleanPass) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = new User({
      name: cleanName,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      phone: (phone || '').trim(),
      password: cleanPass,
      role: role || 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      verified: true,
    });

    const saved = await newUser.save();
    const userRes = saved.toObject();
    userRes.id = userRes._id;
    delete userRes.password;
    res.status(201).json(userRes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) await connectDB();
    const { identifier, password } = req.body;
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return res.status(400).json({ error: 'Please enter identifier and password.' });
    }

    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
      password: cleanPass,
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userRes = user.toObject();
    userRes.id = userRes._id;
    delete userRes.password;
    res.json({ success: true, user: userRes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users
app.get('/api/auth/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map((u) => ({ ...u.toObject(), id: u._id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ACTIVITY LOGS API ---

// Get activity logs
app.get('/api/activity-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) await connectDB();
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(30);
    res.json(logs.map((l) => ({ ...l.toObject(), id: l._id })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create activity log
app.post('/api/activity-logs', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) await connectDB();
    const newLog = new ActivityLog(req.body);
    const saved = await newLog.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default app;
