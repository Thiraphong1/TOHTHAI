const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

/**
 * @desc    สร้าง Order โดยพนักงาน (พร้อมแนบสลิป)
 * @route   POST /api/employee/order
 * @access  Private (Employee, Admin)
 */
exports.saveOrderByEmployee = async (req, res) => {
  try {
    // 1. รับข้อมูลจาก request
    const { cart, tableId, paymentSlipBase64 } = req.body;
    const userId = Number(req.user.id); // id ของพนักงานที่ login อยู่

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!cart || cart.length === 0 || !paymentSlipBase64) {
      return res.status(400).json({ message: "ข้อมูลตะกร้าสินค้าหรือสลิปการชำระเงินไม่ครบถ้วน" });
    }

    // 3. ✅ ใช้ Transaction เพื่อให้ทุกขั้นตอนสำเร็จพร้อมกัน หรือล้มเหลวทั้งหมด
    const order = await prisma.$transaction(async (tx) => {
      // 3.1 อัปโหลดสลิปไปที่ Cloudinary
      const uploadResult = await cloudinary.uploader.upload(paymentSlipBase64, {
        folder: 'payment_slips',
        resource_type: 'auto',
      });

      // 3.2 ตรวจสอบสต็อกสินค้า (แบบมีประสิทธิภาพ)
      const productIds = cart.map(p => p.id);
      const productsInStock = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, quantity: true, title: true }
      });
      const productMap = new Map(productsInStock.map(p => [p.id, p]));

      for (const item of cart) {
        const product = productMap.get(item.id);
        if (!product || item.count > product.quantity) {
          throw new Error(`ขออภัย. สินค้า "${product?.title || 'บางรายการ'}" หมดสต็อก`);
        }
      }

      // 3.3 คำนวณยอดรวมและเตรียมข้อมูล
      const cartTotal = cart.reduce((sum, item) => sum + item.price * item.count, 0);
      const orderItems = cart.map(item => ({
        productId: item.id,
        count: item.count,
        price: item.price
      }));

      // 3.4 สร้าง Order ใหม่
      const newOrder = await tx.order.create({
        data: {
          products: { create: orderItems },
          orderedById: userId, // บันทึกว่าเป็นพนักงานคนไหนที่สร้าง Order
          cartTotal,
          orderStatus: 'PENDING_CONFIRMATION', // สถานะ: รอการยืนยัน
          paymentSlipUrl: uploadResult.secure_url, // URL ของสลิป
          tableId: tableId ? Number(tableId) : null, // ถ้ามี tableId ก็บันทึก
        },
      });

      // 3.5 ลดสต็อกสินค้า
      const updateStockPromises = cart.map((item) =>
        tx.product.update({
          where: { id: item.id },
          data: { quantity: { decrement: item.count } },
        })
      );
      await Promise.all(updateStockPromises);

      return newOrder;
    });

    res.status(201).json({ message: "สร้าง Order สำเร็จ รอการยืนยันจาก Admin", order });

  } catch (err) {
    console.error("Error saving employee order:", err);
    if (err.message.includes("หมดสต็อก")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    ดึงประวัติการสั่งซื้อที่สร้างโดยพนักงานคนนั้นๆ
 * @route   GET /api/employee/orders
 * @access  Private (Employee, Admin)
 */
exports.getEmployeeOrders = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const orders = await prisma.order.findMany({
            where: { orderedById: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                products: {
                    include: {
                        product: {
                            select: { title: true, images: { take: 1 } }
                        }
                    }
                }
            }
        });
        res.json(orders);
    } catch (err) {
        console.error("Error fetching employee orders:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
