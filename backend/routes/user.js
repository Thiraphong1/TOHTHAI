const express = require('express')
const router = express.Router()
const { getAllUsers,changeStatus,changeRole,userCart,getUserCart,emptyCart,saveInfo,saveOrder,getOrder,updateCartDeliveryOption } = require('../controllers/user')
const { authCheck ,adminCheck} = require('../middlewares/authCheck')


router.get('/users',authCheck,adminCheck, getAllUsers)
router.put('/change-role',authCheck,adminCheck, changeRole)
router.put('/change-status',authCheck,adminCheck, changeStatus)

router.post('/user/cart',authCheck,userCart)
router.get('/user/cart',authCheck,getUserCart)
router.delete('/user/cart',authCheck,emptyCart)
router.post('/user/info',authCheck,saveInfo)
router.post('/user/order',authCheck,saveOrder)
router.get('/user/order',authCheck,getOrder) 


router.put('/user/address', authCheck, saveInfo); // สำหรับอัปเดตที่อยู่
router.put('/user/cart/delivery', authCheck, updateCartDeliveryOption); // สำหรับอัปเดตวิธีรับของ/โต๊ะใน Cart







module.exports = router