import React, { useState } from "react";
import useEcomStore from "../../store/ecomStore";
import { CheckCircle, ArrowLeft, Loader2, ShoppingCart, ImageOff, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createUserCart } from "../../api/user";
import { toast} from 'react-toastify';
import { useNavigate } from "react-router-dom";

const ListCard = () => {
  const cart = useEcomStore((state) => state.carts);
  const user = useEcomStore((state) => state.user);
  const token = useEcomStore((state) => state.token);
  const clearCart = useEcomStore((state) => state.clearCart);
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCart = async () => {
    setIsSaving(true);

    const cartData = cart.map((item) => ({
      id: item.id,
      count: item.count || 1,
      price: item.price,
      note: item.note || null, // ส่ง note ไปด้วย
    }));

    console.log("Cart data to be sent:", cartData); // ตรวจสอบข้อมูลที่จะส่ง

    try {
      const response = await createUserCart(token, { cart: cartData });
      console.log('Cart data saved:', response);
      toast.success('บันทึกตะกร้าสินค้าเรียบร้อยแล้ว!');
      clearCart();
      navigate('/checkout'); 
    } catch (error) {
      console.error('Error saving cart data:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกตะกร้า โปรดลองอีกครั้ง';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.count || 1),
    0
  );

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
        <CheckCircle className="text-green-500" size={32} /> สรุปรายการสั่งซื้อของคุณ
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          {/* ... ส่วนตะกร้าว่าง (เหมือนเดิม) ... */}
          <p className="text-gray-600 text-lg mb-6">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            กลับไปเลือกเมนู
          </Link>
        </div>
      ) : (
        <>
          {/* รายการสินค้า */}
          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {cart.map((item, index) => (
              <div
                key={index} // ถ้า item.id ซ้ำกันไม่ได้ ให้ใช้ index แต่ถ้า id unique ควรใช้ item.id
                className="flex flex-col sm:flex-row items-start justify-between py-5 px-4 hover:bg-gray-50 transition-all duration-200 rounded-lg"
              >
                {/* ซ้าย: รูป + ข้อมูลสินค้า */}
                <div className="flex items-start gap-4 flex-grow mb-3 sm:mb-0">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-gray-200">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].secure_url || item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-800 leading-tight">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {/* ✅ 3. [เพิ่ม] แสดง note ถ้ามี */}
                    {item.note && (
                      <div className="mt-2 flex items-start text-sm text-blue-600 bg-blue-50 p-2 rounded-md">
                        <MessageSquare size={14} className="flex-shrink-0 mr-2 mt-0.5" />
                        <span><strong>หมายเหตุ:</strong> {item.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ขวา: จำนวน + ราคา */}
                <div className="text-right flex flex-col sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pl-0 sm:pl-4">
                  <p className="text-gray-600 font-medium text-base mb-1">จำนวน: x{item.count || 1}</p>
                  <p className="text-green-600 font-extrabold text-xl">
                    {(item.price * (item.count || 1)).toLocaleString()} ฿
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ยอดรวม */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-green-50 p-4 rounded-xl shadow-inner">
            <span className="text-xl font-bold text-gray-800 mb-3 sm:mb-0">ยอดรวมทั้งหมด:</span>
            <span className="text-4xl font-extrabold text-green-700 animate-pulse-slight">
              {total.toLocaleString()} ฿
            </span>
          </div>

          {/* ปุ่มยืนยัน + ปุ่มแก้ไข */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/menu"
              className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-7 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 shadow-md text-lg"
            >
              <ArrowLeft size={22} />
              แก้ไขคำสั่งซื้อ
            </Link>
            {user ? (
              <button
                onClick={handleSaveCart}
                disabled={isSaving || cart.length === 0}
                className={`flex items-center justify-center gap-2 px-7 py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-md
                  ${isSaving || cart.length === 0
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:-translate-y-0.5'
                  }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} />
                    ยืนยันการสั่งซื้อ
                  </>
                )}
              </button>
            ) : (
              <Link to="/login">
                <button
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
                >
                  <CheckCircle size={22} />
                  เข้าสู่ระบบเพื่อยืนยัน
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ListCard;