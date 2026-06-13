const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
    try {
        const { search } = req.query;
        
        const whereClause = search ? {
          product_name: { [Op.like]: `%${search}%` }
        } : {};
    
        const products = await Product.findAll({
          where: whereClause,
          include: [{ model: Category, attributes: ['category_name'] }]
        });
    
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ message: 'Failed to get products', error: error.message });
      }
    };
    
   
