const prisma = require('../config/prisma');
const formatDateKey = (date) => {
    // แปลงเป็น ISO String แล้วตัดเอาเฉพาะวันที่ (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
};

exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        // ✅ ดึงข้อมูลลูกค้า: เอาแค่ username (เพื่อแสดงในตาราง)
        orderedBy: {
          select: { username: true, email: true, phone: true }
        },
        // ✅ ดึงข้อมูล OrderItem (เพื่อใช้ในการตรวจสอบรายละเอียด/Note ในอนาคต)
        products: {
            include: {
                product: {
                    select: { title: true } // ดึงเฉพาะชื่อสินค้า
                }
            }
        },
      },
    });

    // ✅ [คำนวณ] เพิ่ม orderDateKey และ isRevenue (สำหรับ Grouping และ Summary ใน Frontend)
    const ordersWithProcessedData = orders.map(order => {
        // 1. สร้าง Date Key
        const dateKey = formatDateKey(order.createdAt);
        
        // 2. กำหนด Logic สำหรับนับเป็นรายรับ (สมมติ: นับทุกสถานะที่ไม่ได้ถูกยกเลิก)
        const isRevenueStatus = ['COMPLETED', 'PENDING_CONFIRMATION', 'PROCESSING'].includes(order.orderStatus);

        return {
            ...order,
            // เพิ่ม field สำหรับ Grouping และ Summary
            orderDateKey: dateKey,
            isRevenue: isRevenueStatus, // ใช้สำหรับคำนวณรายรับใน Frontend
        };
    });

    res.json(ordersWithProcessedData);
    
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    res.status(500).json({ message: "Server Error fetching orders" });
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
// Admin ดูการจองทั้งหมด
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { reservationTime: 'desc' },
      include: { reservedBy: { select: { username: true } }, table: true }
    });
    res.json(reservations);
  } catch (err) { res.status(500).json({ message: "Server Error" }); }
};

