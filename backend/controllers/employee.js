const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

// กำหนด Cloudinary Config ไว้ที่ด้านบน (สมมติว่าคุณมี)
// cloudinary.config({ ... }); 

/**
 * @desc    สร้าง Order โดยพนักงาน (สำหรับลูกค้า Walk-in/ที่โต๊ะ)
 * @route   POST /api/employee/order
 * @access  Private (Employee, Admin)
 */
exports.saveOrderByEmployee = async (req, res) => {
  try {
    // 1. รับข้อมูลจาก request
    const { cart, tableId, paymentSlipBase64 } = req.body;
    const userId = Number(req.user.id);

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "ข้อมูลตะกร้าสินค้าไม่ถูกต้อง" });
    }

    // 3. ใช้ Transaction เพื่อให้แน่ใจว่าทุกขั้นตอนสำเร็จพร้อมกัน
    const order = await prisma.$transaction(async (tx) => {
      
      let paymentSlipUrl = null;
      let orderTableId = tableId ? Number(tableId) : null;
      let deliveryMethod = tableId ? 'TABLE' : 'DELIVERY'; // กำหนดวิธีการรับของ

      // 3.1 [แก้ไข] ตรวจสอบและจัดการสถานะโต๊ะ (ถ้ามีการระบุ tableId)
      if (orderTableId) {
        const table = await tx.table.findUnique({
          where: { id: orderTableId },
        });
        
        if (!table) {
          throw new Error(`ไม่พบโต๊ะหมายเลข ${orderTableId} ในระบบ`);
        }
        
        // ✅ [LOGIC สำคัญ] ถ้าโต๊ะเป็น AVAILABLE ให้ล็อคสถานะเป็น OCCUPIED
        if (table.status === 'AVAILABLE') { 
            await tx.table.update({
              where: { id: orderTableId },
              data: { status: 'OCCUPIED' }, // ล็อคโต๊ะ
            });
        } 
        // ❌ ถ้าเป็น OCCUPIED อยู่แล้ว เราอนุญาตให้สร้าง Order เพิ่มได้ (สั่งเพิ่ม)
      }
      
      // 3.2 อัปโหลดสลิปไปที่ Cloudinary (ถ้ามี)
      if (paymentSlipBase64) {
        // ⚠️ ต้องมี cloudinary config ที่ด้านบนของไฟล์
        const uploadResult = await cloudinary.uploader.upload(paymentSlipBase64, {
          folder: 'payment_slips',
          resource_type: 'auto',
        });
        paymentSlipUrl = uploadResult.secure_url;
      }

      // 3.3 ตรวจสอบสต็อกสินค้า
      const productIds = cart.map(p => p.id);
      const productsInStock = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, quantity: true, title: true, price: true }
      });
      const productMap = new Map(productsInStock.map(p => [p.id, p]));

      let calculatedCartTotal = 0;
      const orderItemsData = [];

      for (const item of cart) {
        const product = productMap.get(item.id);
        
        // ตรวจสอบสต็อก
        if (!product || item.count > product.quantity) {
          // ✅ [แก้ไข] ใช้ "ที่"
          throw new Error(`ขออภัย. สินค้า "${product?.title || 'บางรายการ'}" มีในสต็อกเพียง ${product.quantity} ที่`); 
        }
        
        const currentPrice = product.price; // ใช้ราคาจาก DB
        calculatedCartTotal += currentPrice * (item.count || 1);

        orderItemsData.push({
          productId: item.id,
          count: item.count || 1,
          price: currentPrice,
          note: item.note || null // ✅ [เพิ่ม] บันทึก note
        });
      }

      // 3.4 สร้าง Order ใหม่
      const newOrder = await tx.order.create({
        data: {
          products: { create: orderItemsData },
          orderedById: userId, 
          cartTotal: calculatedCartTotal,
          orderStatus: 'PENDING_CONFIRMATION', 
          paymentSlipUrl: paymentSlipUrl,
          tableId: orderTableId,
          deliveryMethod: deliveryMethod, // บันทึกวิธีรับของ
        },
        include: {
          table: true,
          products: true
        }
      });

      // 3.5 ลดสต็อกสินค้า
      const updateStockPromises = cart.map((item) =>
        tx.product.update({
          where: { id: item.id },
          data: { 
              quantity: { decrement: item.count || 1 },
              sold: { increment: item.count || 1 }
          },
        })
      );
      await Promise.all(updateStockPromises);

      return newOrder;
    });

    res.status(201).json({ message: "สร้าง Order สำเร็จ รอการยืนยัน", order });

  } catch (err) {
    console.error("Error saving employee order:", err);
    // ส่ง Error Message ที่เราสร้างเองกลับไปให้ Frontend
    if (err.message.includes("หมดสต็อก") || err.message.includes("ไม่พบโต๊ะ") || err.message.includes("ไม่ว่างแล้ว") || err.message.includes("ข้อมูลไม่ครบถ้วน")) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    
    // จัดการ Error P2003 (Foreign Key)
    if (err.code === 'P2003') {
        return res.status(400).json({ message: "ข้อมูลอ้างอิงไม่ถูกต้อง (เช่น โต๊ะหรือสินค้าไม่มีอยู่จริง)" });
    }

    res.status(500).json({ message: "Server Error", error: err.message });
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
                table: true,
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