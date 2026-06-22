const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { protect, authorize } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

db.query('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.get('/', (req, res) => {
  res.send('Crown Stores System API is running...');
});

app.use('/api/auth', authRoutes);
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const procurementRoutes = require('./routes/procurementRoutes');
app.use('/api/procurements', procurementRoutes);
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);
app.get('/api/test-protected', protect, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.userId}! Your role is ${req.user.role}.` });
});

app.get('/api/test-director-only', protect, authorize('director'), (req, res) => {
  res.json({ message: `This route is only for directors. You made it!` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});