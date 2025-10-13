const express = require('express')
const router = express.Router()
const { getAllUsers,changeStatus,changeRole,userCart,getUserCart,emptyCart,saveInfo,saveOrder,getOrder } = require('../controllers/user')
const { authCheck ,adminCheck} = require('../middlewares/authCheck')


router.get('/users',authCheck,adminCheck, getAllUsers)
router.post('/change-role',authCheck,adminCheck, changeRole)
router.post('/change-status',authCheck,adminCheck, changeStatus)

router.post('/user/cart',authCheck,userCart)
router.get('/user/cart',authCheck,getUserCart)
router.delete('/user/cart',authCheck,emptyCart)
router.post('/user/info',authCheck,saveInfo)
router.post('/user/order',authCheck,saveOrder)
router.get('/user/order',authCheck,getOrder) 










module.exports = router