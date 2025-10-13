import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Truck, Store, AlertCircle, ShoppingCart } from "lucide-react";
import { listUserCart } from "../../api/user";
import useEcomStore from "../../store/ecomStore";
import { Link, useNavigate } from "react-router-dom";

// --- Component ย่อยสำหรับแสดงสถานะ Loading (Skeleton) ---
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-10"></div>
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-24 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
      <div className="h-64 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);


const SummaryCard = () => {
  const token = useEcomStore((state) => state.token);
  const user = useEcomStore((state) => state.user);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const shippingCost = deliveryMethod === "delivery" ? 40 : 0;
  const finalTotal = cartTotal + shippingCost;

  const handleGetUserCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUserCart(token);
      setProducts(res.data.products);
      setCartTotal(res.data.cartTotal);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลตะกร้าได้ โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    handleGetUserCart();
  }, [handleGetUserCart]);

  if (isLoading) {
    return <div className="max-w-6xl mx-auto p-8"><SkeletonLoader /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
         <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
         <h3 className="mt-2 text-lg font-medium text-red-600">เกิดข้อผิดพลาด</h3>
         <p className="mt-1 text-gray-500">{error}</p>
         <button onClick={handleGetUserCart} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
           ลองอีกครั้ง
         </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
         <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
         <h3 className="mt-2 text-lg font-medium text-gray-800">ตะกร้าของคุณว่างเปล่า</h3>
         <p className="mt-1 text-gray-500">ดูเหมือนว่าคุณยังไม่ได้เลือกสินค้าใดๆ</p>
         <Link to="/menu" className="mt-6 inline-block px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
           กลับไปเลือกเมนู
         </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        ยืนยันคำสั่งซื้อ
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">วิธีการรับสินค้า</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="relative">
                <input type="radio" name="delivery_option" value="delivery" checked={deliveryMethod === 'delivery'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only peer" />
                <div className="p-5 border rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <Truck size={28} className="text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">จัดส่งถึงที่</h3>
                      <p className="text-sm text-gray-500">ค่าจัดส่ง {shippingCost} บาท</p>
                    </div>
                  </div>
                </div>
                <CheckCircle size={20} className="absolute top-3 right-3 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </label>

              <label className="relative">
                <input type="radio" name="delivery_option" value="table" checked={deliveryMethod === 'table'} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only peer" />
                 <div className="p-5 border rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:shadow-lg transition-all duration-300">
                   <div className="flex items-center gap-4">
                     <Store size={28} className="text-gray-600" />
                     <div>
                       <h3 className="font-semibold text-gray-800">รับที่โต๊ะ</h3>
                       <p className="text-sm text-gray-500">ไม่มีค่าใช้จ่าย</p>
                     </div>
                   </div>
                 </div>
                 <CheckCircle size={20} className="absolute top-3 right-3 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </label>
            </div>
            {deliveryMethod === 'delivery' && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-blue-800">
                <p className="font-semibold">จัดส่งไปที่:</p>
                <p className="text-sm">{user?.name || "สมชาย ทองดี"}</p>
                <p className="text-sm">{user?.address || "123/4 ซอยสุขุมวิท 55 กรุงเทพฯ"}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">รายการสินค้า ({products.length})</h2>
            <div className="divide-y divide-gray-200">
              {products.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    {/* 👇 THIS IS THE FIX 👇 */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">ไม่มีรูป</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.product.title}</p>
                      <p className="text-sm text-gray-500">จำนวน: {item.count}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">{(item.price * item.count).toLocaleString()} ฿</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:sticky top-8 bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-gray-800 text-center">สรุปยอด</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <p>ยอดรวมสินค้า</p>
              <p className="font-medium">{cartTotal.toLocaleString()} ฿</p>
            </div>
            <div className="flex justify-between">
              <p>ค่าจัดส่ง</p>
              <p className="font-medium">{shippingCost.toLocaleString()} ฿</p>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-gray-200 my-4 pt-4">
            <div className="flex justify-between items-center text-gray-900">
              <p className="text-lg font-bold">ยอดสุทธิ</p>
              <p className="text-2xl font-extrabold text-green-600">{finalTotal.toLocaleString()} ฿</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/payment')}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1"
          >
            <CheckCircle size={22} />
            ดำเนินการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;