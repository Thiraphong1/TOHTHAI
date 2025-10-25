const prisma = require('../config/prisma');

// --- User Management (Admin) ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            // ✅ [ปรับปรุง] Select fields ที่จำเป็นทั้งหมด (ยกเว้น password)
            select: { id: true, username: true, name: true, email: true, phone: true, role: true, enabled: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error getting users" });
    }
}

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    // ✅ [ปรับปรุง] ตรวจสอบว่า enabled เป็น boolean จริงๆ
    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "Invalid 'enabled' value. Must be true or false." });
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enabled },
      // ✅ [ปรับปรุง] ไม่ส่ง password กลับไป
      select: { id: true, username: true, role: true, enabled: true }
    });
    res.json({ message: "Update Status Success", user });
  } catch (err) {
    console.error("Error changing status:", err);
    // จัดการกรณีหา User ไม่เจอ
    if (err.code === 'P2025') {
      return res.status(404).json({ message: `User with ID ${req.body.id} not found.` });
    }
    res.status(500).json({ message: "Server Error changing status" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    // ✅ [ปรับปรุง] ตรวจสอบว่า Role ที่ส่งมาถูกต้องตาม Enum
    const validRoles = ['USER', 'ADMIN', 'EMPLOYEE', 'COOK'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified." });
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role },
      select: { id: true, username: true, role: true, enabled: true } // ไม่ส่ง password
    });
    res.json({ message: "Update Role Success", user });
  } catch (err) {
    console.error("Error changing role:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: `User with ID ${req.body.id} not found.` });
    }
    res.status(500).json({ message: "Server Error changing role" });
  }
}

// --- Cart Management (User) ---


exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body; // cart = [{id, count, price, note}, ...]
    const userId = Number(req.user.id);

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
   
      await prisma.cart.deleteMany({ where: { orderedById: userId } });
      return res.json({ ok: true, message: "Cart emptied", cart: null });
    }

    const productIds = cart.map(item => item.id);
    const productsInStock = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, quantity: true, title: true, price: true } 
    });
    
    const productMap = new Map(productsInStock.map(p => [p.id, p]));

    let productsData = [];
    let calculatedCartTotal = 0;
    for (const item of cart) {
      const product = productMap.get(item.id);
      if (!product) {
         return res.status(400).json({ok: false, message: `ไม่พบสินค้า ID: ${item.id}` });
      }
      if (item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `ขออภัย. สินค้า "${product.title}" มีในสต็อกเพียง ${product.quantity} ออเดอร์เท่านั้น`,
        });
      }
      
      const currentPrice = product.price;
      productsData.push({
          productId: item.id,
          count: item.count,
          price: currentPrice,
          note: item.note || null // ✅ [เพิ่ม] บันทึก note จากตะกร้า
      });
      calculatedCartTotal += currentPrice * item.count;
    }

    // ใช้ Upsert: ถ้ามี Cart อยู่แล้วให้อัปเดต, ถ้าไม่มีให้สร้างใหม่
    const savedCart = await prisma.cart.upsert({
      where: { orderedById: userId }, 
      update: { 
        cartTotal: calculatedCartTotal,
        products: {
          deleteMany: {}, 
          create: productsData, // สร้าง CartItem ใหม่พร้อม note
        },
      },
      create: { 
        orderedById: userId,
        cartTotal: calculatedCartTotal,
        products: {
          create: productsData, // สร้าง CartItem ใหม่พร้อม note
        },
      },
      include: { 
        products: { include: { product: { include: { images: true } } } },
        table: true
      }
    });

    res.json({ ok: true, message: "Cart saved successfully", cart: savedCart });

  } catch (err) {
    console.log("Error in userCart:", err);
    res.status(500).json({ message: "Server Error saving cart" });
  }
}


exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { orderedById: Number(req.user.id) },
      include: {
        table: true,
        products: { // products คือ CartItem
          include: {
            product: { // product คือข้อมูลสินค้าจริง
              include: { images: true } 
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({
        products: [],
        cartTotal: 0,
        deliveryMethod: null,
        tableId: null,
        table: null,
      });
    }

    // ส่งข้อมูล cart ทั้งหมดกลับไป (ซึ่ง cart.products จะมี field 'note' อยู่แล้ว)
    res.json(cart);

  } catch (err) {
    console.log("Error in getUserCart:", err);
    res.status(500).json({ message: "Server Error fetching cart" });
  }
}

exports.emptyCart = async (req, res) => {
  try {
    // ใช้ deleteMany โดยตรง ปลอดภัยกว่า findFirst แล้วค่อย delete
    const result = await prisma.cart.deleteMany({
      where: { orderedById: Number(req.user.id) },
    });

    if (result.count === 0) {
      // ไม่ใช่ Error ถ้าไม่มีตะกร้าให้ลบ แค่ไม่มีอะไรเกิดขึ้น
      return res.json({ message: "No active cart found to empty.", deletedCount: 0 });
    }

    res.json({
      message: "Cart Empty Success",
      deletedCount: result.count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error emptying cart" });
  }
}

// --- User Info & Address ---


exports.saveInfo = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        // รับข้อมูลที่อนุญาตให้อัปเดตได้ เช่น name, phone
        const { name, phone, addressLine1, addressLine2, city, postalCode } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                phone,
                addressLine1,
                addressLine2,
                city,
                postalCode
            },
            // Select เฉพาะ field ที่ต้องการส่งกลับไป (ไม่เอา password)
            select: { id: true, username: true, name: true, email: true, phone: true, role: true, enabled: true, addressLine1: true, addressLine2: true, city: true, postalCode: true }
        });
        res.json({ message: "User info updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error saving user info:", error);
        res.status(500).json({ message: "Server error saving info" });
    }
}





