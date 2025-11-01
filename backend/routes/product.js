const express = require('express')
const router = express.Router()
const { create,update, remove, list,  listby,listsall, searchFilters,read,images,removeImage } = require('../controllers/product')
const { authCheck,adminCheck } = require('../middlewares/authCheck')
// endpoints https://tohthai.vercel.app//api/product
router.post('/product',create)
router.get('/products/:count',list)
router.get('/products',listsall)
router.put('/product/:id',update)
router.delete('/product/:id',remove)
router.post('/productby',listby)
router.post('/search/filters',searchFilters)
router.get('/product/:id',read)

router.post('/images',authCheck,adminCheck,images)
router.post('/removeimages',authCheck,adminCheck,removeImage)

module.exports = router