require('dotenv').config();

const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
const path = require('path'); // 👍 ถูกต้อง

// 1. กำหนด Absolute Path สำหรับโฟลเดอร์ routes
// __dirname คือ Directory ที่ไฟล์ server.js นี้อยู่
const routesDir = path.join(__dirname, 'routes');

// const categoryRoutes = require('./routes/category')
// const authRoutes = require('./routes/auth')

//middleware
app.use(morgan('dev'))
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors())
// app.use('/api', authRoutes)
// app.use('/api', categoryRoutes)

// 2. แก้ไข: ใช้ Path ที่กำหนดด้วย path.join()
try {
    readdirSync(routesDir)
    .map((c) => {
        // ใช้ path.join() สำหรับการ require ไฟล์ route ด้วย เพื่อให้ Path ถูกต้อง
        app.use('/api', require(path.join(routesDir, c)));
    });
} catch (error) {
    // เพิ่มการจัดการ Error ในกรณีที่หาโฟลเดอร์ routes ไม่เจอ
    console.error(`Error loading routes: ${error.message}`);
    // ข้อความนี้จะปรากฏใน Vercel Logs ชัดเจนขึ้น
    // คุณอาจไม่ต้องการให้ Server Crash ด้วยการ throw error;
}


// ขั้น3สร้าง route
// app.post('/api', (req, res) => {
//     const { username, password } = req.body
//     console.log(username, password)
//     res.send('ลองทำดูนะถถถ')
// })


// ขั้น2start server
// Vercel Serverless Functions ไม่จำเป็นต้องมีการเรียก app.listen() แต่สำหรับ Local Test ก็ยังคงต้องมี
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => { 
    console.log(`Backend running on http://0.0.0.0:${port}`);
});