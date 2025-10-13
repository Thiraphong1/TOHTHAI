const prisma = require('../config/prisma');
exports.create = async (req, res) => {
  try {
    // code create category
    const { name } = req.body;
    const category = await prisma.category.create({
        data : { 
            name: name }
    })


    res.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
exports.list = async (req, res) => {
  try {
    // code create category
    const categories = await prisma.category.findMany()
    res.json(categories);
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
exports.remove = async (req, res) => {
  try {
    // code create category
    const{ id }= req.params;
    const category = await prisma.category.delete({
        where: { id: Number(id) }
    })
    console.log(id)
    res.json({ message: 'ลบเมนูนี้สำเร็จ' });
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'ไม่มีเมนูอยู่ในระบบ' })
  }
}