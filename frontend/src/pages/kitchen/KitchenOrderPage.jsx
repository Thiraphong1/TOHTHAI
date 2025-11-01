import React, { useState, useEffect, useCallback } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../../api/kitchen'; 
import useEcomStore from "../../store/EcomStore.jsx" 
import { toast } from 'react-toastify';

import { LoaderCircle, CheckSquare, ListOrdered, MessageSquare, Utensils } from 'lucide-react';

const KitchenOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const token = useEcomStore(state => state.token);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getKitchenOrders(token);
      setOrders(res.data);
    } catch (error) {
      toast.error("ไม่สามารถโหลดรายการออเดอร์ได้");
      console.error("Fetch Kitchen Orders Error:", error); // Log error
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders();
      
      // (Optional) ตั้ง Interval ให้ดึงข้อมูลใหม่ทุกๆ 1-2 นาที
      // const intervalId = setInterval(fetchOrders, 120000); // ทุก 2 นาที
      // return () => clearInterval(intervalId); // Clear interval ตอน unmount
    }
  }, [token, fetchOrders]);

  const handleMarkAsCompleted = async (orderId) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(token, orderId, 'COMPLETED');
      toast.success(`ออเดอร์ #${orderId} ทำเสร็จแล้ว`);
      fetchOrders(); // โหลดข้อมูลใหม่
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && orders.length === 0) return (
      <div className="flex justify-center items-center h-screen">
          <LoaderCircle size={48} className="animate-spin text-orange-500" />
      </div>
  );

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <ListOrdered /> รายการออเดอร์ (ครัว)
      </h1>
      {orders.length === 0 && !loading ? (
         <p className="text-center text-gray-500 py-20 text-xl">
           <Utensils size={40} className="mx-auto mb-4 text-gray-400" />
           ไม่มีออเดอร์ที่ต้องทำในขณะนี้
         </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 ${updatingId === order.id ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-900">ออเดอร์ #{order.id}</h2>
                <span className="text-sm font-medium text-gray-600">
                  {/* ✅ [ปรับปรุง] แสดงเวลาที่สั่งให้ชัดเจน */}
                  เวลา: {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3 font-semibold">
                {order.table ? `โต๊ะ ${order.table.number}` : 'สั่งกลับบ้าน'}
              </p>

              {/* รายการอาหาร */}
              <ul className="space-y-3 mb-4 border-t border-gray-200 pt-3">
                {order.products.map(item => (
                  <li key={item.id} className="text-sm">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-800">{item.count} x {item.product.title}</span>
                      <span className="text-gray-800">{(item.price * item.count).toLocaleString()} ฿</span>
                    </div>
                    {/* ✅ 3. [เพิ่ม] แสดง Note ถ้ามี */}
                    {item.note && (
                      <div className="mt-1 flex items-start text-sm text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
                        <MessageSquare size={14} className="flex-shrink-0 mr-2 mt-0.5" />
                        <span><strong>หมายเหตุ:</strong> {item.note}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-3 text-right">
                <button
                  onClick={() => handleMarkAsCompleted(order.id)}
                  disabled={updatingId === order.id}
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
                >
                  {updatingId === order.id ? (
                    <LoaderCircle size={18} className="animate-spin"/>
                  ) : (
                    <CheckSquare size={18} />
                  )}
                  ทำเสร็จแล้ว
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenOrderPage;