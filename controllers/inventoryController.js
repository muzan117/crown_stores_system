const {
  getInventory,
  getLowStockProducts,
  adjustStock,
  getInventoryLogs,
  logAdjustment
} = require('../models/inventoryModel');

const { getProductById } = require('../models/productModel');

const getAllInventory = async (req, res) => {
  try {
    const inventory = await getInventory();
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const lowStock = await getLowStockProducts();
    res.status(200).json({
      message: lowStock.length > 0 ? 'Low stock alert' : 'All products have sufficient stock',
      count: lowStock.length,
      products: lowStock
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const adjustInventory = async (req, res) => {
  try {
    const { newQuantity, reason } = req.body;
    const productId = req.params.id;

    if (newQuantity === undefined || !reason) {
      return res.status(400).json({ message: 'New quantity and reason are required' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const quantityChange = newQuantity - product.quantity_available;

    await adjustStock(productId, newQuantity);
    await logAdjustment(productId, quantityChange, reason, req.user.userId);

    res.status(200).json({ message: 'Stock adjusted successfully', previousQuantity: product.quantity_available, newQuantity, quantityChange });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getStockLogs = async (req, res) => {
  try {
    const logs = await getInventoryLogs();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllInventory, getLowStock, adjustInventory, getStockLogs };