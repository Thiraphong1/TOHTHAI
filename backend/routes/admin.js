const express = require('express');
const router = express.Router();
const { getOrderAdmin, changeOrderStatus } = require('../controllers/admin');
const { authCheck } = require('../middlewares/authCheck');

router.get('/admin/orders', authCheck, getOrderAdmin);
router.put('/admin/orders/:id/status', authCheck, changeOrderStatus);

module.exports = router;
