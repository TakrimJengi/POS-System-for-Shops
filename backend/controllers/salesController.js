const Sale = require('../models/Sale');
const SaleDetail = require('../models/SaleDetail');
const Product = require('../models/Product');
const sequelize = require('../config/db');

// Generate unique invoice number
const generateInvoiceNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  // CREATE SALE
exports.createSale = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { items } = req.body;
  
      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Cart items are required' });
      }
  
      let total_amount = 0;
      const saleDetails = [];
  
      // Process each item in cart
      for (const item of items) {
        const { product_id, quantity } = item;
  
        if (!product_id || !quantity || quantity <= 0) {
          await transaction.rollback();
          return res.status(400).json({ message: 'Valid product ID and quantity required for each item' });
        }
  
        // Find product
        const product = await Product.findByPk(product_id, { transaction });
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({ message: `Product with ID ${product_id} not found` });
        }
  
        // Check stock
        if (product.stock_quantity < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            message: `Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}`
          });
        }
  
        // Calculate item total
        const itemTotal = product.selling_price * quantity;
        total_amount += parseFloat(itemTotal);
  
        saleDetails.push({
          product_id,
          quantity,
          unit_price: product.selling_price
        });
  
        // Reduce stock
        await product.update({
          stock_quantity: product.stock_quantity - quantity
        }, { transaction });
      }
  
      // Create sale
      const invoice_no = generateInvoiceNo();
      const sale = await Sale.create({
        invoice_no,
        total_amount,
        sale_date: new Date()
      }, { transaction });

      // Create sale details
      for (const detail of saleDetails) {
        await SaleDetail.create({
          sale_id: sale.id,
          ...detail
        }, { transaction });
      }
  
      // Commit transaction
      await transaction.commit();
  
      res.status(201).json({
        message: 'Sale created successfully',
        invoice_no: sale.invoice_no,
        total_amount: sale.total_amount,
        items_sold: saleDetails.length
      });
  
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ message: 'Failed to create sale', error: error.message });
    }
  };

  // GET ALL SALES (Invoice History)
exports.getAllSales = async (req, res) => {
    try {
      const sales = await Sale.findAll({
        order: [['sale_date', 'DESC']]
      });
  
      res.status(200).json(sales);
  
    } catch (error) {
      res.status(500).json({ message: 'Failed to get sales', error: error.message });
    }
  };

  // GET SINGLE INVOICE (with full details)
exports.getInvoice = async (req, res) => {
    try {
      const { id } = req.params;
  
      const sale = await Sale.findByPk(id, {
        include: [{
          model: SaleDetail,
          include: [{ model: Product, attributes: ['product_name'] }]
        }]
      });
  
      if (!sale) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.status(200).json(sale);
  
    } catch (error) {
      res.status(500).json({ message: 'Failed to get invoice', error: error.message });
    }
  };