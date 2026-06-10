const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const SaleDetail = require('./models/SaleDetail');
const Expense = require('./models/Expense');
const RefreshToken = require('./models/RefreshToken');

// Import routes
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Define associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Sale.hasMany(SaleDetail, { foreignKey: 'sale_id' });
SaleDetail.belongsTo(Sale, { foreignKey: 'sale_id' });

Product.hasMany(SaleDetail, { foreignKey: 'product_id' });
SaleDetail.belongsTo(Product, { foreignKey: 'product_id' });

User.hasMany(RefreshToken, { foreignKey: 'user_id' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

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

// Routes
app.use('/api/auth', authRoutes);

// Sync database
sequelize.sync({ alter: true })
  .then(() => {
    console.log('All models synced to database!');
  })
  .catch((err) => {
    console.error('Error syncing database:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});