import React from "react";

import { Trash2, CreditCard, Plus, Minus, ShoppingCart, ImageOff, MessageSquare } from "lucide-react";
import useEcomStore from "../../store/EcomStore.jsx"
import { Link } from "react-router-dom";

const CartCard = () => {
  const carts = useEcomStore((state) => state.carts);
  const inc = useEcomStore((s) => s.actionIncCart);
  const dec = useEcomStore((s) => s.actionDecCart);
  const remove = useEcomStore((s) => s.actionRemoveFromCart);

  const updateNote = useEcomStore((s) => s.actionUpdateCartItemNote);

  const total = carts.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.count ?? 1),
    0
  );

  // --- ✨ [ปรับปรุง] จัดการสถานะเมื่อตะกร้าว่าง ---
  if (carts.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-16 px-4">
        <ShoppingCart size={64} className="mx-auto text-gray-300" />
        <h1 className="mt-6 text-2xl font-bold text-gray-700">ตะกร้าของคุณว่างเปล่า</h1>
        <p className="mt-2 text-gray-500">
          ลองเลือกเมนูอร่อยๆ เพิ่มลงตะกร้าสิ!
        </p>
        <Link to="/menu"> 
          <button className="mt-8 bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-orange-700 transition-transform transform hover:scale-105">
            กลับไปเลือกเมนู
          </button>
        </Link>
      </div>
    );
  }

  // --- แสดงผลเมื่อมีสินค้าในตะกร้า ---
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">ตะกร้าเมนูของคุณ</h1>
        <div className="flex items-center gap-2 text-gray-500">
          <ShoppingCart size={20} />
          <span>{carts.length} รายการ</span>
        </div>
      </div>

      {/* --- รายการสินค้า --- */}
      <div className="space-y-6">
        {carts.map((item) => (

          <div key={item.id} className="border-b last:border-b-0 pb-6">
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Left: Image & Info */}
              <div className="flex items-start gap-4 w-full"> {/* เปลี่ยนเป็น items-start */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-lg text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <p className="text-blue-600 font-bold mt-1 text-md">
                    {item.price ? `${Number(item.price).toLocaleString()} บาท` : "0 บาท"}
                  </p>
                </div>
              </div>


              <div className="flex items-center gap-4 ml-auto sm:ml-0 flex-shrink-0 self-center sm:self-auto">
                <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                  <button
                    onClick={() => dec(item.id)}
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    <Minus size={16} className="text-gray-600" />
                  </button>
                  <span className="font-bold text-gray-800 w-8 text-center">{item.count ?? 1}</span>
                  <button
                    onClick={() => inc(item.id)}
                    className="p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    <Plus size={16} className="text-gray-600" />
                  </button>
                </div>

                <button
                  onClick={() => remove(item.id)}
                  className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="mt-3 ml-0 sm:ml-[calc(6rem+1rem)]"> {/* 6rem = w-24, 1rem = gap-4 */}
                <label htmlFor={`note-${item.id}`} className="sr-only">หมายเหตุสำหรับ {item.title}</label>
                <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input
                        type="text"
                        id={`note-${item.id}`}
                        placeholder="เพิ่มหมายเหตุ (เช่น ไม่ใส่ผักชี, หวานน้อย)"
                        value={item.note || ''} 
                        onChange={(e) => updateNote(item.id, e.target.value)}
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    />
                </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* --- ส่วนสรุปยอด --- */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600">ยอดรวม (ยังไม่รวมค่าส่ง)</p>
          <p className="text-xl font-semibold text-gray-800">
            {total.toLocaleString()} บาท
          </p>
        </div>
        <Link to="/cart"> 
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold px-5 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            <CreditCard size={20} />
            ดำเนินการชำระเงิน
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CartCard;