// Admin อัปเดตสถานะการจอง (ยืนยัน/ยกเลิก)
exports.updateReservationStatus = async (req, res) => {
    try {
        const reservationId = Number(req.params.id);
        const { status } = req.body; // รับ 'CONFIRMED' หรือ 'CANCELLED'

        const updatedReservation = await prisma.$transaction(async (tx) => {
            
            // 1. ดึงข้อมูลการจองปัจจุบัน
            const reservation = await tx.reservation.findUnique({
                where: { id: reservationId },
                select: { tableId: true } // ต้องมี tableId
            });

            if (!reservation) {
                throw new Error("ไม่พบรายการจองที่ต้องการอัปเดต");
            }

            // 2. อัปเดตสถานะการจอง
            const newReservation = await tx.reservation.update({
                where: { id: reservationId },
                data: { status: status },
                include: { table: true }
            });

            // 3. ✅ [NEW LOGIC] จัดการสถานะ Table (เฉพาะตอนยืนยัน/ยกเลิก)
            if (newReservation.tableId) {
                let newTableStatus = null;
                
                if (status === 'CONFIRMED') {
                    // ถ้า Admin ยืนยัน -> ล็อกสถานะโต๊ะ ณ ปัจจุบันเป็น OCCUPIED
                    newTableStatus = 'OCCUPIED';
                } else if (status === 'CANCELLED') {
                    // ถ้า Admin ยกเลิก -> ปลดล็อกสถานะโต๊ะกลับเป็น AVAILABLE
                    newTableStatus = 'AVAILABLE';
                }

                if (newTableStatus) {
                    await tx.table.update({
                        where: { id: newReservation.tableId },
                        data: { status: newTableStatus },
                    });
                }
            }

            return newReservation;
        });

        res.json({ message: 'อัปเดตสถานะการจองสำเร็จ', reservation: updatedReservation });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        // ... (จัดการ Error เหมือนเดิม) ...
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getDashboardSummaryToday = async (req, res) => {
    try {
        // --- คำนวณวันที่เริ่มต้นและสิ้นสุดของวันนี้ ---
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // เที่ยงคืนของวันนี้

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // สิ้นสุดวันของวันนี้

        // --- Query ข้อมูล Order ของวันนี้ ---
        const ordersToday = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: todayStart, // มากกว่าหรือเท่ากับ เที่ยงคืน
                    lte: todayEnd,   // น้อยกว่าหรือเท่ากับ สิ้นสุดวัน
                },
                // (Optional) อาจจะกรองเฉพาะสถานะที่นับเป็นรายรับ
                // orderStatus: { in: ['COMPLETED', 'PROCESSING'] }
            },
            select: {
                cartTotal: true,
                orderStatus: true // ดึงสถานะมาด้วยเผื่อใช้คำนวณรายรับ
            }
        });

        // --- คำนวณค่าสรุป ---
        let totalRevenueToday = 0;
        const totalOrdersToday = ordersToday.length;

        // คำนวณรายรับเฉพาะ Order ที่เสร็จสิ้นแล้ว (สมมติ)
        ordersToday.forEach(order => {
            if (order.orderStatus === 'COMPLETED') { // หรือสถานะอื่นๆ ที่นับเป็นรายรับ
                totalRevenueToday += order.cartTotal;
            }
        });

        // --- ส่งข้อมูลกลับไป ---
        res.json({
            totalRevenueToday: totalRevenueToday,
            totalOrdersToday: totalOrdersToday
        });

    } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getOrderTypeStatsToday = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const stats = await prisma.order.groupBy({
            by: ['deliveryMethod'], // จัดกลุ่มตามวิธีจัดส่ง
            where: {
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                // (Optional) อาจจะกรองสถานะที่ไม่ต้องการนับออก
                // orderStatus: { notIn: ['CANCELLED'] }
            },
            _count: { // นับจำนวน
                id: true,
            },
        });

        // แปลงข้อมูลให้ Frontend ใช้งานง่าย
        const formattedStats = {
            labels: [], // ชื่อประเภท (e.g., 'จัดส่ง', 'รับที่โต๊ะ')
            data: [],   // จำนวนออเดอร์
        };
        stats.forEach(item => {
            let label = 'ไม่ระบุ';
            if (item.deliveryMethod === 'DELIVERY') label = 'จัดส่งถึงที่';
            else if (item.deliveryMethod === 'TABLE') label = 'รับที่โต๊ะ';
            formattedStats.labels.push(label);
            formattedStats.data.push(item._count.id);
        });

        res.json(formattedStats);

    } catch (err) {
        console.error("Error fetching order type stats:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getTopSellingProducts = async (req, res) => {
    try {
        const period = req.query.period || 'week'; // 'week' or 'month'
        const limit = parseInt(req.query.limit || 5);

        // คำนวณวันที่เริ่มต้น
        const startDate = new Date();
        if (period === 'month') {
            startDate.setDate(1); // วันแรกของเดือนนี้
        } else { // 'week' (เริ่มวันอาทิตย์)
            const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday,...
            startDate.setDate(startDate.getDate() - dayOfWeek);
        }
        startDate.setHours(0, 0, 0, 0); // เริ่มต้นของวัน

        const endDate = new Date(); // วันนี้

        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: { // กรอง Order ตามช่วงเวลาและสถานะ
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    orderStatus: { in: ['COMPLETED', 'PROCESSING', 'PENDING_CONFIRMATION'] } // นับเฉพาะ Order ที่สำเร็จ/กำลังดำเนินการ
                }
            },
            _sum: { // รวมจำนวนที่สั่ง (count)
                count: true,
            },
            orderBy: { // เรียงตามยอดรวมจำนวน
                _sum: {
                    count: 'desc',
                },
            },
            take: limit, // เอาแค่อันดับตามที่กำหนด
        });

        // ดึงชื่อสินค้ามาเพิ่ม
        const productIds = topProducts.map(p => p.productId);
        const productsInfo = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true }
        });
        const productInfoMap = new Map(productsInfo.map(p => [p.id, p.title]));

        // แปลงข้อมูลให้ Frontend ใช้งานง่าย
        const formattedStats = {
            labels: [], // ชื่อเมนู
            data: [],   // จำนวนที่ขายได้
        };
        topProducts.forEach(item => {
            formattedStats.labels.push(productInfoMap.get(item.productId) || `Product ${item.productId}`);
            formattedStats.data.push(item._sum.count || 0);
        });

        res.json(formattedStats);

    } catch (err) {
        console.error("Error fetching top selling products:", err);
        res.status(500).json({ message: "Server Error" });
    }
};