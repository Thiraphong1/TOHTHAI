const express = require('express');
const router = express.Router();
const { getOrderAdmin, changeOrderStatus ,getAllReservations ,updateReservationStatus,getDashboardSummaryToday, getOrderTypeStatsToday,getTopSellingProducts } = require('../controllers/admin');
const { authCheck ,roleCheck} = require('../middlewares/authCheck');

router.get('/admin/orders', authCheck, getOrderAdmin);
router.put('/admin/orders/:id/status', authCheck, changeOrderStatus);
// GET /api/admin/reservations -> ดูการจองทั้งหมด
router.get('/reservations', authCheck, roleCheck(['USER', 'ADMIN']), getAllReservations);
// PUT /api/admin/reservations/:id/status -> อัปเดตสถานะการจอง
router.put('/reservations/:id/status', authCheck, roleCheck(['ADMIN']), updateReservationStatus);
router.get('/dashboard', authCheck, roleCheck(['ADMIN']), getDashboardSummaryToday);
router.get('/statstoday', authCheck, roleCheck(['ADMIN']), getOrderTypeStatsToday);
router.get('/topselling', authCheck, roleCheck(['ADMIN']), getTopSellingProducts);
module.exports = router;
