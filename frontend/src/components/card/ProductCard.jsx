import React from "react";
import { ShoppingCart } from "lucide-react"; // ไอคอนตะกร้าสินค้า
import useEcomStore from "../../store/EcomStore.jsx"

const ProductCard = ({ item }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

  return (
    <div className="
      relative 
      w-full 
      bg-white 
      border border-gray-200 
      rounded-xl 
      shadow-lg 
      p-4 
      flex flex-col 
      justify-between 
      overflow-hidden
      group 
      hover:shadow-xl 
      hover:border-indigo-300 
      transition-all duration-300 ease-in-out
    ">
      {/* ส่วนรูปภาพสินค้า */}
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="
              w-full h-full 
              object-cover 
              transform 
              group-hover:scale-105 
              transition-transform duration-500 ease-in-out
            "
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm animate-pulse">
            ไม่มีรูปภาพสินค้า
          </div>
        )}
      </div>

      {/* ส่วนรายละเอียดสินค้า */}
      <div className="flex-1 mb-4">
        <h3 className="text-xl font-bold text-gray-800 truncate leading-tight mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 leading-snug">
          {item.description}
        </p>
      </div>

      {/* ส่วนราคาและปุ่ม "เพิ่มลงตะกร้า" */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-2xl font-extrabold text-indigo-700">
          {item.price} ฿
        </span>
        <button 
          onClick={() => actionAddtoCart(item)}
          className="
            flex items-center justify-center 
            px-4 py-2 
            bg-indigo-600 
            text-white 
            text-sm font-semibold 
            rounded-full 
            shadow-md 
            hover:bg-indigo-700 
            hover:shadow-lg 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 
            transition-all duration-300 ease-in-out 
            transform hover:-translate-y-0.5
          "
        >
          <ShoppingCart size={20} className="mr-2" />
          เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
};

export default ProductCard;