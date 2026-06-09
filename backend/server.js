const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'POS System is running',
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('POS Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});