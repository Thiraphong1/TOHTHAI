// controllers/auth.js
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const e = require('express');
const jwt = require('jsonwebtoken');



exports.register = async (req, res) => {
  try {
    // code register
    const { username, password } = req.body;
    // validation body
    if(!username) {
      console.log('Username is required');
      return res.status(400).json({ message: 'Username is required' });
    }
    if(!password) {
      console.log('password is required');
      return res.status(400).json({ message: 'password is required' });
    }
    // chack userใน database
    const user = await prisma.user.findFirst({
      where: { 
        username : username
      }
    })
    console.log(user)
    if(user) {
      return res.status(400).json({ message: 'มีผู้ใช้งานนี้ในระบบแล้วนะค้าบโบร๋' });
    }
    // ขั้นที่ 3 hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(hashedPassword)

    // ขั้นที่ 4 create user in database
    await prisma.user.create({
      data:{ username: username, password: hashedPassword}
    })



    res.json({ message: 'สมัครได้แล้วนะฮ้าฟฟฟ' });
  } catch (err) {
    // error
    console.log(err);
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
