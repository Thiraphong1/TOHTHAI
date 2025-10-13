const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

// --- Cloudinary Configuration ---
// ควรตั้งค่าไว้ที่ส่วนบนสุดของไฟล์
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// --- Shared Prisma Include ---
// สร้าง Object กลางสำหรับ include เพื่อลดการเขียนโค้ดซ้ำซ้อน
const productInclude = {
  images: true,
  category: true,
};


// ------------------------------------
// --- CRUD Operations ---
// ------------------------------------

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } = req.body;

    // Validation: ตรวจสอบข้อมูลเบื้องต้น
    if (!title || !price || !quantity || !categoryId) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images?.map((item) => ({ // ใช้ Optional Chaining เผื่อไม่มี images ส่งมา
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url
          })) || [] // ถ้า images เป็น null ให้เป็น array ว่าง
        }
      },
      include: productInclude,
    });
    res.status(201).json(product); // ใช้ status 201 สำหรับการสร้างสำเร็จ
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างเมนู" });
  }
};


exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id) },
      include: productInclude
    });

    if (!product) {
      return res.status(404).json({ message: "ไม่พบเมนูที่ค้นหา" });
    }
    res.json(product);
  } catch (error) {
    console.error('Error reading product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.update = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { title, description, price, quantity, images, categoryId } = req.body;

    // 1. ค้นหาสินค้าเดิมพร้อมรูปภาพ
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ต้องการอัปเดต" });
    }

    // 2. หา public_id ของรูปภาพเก่าที่ไม่มีอยู่ใน request ใหม่ (รูปที่ถูกลบ)
    const newImagePublicIds = new Set(images.map(img => img.public_id));
    const imagesToDelete = existingProduct.images.filter(
      img => !newImagePublicIds.has(img.public_id)
    );

    // 3. ลบรูปภาพเก่าออกจาก Cloudinary
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(img =>
        cloudinary.uploader.destroy(img.public_id)
      );
      await Promise.all(deletePromises);
    }

    // 4. อัปเดตข้อมูลสินค้าและรูปภาพในครั้งเดียว (ลบของเก่าทั้งหมดแล้วสร้างใหม่)
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          deleteMany: {}, // ลบรูปภาพเก่าที่ผูกกับ Product นี้ทั้งหมด
          create: images.map((item) => ({ // สร้างรูปภาพใหม่ตามที่ส่งมา
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
      include: productInclude,
    });

    res.json({ message: 'อัปเดตเมนูอาหารสำเร็จ', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.remove = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    // ใช้ Transaction เพื่อให้แน่ใจว่าถ้าขั้นตอนใดล้มเหลว จะยกเลิกทั้งหมด
    const result = await prisma.$transaction(async (tx) => {
      // 1. ค้นหาสินค้าและรูปภาพ
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!product) {
        // โยน Error เพื่อให้ transaction rollback
        throw new Error('ไม่พบเมนูอาหารที่ต้องการลบ');
      }

      // 2. ลบรูปภาพทั้งหมดใน Cloudinary
      if (product.images.length > 0) {
        const deletePromises = product.images.map(image =>
          cloudinary.uploader.destroy(image.public_id)
        );
        await Promise.all(deletePromises);
      }
      
      // 3. ลบสินค้าออกจากฐานข้อมูล
      await tx.product.delete({
        where: { id: productId },
      });
      
      return { message: 'ลบเมนูอาหารสำเร็จ' };
    });

    res.json(result);

  } catch (error) {
    console.error('Error removing product:', error);
    if (error.message.includes('ไม่พบเมนูอาหาร')) {
        return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ------------------------------------
// --- Listing & Searching ---
// ------------------------------------

exports.list = async (req, res) => {
  try {
    const count = parseInt(req.params.count);
    if (isNaN(count)) {
      return res.status(400).json({ error: "Count ต้องเป็นตัวเลข" });
    }

    const products = await prisma.product.findMany({
      take: count,
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });
    res.json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.listsall = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });
    res.json(products);
  } catch (error) {
    console.error('Error retrieving all products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.listby = async (req, res) => {
  try {
    const { sort = 'createdAt', order = 'desc', limit = 10 } = req.body;
    const products = await prisma.product.findMany({
      take: parseInt(limit),
      orderBy: { [sort]: order },
      include: productInclude,
    });
    res.json(products);
  } catch (error) {
    console.error('Error listing by order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.searchFilters = async (req, res) => {
  try {
    const { query, price, category } = req.body;
    
    // สร้าง object 'where' แบบ Dynamic
    const where = {};

    if (query) {
      where.title = {
        contains: query,
        mode: 'insensitive', // ค้นหาแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
      };
    }

    if (price && Array.isArray(price) && price.length === 2) {
      where.price = {
        gte: parseFloat(price[0]), // gte = Greater than or equal
        lte: parseFloat(price[1]), // lte = Less than or equal
      };
    }

    if (category && Array.isArray(category) && category.length > 0) {
      where.categoryId = {
        in: category.map(id => parseInt(id)),
      };
    }

    // ค้นหาด้วยเงื่อนไขทั้งหมดในครั้งเดียว
    const products = await prisma.product.findMany({
      where,
      include: productInclude,
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// ------------------------------------
// --- Image Handling ---
// ------------------------------------

exports.images = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'foodmenu',
      resource_type: 'auto',
    });

    res.json({
      asset_id: result.asset_id,
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
};


exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ error: "No public_id provided" });
    }

    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Remove Image Success!!!" });
  } catch (err) {
    console.error("removeImage error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};