import React, { useEffect } from "react";
import ProductCard from "../components/card/ProductCard";
import useEcomStore from "../store/ecomStore";
import SearchCard from "../components/card/SearchCard";
import CartCard from "../components/card/CartCard";

const Menu = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Search Sidebar */}
      <div className="w-1/4 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800">🔍 ค้นหาเมนู</h2>
        <SearchCard />
      </div>

      {/* Menu Products */}
      <div className="w-2/4">
        <h2 className="text-2xl font-extrabold mb-6 text-gray-800">
          🍽️ เมนูทั้งหมด
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {products.length > 0 ? (
            products.map((item, index) => (
              <ProductCard item={item} key={index} />
            ))
          ) : (
            <p className="text-gray-500">ไม่มีสินค้าในตอนนี้</p>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-1/4">
        <div className="bg-white p-4 rounded-lg shadow-md sticky top-6">
          <CartCard />
        </div>
      </div>
    </div>
  );
};

export default Menu;
