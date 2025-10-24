// routes/employee.js
const express = require('express');
const router = express.Router();

const { authCheck, roleCheck } = require('../middlewares/authCheck')


const { 
  saveOrderByEmployee, 
  getEmployeeOrders 
} = require('../controllers/employee'); 

// --- กำหนดเส้นทางสำหรับ Employee ---

// POST /api/employee/order
router.post(
  '/employee/order',
  authCheck, 
  roleCheck(['EMPLOYEE', 'ADMIN']),
  saveOrderByEmployee // ✅ เรียกใช้ฟังก์ชันจาก employeeController
);

// ✅ 2. เพิ่ม Route ใหม่สำหรับดึงประวัติการสั่งซื้อ
// GET /api/employee/orders
router.get(
  '/orders',
  authCheck,
  roleCheck(['EMPLOYEE', 'ADMIN']),
  getEmployeeOrders
);

module.exports = router;