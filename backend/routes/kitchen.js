// routes/kitchen.js
const express = require('express');
const router = express.Router();
const { authCheck, roleCheck } = require('../middlewares/authCheck')
const { getKitchenOrders, updateOrderStatus } = require('../controllers/kitchen');

// GET /api/kitchen/orders -> ดูรายการออเดอร์ที่ต้องทำ
router.get(
  '/cookorders',
  authCheck,
  roleCheck(['COOK', 'ADMIN']),
  getKitchenOrders
);

// PUT /api/kitchen/orders/:id/status -> อัปเดตสถานะ
router.put(
  '/cookorders/:id/status',
  authCheck,
  roleCheck(['COOK', 'ADMIN']), 
  updateOrderStatus
);

module.exports = router;