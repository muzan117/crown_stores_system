const db = require('../config/db');

const getInventory = async () => {
  const query = 'SELECT p.product_id, p.product_name, p.quantity_available, p.reorder_level, p.status, c.category_name FROM products p JOIN categories c ON p.category_id = c.category_id ORDER BY p.product_name';
  const [rows] = await db.query(query);
  return rows;
};

const getLowStockProducts = async () => {
  const query = 'SELECT p.product_id, p.product_name, p.quantity_available, p.reorder_level, c.category_name FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.quantity_available <= p.reorder_level';
  const [rows] = await db.query(query);
  return rows;
};

const adjustStock = async (productId, newQuantity) => {
  const query = 'UPDATE products SET quantity_available = ? WHERE product_id = ?';
  await db.query(query, [newQuantity, productId]);
};

const getInventoryLogs = async () => {
  const query = 'SELECT il.*, p.product_name FROM inventory_logs il JOIN products p ON il.product_id = p.product_id ORDER BY il.created_at DESC';
  const [rows] = await db.query(query);
  return rows;
};

const logAdjustment = async (productId, quantityChange, reason, createdBy) => {
  const query = 'INSERT INTO inventory_logs (product_id, change_type, quantity_change, reason, created_by) VALUES (?, ?, ?, ?, ?)';
  await db.query(query, [productId, 'adjustment', quantityChange, reason, createdBy]);
};

module.exports = {
  getInventory,
  getLowStockProducts,
  adjustStock,
  getInventoryLogs,
  logAdjustment
};