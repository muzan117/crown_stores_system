const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getLowStock,
  adjustInventory,
  getStockLogs
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllInventory);
router.get('/low-stock', protect, getLowStock);
router.get('/logs', protect, authorize('manager', 'director'), getStockLogs);
router.put('/adjust/:id', protect, authorize('manager'), adjustInventory);

module.exports = router;