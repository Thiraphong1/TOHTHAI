
require('dotenv').config();//ขั้นแรกต้องใช้ express ในการสร้าง server นะ

const express = require('express')
const app = express()
const morgan = require('morgan')
const {  readdirSync } = require('fs')
const cors = require('cors')
// const categoryRoutes = require('./routes/category')
// const authRoutes = require('./routes/auth')
//middleware
app.use(morgan('dev'))
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors())
// app.use('/api', authRoutes)
// app.use('/api', categoryRoutes)
readdirSync('./routes')
.map((c)=>app.use('/api', require('./routes/'+c)))
// ขั้น3สร้าง route
// app.post('/api', (req, res) => {
//     const { username, password } = req.body
//     console.log(username, password)
//     res.send('ลองทำดูนะถถถ')
// })





// ขั้น2start server

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => { // 👈 ต้องมี '0.0.0.0'
    console.log(`Backend running on http://0.0.0.0:${port}`);
});

