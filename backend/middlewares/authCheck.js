const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// [ปรับปรุง] ให้ดึงข้อมูล user ทั้งหมดมาใส่ใน req.user
exports.authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = headerToken.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET);

    // ดึงข้อมูล user ล่าสุดจาก database
    const user = await prisma.user.findFirst({
      where: { username: decoded.username }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.enabled) {
      return res.status(403).json({ message: "Your account is suspended" });
    }
    
    // ✅ ส่งข้อมูล user ทั้งหมดไปกับ request
    // ทำให้ middleware ตัวต่อไป (เช่น roleCheck) มีข้อมูลครบถ้วน
    req.user = user; 
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ [เพิ่มใหม่] Middleware ที่ยืดหยุ่นสำหรับตรวจสอบ Role
exports.roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        res.status(403).json({ message: "Forbidden: You do not have permission..." });
      }
    } catch (error) {
      res.status(401).json({ message: "Authorization error" });
    }
  };
};

// [แนะนำ] ฟังก์ชันนี้สามารถลบทิ้งได้ แล้วใช้ roleCheck(['ADMIN']) แทน
exports.adminCheck = async (req, res, next) => {
  try {
    const { username } = req.user;
    const adminUser = await prisma.user.findFirst({
      where: { username: username }
    });
    if (!adminUser || adminUser.role !== 'ADMIN') { 
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Access denied" });
  }
};