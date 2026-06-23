const Sale = require('../models/Sale');
const SaleDetail = require('../models/SaleDetail');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const { Op } = require('sequelize');

// FINANCIAL SUMMARY (Income, Expense, Profit)
exports.getFinancialSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Build date filter if provided
    const dateFilter = {};
    if (start_date && end_date) {
      dateFilter[Op.between] = [start_date, end_date];
    }

    // Get total income from sales
    const sales = await Sale.findAll({
      where: start_date && end_date ? { sale_date: dateFilter } : {}
    });
    const totalIncome = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    // Get total expenses
    const expenses = await Expense.findAll({
      where: start_date && end_date ? { expense_date: dateFilter } : {}
    });
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    // Calculate profit
    const profit = totalIncome - totalExpenses;

    res.status(200).json({
      period: start_date && end_date ? `${start_date} to ${end_date}` : 'All time',
      total_income: parseFloat(totalIncome.toFixed(2)),
      total_expenses: parseFloat(totalExpenses.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      total_sales_count: sales.length,
      total_expenses_count: expenses.length
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to get financial summary', error: error.message });
  }
};

// CATEGORY-WISE SALES REPORT
exports.getCategoryWiseSales = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const saleDateFilter = {};
    if (start_date && end_date) {
      saleDateFilter[Op.between] = [start_date, end_date];
    }

    // Get all sale details with product and category info
    const saleDetails = await SaleDetail.findAll({
      include: [
        {
          model: Product,
          attributes: ['product_name', 'category_id'],
          include: [{ model: Category, attributes: ['category_name'] }]
        },
        {
          model: Sale,
          attributes: ['sale_date'],
          where: start_date && end_date ? { sale_date: saleDateFilter } : {}
        }
      ]
    });

    // Group by category
    const categoryReport = {};

    saleDetails.forEach(detail => {
      const categoryName = detail.Product.Category.category_name;
      const itemTotal = detail.quantity * parseFloat(detail.unit_price);

      if (!categoryReport[categoryName]) {
        categoryReport[categoryName] = {
          category_name: categoryName,
          total_quantity_sold: 0,
          total_revenue: 0
        };
      }

      categoryReport[categoryName].total_quantity_sold += detail.quantity;
      categoryReport[categoryName].total_revenue += itemTotal;
    });

    // Convert to array and round numbers
    const report = Object.values(categoryReport).map(cat => ({
      ...cat,
      total_revenue: parseFloat(cat.total_revenue.toFixed(2))
    }));

    // Sort by highest revenue first
    report.sort((a, b) => b.total_revenue - a.total_revenue);

    res.status(200).json({
      period: start_date && end_date ? `${start_date} to ${end_date}` : 'All time',
      category_report: report
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to get category sales report', error: error.message });
  }
};

// DAILY/MONTHLY SUMMARY
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const sales = await Sale.findAll({ where: { sale_date: targetDate } });
    const totalIncome = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

    const expenses = await Expense.findAll({ where: { expense_date: targetDate } });
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    res.status(200).json({
      date: targetDate,
      total_income: parseFloat(totalIncome.toFixed(2)),
      total_expenses: parseFloat(totalExpenses.toFixed(2)),
      profit: parseFloat((totalIncome - totalExpenses).toFixed(2)),
      sales_count: sales.length
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to get daily summary', error: error.message });
  }
};