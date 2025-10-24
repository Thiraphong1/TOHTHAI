const express = require('express');
const router = express.Router();

const { authCheck, roleCheck } = require('../middlewares/authCheck')
const { createTable, listTables, updateTableStatus } = require('../controllers/table');
const { getTablesCurrentStatus } = require('../controllers/reservation')

router.post('/table', authCheck, roleCheck(['ADMIN']), createTable);
// GET /api/tables -> ดึงโต๊ะทั้งหมด
router.get('/tables', listTables);

// PUT /api/tables/:id/status -> อัปเดตสถานะโต๊ะ
router.put('/:id/status', authCheck, roleCheck(['EMPLOYEE', 'ADMIN']), updateTableStatus);

// GET /api/tables/available -> ดึงโต๊ะที่ว่างทั้งหมด
router.get('/available', getTablesCurrentStatus);

module.exports = router;