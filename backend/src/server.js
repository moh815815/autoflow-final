// src/server.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ===== SOCKET.IO =====
const socketService = require('./services/socketService');
socketService.init(server);

// ===== MIDDLEWARE =====
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'طلبات كثيرة، حاول لاحقاً' },
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== ROUTES =====
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/workflows',     require('./routes/workflows'));
app.use('/api/integrations',  require('./routes/integrations'));
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/attendance',    require('./routes/attendance'));
app.use('/api/payroll',       require('./routes/payroll'));
app.use('/api/leave',         require('./routes/leave'));
app.use('/api/orders',        require('./routes/orders'));
app.use('/api/customers',     require('./routes/customers'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/invoices',      require('./routes/invoices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/webhooks',      require('./routes/webhooks'));
app.use('/api/billing',       require('./routes/billing'));
app.use('/api/admin',         require('./routes/admin'));

// File upload
app.post('/api/upload', require('./middleware/auth').authenticate, (req, res, next) => {
  const { upload } = require('./services/uploadService');
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'لم يتم رفع ملف' });
    const url = `/uploads/${req.file.destination.split('uploads')[1]}/${req.file.filename}`.replace('//', '/');
    res.json({ url, filename: req.file.filename, size: req.file.size });
  });
});

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  version: '1.0.0',
  uptime: process.uptime(),
  time: new Date(),
}));

// 404
app.use((req, res) => res.status(404).json({ error: 'المسار غير موجود' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'خطأ داخلي',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 أوتوفلو يعمل على المنفذ ${PORT}`);
  console.log(`📡 Socket.IO جاهز`);
  console.log(`🌍 http://localhost:${PORT}\n`);
  require('./jobs/scheduler');
});

module.exports = { app, server };
