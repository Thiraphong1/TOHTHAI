// controllers/auth.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const e = require('express');
const jwt = require('jsonwebtoken');



exports.register = async (req, res) => {
  try {
    //  1. 
    const { username, password, email, phone } = req.body;

    // Validation พื้นฐาน (อาจจะ Validate เพิ่มเติม เช่น format email/phone)
    if (!username || !password || !email) {
      return res.status(400).json({ message: "กรุณากรอก Username, Password และ Email ให้ครบถ้วน" });
    }

    //  2. ตรวจสอบว่า Username หรือ Email ซ้ำหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username นี้ถูกใช้งานแล้ว" });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email นี้ถูกใช้งานแล้ว" });
      }
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User ใหม่
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,    
        phone,    
      },
    });

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ", user: { id: newUser.id, username: newUser.username, email: newUser.email } });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    // code login
    const { username, password } = req.body;
    // chack emailใน database
    const user = await prisma.user.findFirst({
      where: { username : username }  
    })
    if(!user || !user.enabled) {
      return res.status(400).json({ message: 'ไม่มีผู้ใช้งานนี้ในระบบนะค้าบ' })
    }
    // chack password ใน database
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้องค้าบ' })
    }
    //payload
    const payload = { 
      id: user.id,
      username: user.username,
      role: user.role
    };
    // create token
    jwt.sign(
      payload,
      process.env.SECRET,{ expiresIn: '1d' },(err,token)=>{
        if(err){
          return res.status(500).json({ message: "Server Error" });
        }
        res.json({ payload, token });
      }
    )
  } catch (err) {
    // error
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    // code current user
    const user= await prisma.user.findFirst({
      where : { username : req.user.username },
      select: { id: true, username: true, role: true, enabled: true }
    })
    
    res.json({ user })
  } catch (err) {
    // error
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.currentEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied. Employees only." });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  } 
};
exports.currentCook = async (req, res, next) => {
  try {
    if (req.user.role !== 'COOK' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Access denied. Cooks only." });
    }
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};