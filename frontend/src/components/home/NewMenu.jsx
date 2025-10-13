import React, { useState, useEffect } from 'react';
import { listProductsBy } from '../../api/product';
import ProductCard from '../card/ProductCard';
import { SwiperSlide } from 'swiper/react';
import SwiperMenu from './SwiperMenu';
import { AlertTriangle, ChefHat } from 'lucide-react';

// --- [ใหม่] Skeleton Component สำหรับ Product Card ---
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-300 rounded-full w-1/4"></div>
      </div>
    </div>
  </div>
);


const NewMenu = () => {
  // --- [ปรับปรุง] เพิ่ม State สำหรับ Loading และ Error ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // --- [ปรับปรุง] ใช้ async/await ใน useEffect ---
    const loadNewestProducts = async () => {
      try {
        setLoading(true);
        const res = await listProductsBy("updatedAt", "desc", 7);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load newest products:", err);
        setError("ไม่สามารถโหลดข้อมูลเมนูใหม่ได้");
      } finally {
        setLoading(false);
      }
    };

    loadNewestProducts();
  }, []);

  // --- [ใหม่] จัดการ Error State ---
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertTriangle size={24} />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // --- [ใหม่] จัดการ Empty State (ถ้าไม่มีสินค้าใหม่ ก็ไม่ต้องแสดง Section นี้เลย) ---
  if (!loading && products.length === 0) {
    return null; 
  }

  return (
    // --- [ปรับปรุง] ใช้ title prop ที่เราสร้างไว้ใน SwiperMenu ---
    <SwiperMenu title="เมนูใหม่ล่าสุด"> 
      {loading ? (
        // --- [ใหม่] แสดง Skeleton ขณะโหลด ---
        Array.from({ length: 5 }).map((_, index) => (
          <SwiperSlide key={index}>
            <SkeletonCard />
          </SwiperSlide>
        ))
      ) : (
        // --- แสดงข้อมูลจริงเมื่อโหลดเสร็จ ---
        products.map((item) => (
          <SwiperSlide key={item.id}>
            <ProductCard item={item} />
          </SwiperSlide>
        ))
      )}
    </SwiperMenu>
  );
}

export default NewMenu;