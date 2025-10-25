// routes/auth.js

const express = require('express');
const router = express.Router();
const { register, login, currentUser ,currentEmployee,currentCook,resetPassword,forgotPassword} = require('../controllers/auth');
//import middleware
const {authCheck, adminCheck} = require('../middlewares/authCheck');

//auth

router.post('/register', register);
router.post('/login', login);
router.post('/current-user',authCheck, currentUser);
router.post('/current-admin',authCheck, adminCheck, currentUser);
router.post('/current-employee',authCheck, currentEmployee, currentUser);
router.post('/current-cook',authCheck, currentCook, currentUser);
router.post('/reset-password',resetPassword);
router.post('/forgot-password',forgotPassword);

module.exports = router;
