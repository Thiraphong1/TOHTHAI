const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma');

exports.authCheck = async (req, res, next) => {
    try {
        const headerToken = req.headers.authorization
        if(!headerToken){
            return res.status(401).json({ message: "ไม่มี Token" });
        }
        const token = headerToken.split(" ")[1]

        const decode = jwt.verify(token, process.env.SECRET)
        req.user = decode
        //ดึงข้อมูล user จาก database มาใส่ req.user
        const user = await prisma.user.findFirst({
            where: { 
                username: req.user.username }
        })
        if(!user.enabled)
            return res.status(403).json({ message: "บัญชีผู้ใช้ถูกระงับ" });
        console.log(user)
        console.log("hello bro")

        next()
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
}

exports.adminCheck = async (req, res, next) => {
    try {
        const { username } = req.user
        console.log(username)
        const adminUser = await prisma.user.findFirst({
            where: { 
                username: username }
        })
        if(!adminUser||adminUser.role !== 'admin'){
            return res.status(403).json({ message: "ไม่สามารถเข้าถึงได้ admin เท่านั้น" });
        }
        console.log("adminUser:", adminUser)
        next()
    } catch (error) {
        res.status(401).json({ message: "ไม่สามารถเข้าถึงได้" });
    }
}
