const mongoose = require('mongoose');
require('dotenv').config();
const DemoPage = require('./models/DemoPage');

const demoPages = [
  {
    title: 'Museum Exhibit – The Pharaoh’s Mask',
    slug: 'museum',
    type: 'museum',
    curatorKey: 'curator123',
    content: `Discover the golden mask of Pharaoh Tutankhamun. This artifact, over 3,000 years old, symbolizes ancient Egyptian royalty and craftsmanship.`,
    mediaUrl: 'https://yourcdn.com/images/museum.jpg'
  },
  {
    title: 'Organic Apple Juice – Product Info',
    slug: 'product',
    type: 'product',
    curatorKey: 'curator456',
    content: `This juice is made from 100% organic apples. No added sugar, preservatives, or artificial flavors. Just the pure taste of nature.`,
    mediaUrl: 'https://yourcdn.com/images/product.jpg'
  },
  {
    title: 'Breathing Exercise – Wellness Guide',
    slug: 'health',
    type: 'health',
    curatorKey: 'curator789',
    content: `Follow this simple breathing exercise to reduce stress: inhale for 4 seconds, hold for 4, exhale for 6. Repeat for 2 minutes.`,
    mediaUrl: 'https://yourcdn.com/images/health.jpg'
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await DemoPage.deleteMany({});
    await DemoPage.insertMany(demoPages);
    console.log('✅ Demo pages inserted!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error inserting demo data:', err);
  });
