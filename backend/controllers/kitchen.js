// controllers/kitchen.js
const prisma = require('../config/prisma');

/**
 * @desc    (Cook/Admin) ดึงรายการ Order ที่ต้องทำในครัว
 * @route   GET /api/kitchen/orders
 * @access  Private (Cook, Admin)
 */
exports.getKitchenOrders = async (req, res) => {
    try {
        // ดึงเฉพาะ Order ที่มีสถานะเกี่ยวข้องกับครัว เช่น PROCESSING
        // และเรียงตามลำดับก่อนหลัง
        const orders = await prisma.order.findMany({
            where: {
                orderStatus: 'PENDING_CONFIRMATION' // หรือ 'PENDING_CONFIRMATION' ถ้า Admin ยืนยันแล้วส่งเข้าครัวเลย
            },
            orderBy: { createdAt: 'asc' }, // ทำออเดอร์เก่าก่อน
            include: {
                table: { select: { number: true } }, // แสดงหมายเลขโต๊ะ (ถ้ามี)
                products: { // ดึงรายการสินค้าในออเดอร์
                    include: {
                        product: { select: { title: true } } // เอาแค่ชื่อสินค้า
                    }
                }
            }
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching kitchen orders:", err);
        res.status(500).json({ message: "Server Error" });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body; // รับสถานะใหม่ เช่น 'COMPLETED'

        // (Optional) เพิ่มการตรวจสอบว่า status ที่ส่งมาถูกต้องหรือไม่
        const allowedStatusUpdates = ['COMPLETED', 'CANCELLED']; // สถานะที่พ่อครัวเปลี่ยนได้
        if (!allowedStatusUpdates.includes(status)) {
             return res.status(400).json({ message: "Invalid status update for cook" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: status },
        });

        res.json({ message: `อัปเดตสถานะออเดอร์ #${orderId} สำเร็จ`, order: updatedOrder });
    } catch (err) {
        console.error("Error updating order status:", err);
        // จัดการกรณีหา Order ไม่เจอ (Prisma error P2025)
        if (err.code === 'P2025') {
             return res.status(404).json({ message: `ไม่พบออเดอร์ ID: ${orderId}` });
        }
        res.status(500).json({ message: "Server Error" });
    }
};