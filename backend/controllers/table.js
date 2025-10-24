const prisma = require('../config/prisma');

/**
 * @desc    สร้างโต๊ะใหม่
 * @route   POST /api/tables
 * @access  Private (Admin)
 */
exports.createTable = async (req, res) => {
  try {
    const { number, capacity } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!number || !capacity) {
      return res.status(400).json({ message: "กรุณาระบุหมายเลขโต๊ะและความจุ" });
    }

    const newTable = await prisma.table.create({
      data: {
        number: number,
        capacity: Number(capacity),
        // status จะเป็น AVAILABLE โดยอัตโนมัติตาม schema
      },
    });

    res.status(201).json({ message: "สร้างโต๊ะสำเร็จ", table: newTable });
  } catch (err) {
    // จัดการกรณีที่หมายเลขโต๊ะซ้ำ (Prisma error code P2002)
    if (err.code === 'P2002') {
      return res.status(409).json({ message: `หมายเลขโต๊ะ "${number}" ถูกใช้งานแล้ว` });
    }
    console.error("Error creating table:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
/**
 * @desc    ดึงข้อมูลโต๊ะทั้งหมด
 * @route   GET /api/tables
 * @access  Private (Employee, Admin)
 */
exports.listTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' }, // เรียงตามหมายเลขโต๊ะ
    });
    res.json(tables);
  } catch (err) {
    console.error("Error fetching tables:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    อัปเดตสถานะของโต๊ะ (เช่น พนักงานเคลียร์โต๊ะเสร็จ)
 * @route   PUT /api/tables/:id/status
 * @access  Private (Employee, Admin)
 */
exports.updateTableStatus = async (req, res) => {
  try {
    const tableId = Number(req.params.id);
    const { status } = req.body; // รับ 'AVAILABLE' หรือ 'OCCUPIED'

    // ป้องกันข้อมูลผิดพลาด
    if (status !== 'AVAILABLE' && status !== 'OCCUPIED') {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { status },
    });

    res.json({ message: `อัปเดตสถานะโต๊ะ ${updatedTable.number} สำเร็จ`, table: updatedTable });
  } catch (err) {
    console.error("Error updating table status:", err);
    res.status(500).json({ message: "Server Error" });
  }
};