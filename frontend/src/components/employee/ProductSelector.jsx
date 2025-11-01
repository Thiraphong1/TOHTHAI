import React, { useState, useEffect } from 'react';
import useEcomStore from "../../store/EcomStore.jsx"
import { toast } from 'react-toastify';
import { LoaderCircle, PlusCircle, ImageOff } from 'lucide-react';

const ProductSelector = () => {
  // ดึง State และ Actions จาก Zustand
  const products = useEcomStore((state) => state.products);
  const getProduct = useEcomStore((state) => state.getProduct);
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State สำหรับเก็บคำค้นหา

  useEffect(() => {
    // ดึงข้อมูล Product ทั้งหมดเมื่อ Component โหลด (ถ้ายังไม่มีใน store)
    const loadProducts = async () => {
      if (products.length === 0) {
        setLoading(true);
        try {
          await getProduct(100); // ดึงสินค้ามา 100 รายการ (ปรับได้ตามต้องการ)
        } catch (error) {
          toast.error("ไม่สามารถโหลดรายการสินค้าได้");
        } finally {
          setLoading(false);
        }
      }
    };
    loadProducts();
  }, [getProduct, products.length]); // Dependency array ทำให้โหลดแค่ครั้งแรก

  // กรองสินค้าตามคำค้นหา (ทั้งชื่อและรายละเอียด)
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddToCart = (product) => {
    actionAddtoCart(product);
    toast.success(`เพิ่ม ${product.title} ลงตะกร้าแล้ว`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <LoaderCircle size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">เลือกเมนู</h2>
      {/* ช่องค้นหา */}
      <input
        type="text"
        placeholder="ค้นหาเมนู..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* Grid แสดงรายการสินค้า */}
      {filteredProducts.length === 0 ? (
         <p className="text-center text-gray-500 py-4">ไม่พบเมนูที่ค้นหา</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col justify-between">
                {/* รูปภาพ */}
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                    <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <ImageOff size={40} className="text-gray-400" />
                )}
                </div>
                {/* ข้อมูล */}
                <div className="p-3 text-center">
                <p className="font-semibold text-sm truncate">{product.title}</p>
                <p className="text-orange-600 font-bold text-sm mt-1">{Number(product.price).toLocaleString()} บาท</p>
                </div>
                {/* ปุ่ม Add */}
                <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-green-500 text-white p-2 text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                >
                <PlusCircle size={16} />
                เพิ่ม
                </button>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;