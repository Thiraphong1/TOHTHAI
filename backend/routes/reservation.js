const express = require('express');
const router = express.Router();
const { authCheck } = require('../middlewares/authCheck')
const { createReservation } = require('../controllers/reservation');

// POST /api/reservations -> User สร้างการจองใหม่
router.post('/reservation', authCheck, createReservation);


module.exports = router;