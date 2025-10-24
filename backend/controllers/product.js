const prisma = require('../config/prisma');
const cloudinary = require('cloudinary').v2;

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// --- Shared Prisma Include ---
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
          create: images?.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url
          })) || []
        }
      },
      include: productInclude,
    });
    res.status(201).json(product);
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

// ✅ [แก้ไข] ทำให้ฟังก์ชันยืดหยุ่นและปลอดภัยขึ้น
exports.update = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { title, description, price, quantity, images, categoryId } = req.body;

    // 1. สร้าง Object สำหรับเก็บข้อมูลที่จะอัปเดต (ไม่รวมรูปภาพ)
    const dataToUpdate = {
      title,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      categoryId: parseInt(categoryId),
    };

    // 2. ✅ ตรวจสอบว่ามีการส่ง 'images' array มาด้วยหรือไม่
    if (Array.isArray(images)) {
      // ถ้ามี 'images' ส่งมา ให้ทำ Logic การจัดการรูปภาพ
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!existingProduct) {
        return res.status(404).json({ message: "ไม่พบสินค้าที่จะอัปเดต" });
      }

      const newImagePublicIds = new Set(images.map(img => img.public_id));
      const imagesToDelete = existingProduct.images.filter(
        img => !newImagePublicIds.has(img.public_id)
      );

      if (imagesToDelete.length > 0) {
        const deletePromises = imagesToDelete.map(img =>
          cloudinary.uploader.destroy(img.public_id)
        );
        await Promise.all(deletePromises);
      }

      // เพิ่มข้อมูลรูปภาพเข้าไปใน Object ที่จะอัปเดต
      dataToUpdate.images = {
        deleteMany: {},
        create: images.map((item) => ({
          asset_id: item.asset_id,
          public_id: item.public_id,
          url: item.url,
          secure_url: item.secure_url,
        })),
      };
    }

    // 3. อัปเดตข้อมูลทั้งหมดในครั้งเดียว
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
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

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!product) {
        throw new Error('ไม่พบเมนูอาหารที่ต้องการลบ');
      }

      if (product.images.length > 0) {
        const deletePromises = product.images.map(image =>
          cloudinary.uploader.destroy(image.public_id)
        );
        await Promise.all(deletePromises);
      }
      
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

// ✅ [ปรับปรุง] เปลี่ยนมาใช้ req.query.limit ซึ่งเป็นมาตรฐานสากล
exports.list = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 100); // รับค่าจาก query string และใส่ค่า default

    const products = await prisma.product.findMany({
      take: limit,
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

// ✅ [ปรับปรุง] เปลี่ยนมาใช้ req.query ซึ่งเป็นมาตรฐานสากลสำหรับ GET request
exports.listby = async (req, res) => {
  try {
    const { sort = 'createdAt', order = 'desc', limit = 10 } = req.query; // รับค่าจาก query string
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
    
    const where = {};

    if (query) {
      where.title = {
        contains: query,
        mode: 'insensitive',
      };
    }

    if (price && Array.isArray(price) && price.length === 2) {
      where.price = {
        gte: parseFloat(price[0]),
        lte: parseFloat(price[1]),
      };
    }

    if (category && Array.isArray(category) && category.length > 0) {
      where.categoryId = {
        in: category.map(id => parseInt(id)),
      };
    }

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