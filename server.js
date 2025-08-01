// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');
const cors = require('cors');
const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const app = express();
app.use(bodyParser.json());


app.use(cors({
  origin: ['https://scanmeai.com', 'http://localhost:5173'],
  credentials: true
}));
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Models (schemas would be in separate files in production)
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  isSubscribed: Boolean,
  demoItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DemoItem' }],
  createdAt: { type: Date, default: Date.now }
}));

const DemoItem = mongoose.model('DemoItem', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  itemName: String,
  description: String,
  textContent: String,
  ttsAudioUrl: String,
  qrCodeUrl: String,
  voiceActor: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
}));

// Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// POST /api/users/signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { email, password, name, subscribeToNewsletter } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'Email already exists' });
    }

    const user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      name,
      isSubscribed: subscribeToNewsletter
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).send({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isSubscribed: user.isSubscribed
      },
      token,
      demoLimit: 3,
      remainingDemos: 3 - user.demoItems.length
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// POST /api/users/login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.send({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      token,
      demoLimit: 3,
      remainingDemos: 3 - user.demoItems.length
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({ error: error.message });
  }
});

// POST /api/demo-items
app.post('/api/demo-items', authenticate, async (req, res) => {
  try {
    if (req.user.demoItems.length >= 3) {
      return res.status(400).send({ error: 'Demo limit reached' });
    }

    const { itemName, description, textContent } = req.body;

    if (textContent.split(/\s+/).length > 300) {
      return res.status(400).send({ error: 'Text content exceeds 300 words' });
    }

    const demoItem = new DemoItem({
      userId: req.user._id,
      itemName,
      description,
      textContent
    });

    await demoItem.save();
    req.user.demoItems.push(demoItem._id);
    await req.user.save();

    res.status(201).send({
      id: demoItem._id,
      itemName: demoItem.itemName,
      description: demoItem.description,
      wordCount: textContent.split(/\s+/).length,
      createdAt: demoItem.createdAt,
      remainingDemos: 3 - req.user.demoItems.length
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// GET /api/demo-items
app.get('/api/demo-items', authenticate, async (req, res) => {
  try {
    const demoItems = await DemoItem.find({ userId: req.user._id });
    res.send({
      items: demoItems,
      total: demoItems.length,
      remaining: 3 - demoItems.length
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/api/tts/generate', authenticate, async (req, res) => {
  try {
    const { demoItemId, voiceActor = 'JBFqnCBsd6RMkjVDRZzb' } = req.body;

    // Find the demo item for the authenticated user
    const demoItem = await DemoItem.findOne({
      _id: demoItemId,
      userId: req.user._id
    });

    if (!demoItem) {
      return res.status(404).send({ error: 'Demo item not found' });
    }

    // Request speech generation from ElevenLabs
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceActor}?output_format=mp3_22050_32`,
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      data: {
        text: demoItem.textContent,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
    });

    // Write the MP3 file
    const fileName = `tts-${uuidv4()}.mp3`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, response.data); // save as binary

    // Save audio reference in the DB
    const audioUrl = `/uploads/${fileName}`;
    demoItem.ttsAudioUrl = audioUrl;
    demoItem.voiceActor = voiceActor;
    demoItem.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month
    await demoItem.save();

    // Return result
    res.send({
      id: demoItem._id,
      audioUrl,
      voiceActor,
      expiresAt: demoItem.expiresAt
    });

  } catch (error) {
    if (error.response?.data && Buffer.isBuffer(error.response.data)) {
      const errorJson = JSON.parse(error.response.data.toString('utf8'));
      console.error('TTS Error:', errorJson);
      return res.status(400).send({ error: errorJson.detail?.message || 'TTS generation failed' });
    }

    console.error('TTS Error:', error.message);
    res.status(400).send({ error: error.message || 'TTS generation failed' });
  }

});


// POST /api/qr-codes/generate
app.post('/api/qr-codes/generate', authenticate, async (req, res) => {
  try {
    const { demoItemId } = req.body;
    const demoItem = await DemoItem.findOne({ _id: demoItemId, userId: req.user._id });

    if (!demoItem) {
      return res.status(404).send({ error: 'Demo item not found' });
    }

    // Generate QR code
    const qrCodeDataUrl = await qrcode.toDataURL(
      `https://scanmeai.com/demo/${demoItem._id}`
    );

    // Save QR code image locally
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const fileName = `qr-${uuidv4()}.png`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, base64Data, 'base64');

    const qrCodeUrl = `/uploads/${fileName}`;

    // Update demo item
    demoItem.qrCodeUrl = qrCodeUrl;
    await demoItem.save();

    res.send({
      id: demoItem._id,
      qrCodeUrl,
      downloadUrl: qrCodeUrl // Direct download link
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// GET /api/version/features
app.get('/api/version/features', (req, res) => {
  res.send({
    freeVersion: {
      demoLimit: 3,
      ttsWordLimit: 300,
      audioValidity: "1 month",
      features: [
        "Basic TTS",
        "QR Generation",
        "3 Demo Items",
        "Standard Voice Options"
      ]
    },
    paidVersion: {
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      features: [
        "Unlimited demo items",
        "Up to 5000 words per item",
        "Premium voice options",
        "Custom voice training",
        "Analytics dashboard",
        "Visitor tracking",
        "Custom branding",
        "API access",
        "Priority support",
        "Bulk operations"
      ],
      analytics: {
        qrScans: true,
        geoLocation: true,
        deviceInfo: true,
        timeSpent: true,
        customEvents: true
      },
      reporting: {
        dailyReports: true,
        weeklyDigests: true,
        customExports: true,
        APIIntegration: true
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));