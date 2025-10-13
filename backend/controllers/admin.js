const prisma = require('../config/prisma');

exports.getOrderAdmin = async (req, res) => {
  try {
    // ดึงข้อมูลคำสั่งซื้อทั้งหมด หรือกรองตามสถานะ
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        products: true, // สินค้าที่เกี่ยวข้องกับคำสั่งซื้อ
        orderedBy: true, // ข้อมูลของผู้สั่งซื้อ
      },
    });

    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    // ตรวจสอบคำสั่งซื้อ
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // อัปเดตสถานะของคำสั่งซื้อ
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus },
    });

    res.json({ message: "Order status updated successfully", updatedOrder });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
