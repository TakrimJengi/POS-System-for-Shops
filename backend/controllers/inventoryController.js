const Product = require('../models/Product');
const Category = require('../models/Category');

// GET ALL INVENTORY
exports.getInventory = async (req, res) => {
    try {
      const products = await Product.findAll({
        include: [{ model: Category, attributes: ['category_name'] }]
      });
  
      const inventory = products.map(product => ({
        id: product.id,
        product_name: product.product_name,
        category_name: product.Category.category_name,
        stock_quantity: product.stock_quantity,
        minimum_stock: product.minimum_stock,
        purchase_price: product.purchase_price,
        selling_price: product.selling_price,
        updatedAt: product.updatedAt
      }));

      res.status(200).json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get inventory' });
    }
  };
  // STOCK IN (Add stock to a product)
exports.stockIn = async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
  
      if (!product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid product ID and quantity required' });
      }
  
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const previousQuantity = product.stock_quantity;
      const newQuantity = previousQuantity + parseInt(quantity);
      await product.update({ stock_quantity: newQuantity });
  
      res.status(200).json({
        message: 'Stock added successfully',
        product_name: product.product_name,
        previous_quantity: previousQuantity,
        added_quantity: parseInt(quantity),
        new_quantity: newQuantity
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Failed to add stock', error: error.message });
    }
  };