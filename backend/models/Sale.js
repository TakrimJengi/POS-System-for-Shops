const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  sale_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Sale;