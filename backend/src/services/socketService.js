// src/services/socketService.js
// ============================================
// WebSockets — إشعارات فورية
// ============================================
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

let io;

const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
        || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('غير مصرح'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await db.query(
        'SELECT id, tenant_id, name, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (!result.rows.length) return next(new Error('مستخدم غير موجود'));

      socket.user = result.rows[0];
      socket.tenantId = result.rows[0].tenant_id;
      next();
    } catch (err) {
      next(new Error('رمز مصادقة غير صالح'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 مستخدم متصل: ${socket.user.name} (${socket.user.id})`);

    // Join tenant room — للإشعارات الجماعية
    socket.join(`tenant:${socket.tenantId}`);
    // Join personal room
    socket.join(`user:${socket.user.id}`);

    // Send unread notifications count on connect
    sendUnreadCount(socket.user.id, socket.tenantId);

    socket.on('disconnect', () => {
      console.log(`🔌 مستخدم قطع الاتصال: ${socket.user.name}`);
    });

    // Mark notification as read
    socket.on('mark_read', async ({ notificationId }) => {
      await db.query(
        `UPDATE notifications SET status='read', read_at=NOW() WHERE id=$1`,
        [notificationId]
      );
      sendUnreadCount(socket.user.id, socket.tenantId);
    });

    // Workflow run status subscription
    socket.on('watch_run', ({ runId }) => {
      socket.join(`run:${runId}`);
    });
  });

  return io;
};

// ===== Send notification to tenant =====
const notifyTenant = (tenantId, event, data) => {
  if (!io) return;
  io.to(`tenant:${tenantId}`).emit(event, data);
};

// ===== Send notification to user =====
const notifyUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

// ===== Workflow run update =====
const updateRunStatus = (runId, status, data = {}) => {
  if (!io) return;
  io.to(`run:${runId}`).emit('run_update', { runId, status, ...data });
};

// ===== Unread count =====
const sendUnreadCount = async (userId, tenantId) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE (user_id=$1 OR tenant_id=$2) AND status='unread'`,
      [userId, tenantId]
    );
    notifyUser(userId, 'unread_count', { count: parseInt(result.rows[0].count) });
  } catch (err) {}
};

// ===== Push real-time notification =====
const pushNotification = async ({ tenantId, userId, type, title, message, data = {} }) => {
  // Save to DB
  const result = await db.query(
    `INSERT INTO notifications (tenant_id, user_id, type, title, message, metadata)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [tenantId, userId, type, title, message, JSON.stringify(data)]
  );

  const notification = result.rows[0];

  // Emit via socket
  if (userId) {
    notifyUser(userId, 'notification', notification);
    sendUnreadCount(userId, tenantId);
  } else {
    notifyTenant(tenantId, 'notification', notification);
  }

  return notification;
};

module.exports = { init, notifyTenant, notifyUser, updateRunStatus, pushNotification };