exports.updateCartDeliveryOption = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const { deliveryMethod, tableId } = req.body;

        if (!['DELIVERY', 'TABLE'].includes(deliveryMethod)) {
            return res.status(400).json({ message: "Invalid delivery method" });
        }

        const userCart = await prisma.cart.findFirst({ where: { orderedById: userId } });
        if (!userCart) return res.status(404).json({ message: "ไม่พบตะกร้าสินค้า" });

        const dataToUpdate = {
            deliveryMethod: deliveryMethod,
            tableId: deliveryMethod === 'TABLE' ? (tableId ? Number(tableId) : null) : null
        };

        if (deliveryMethod === 'TABLE' && tableId) {
            const tableExists = await prisma.table.findUnique({ where: { id: Number(tableId) } });
            if (!tableExists) return res.status(400).json({ message: `ไม่พบโต๊ะ ID: ${tableId}` });
        }

        const updatedCart = await prisma.cart.update({
            where: { id: userCart.id },
            data: dataToUpdate,
            include: { table: true }
        });

        res.json({ message: "อัปเดตวิธีการรับของสำเร็จ", cart: updatedCart });

    } catch (err) {
        console.error("Error updating cart delivery:", err);
        res.status(500).json({ message: "Server Error updating delivery option" });
    }
};


exports.saveOrder = async (req, res) => {
  try {
    const userId = Number(req.user.id);

    const order = await prisma.$transaction(async (tx) => {
      // 1. ดึง cart (รวม products และ note)
      const userCart = await tx.cart.findFirst({
        where: { orderedById: userId },
        include: { 
            products: true 
        },
      });

      if (!userCart || userCart.products.length === 0) {
        throw new Error("No cart found to create an order.");
      }
      
      // [ปรับปรุงประสิทธิภาพ] ตรวจสอบจำนวนสินค้าใน Query เดียว
      const productIds = userCart.products.map(p => p.productId);
      const productsInStock = await tx.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, quantity: true, title: true }
      });
      const productMap = new Map(productsInStock.map(p => [p.id, p]));

      // ตรวจสอบสต็อก
      for (const item of userCart.products) {
          const product = productMap.get(item.productId);
          if (!product || item.count > product.quantity) {
              throw new Error(`ขออภัย. สินค้า "${product?.title || "บางรายการ"}" หมดสต็อก`);
          }
      }

      // 2. สร้าง order
      const newOrder = await tx.order.create({
        data: {
          products: { 
            create: userCart.products.map((item) => ({
              productId: item.productId,
              count: item.count,
              price: item.price, 
              note: item.note
            })),
          },
          orderedById: userId,
          cartTotal: userCart.cartTotal,
          orderStatus: 'PENDING_CONFIRMATION', 
          deliveryMethod: userCart.deliveryMethod, 
          tableId: userCart.tableId, 
        },
      });

      // 3. ลดจำนวนสินค้าในสต็อก
      const updateStockPromises = userCart.products.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { 
              quantity: { decrement: item.count },
              sold: { increment: item.count }
          },
        })
      );
      await Promise.all(updateStockPromises);

      // 4. ลบ cart
      await tx.cart.delete({ where: { id: userCart.id } });

      return newOrder; 
    });

    res.json({ message: "สร้าง Order สำเร็จ รอการยืนยัน", order }); 

  } catch (err) {
    console.error("Error saving order:", err);
    if (err.message.includes("No cart") || err.message.includes("หมดสต็อก")) {
        return res.status(400).json({ ok: false, message: err.message });
    }
    res.status(500).json({ message: "Server Error saving order" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderedById: Number(req.user.id) },
      orderBy: { createdAt: 'desc' },
      include: {
        table: true, // Include ข้อมูลโต๊ะด้วย
        products: {
          include: {
            product: {
              include: { images: true }
            },
          },
        },
      },
    });

    res.json({ ok: true, orders });
  } catch (err) {
    console.log("Error getting orders:", err);
    res.status(500).json({ message: "Server Error fetching orders" });
  }
}