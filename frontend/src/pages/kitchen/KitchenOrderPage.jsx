import React, { useState, useEffect, useCallback } from 'react';
import { getKitchenOrders, updateOrderStatus } from '../../api/kitchen';
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { LoaderCircle, CheckSquare, ListOrdered, Utensils } from 'lucide-react';

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

  if (loading && orders.length === 0) return ( // แสดง Loading แค่ตอนโหลดครั้งแรก
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
         <p className="text-center text-gray-500 py-10">ไม่มีออเดอร์ที่ต้องทำในขณะนี้</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 ${updatingId === order.id ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">ออเดอร์ #{order.id}</h2>
                <span className="text-sm text-gray-500">
                  {order.table ? `โต๊ะ ${order.table.number}` : 'กลับบ้าน'}
                </span>
              </div>
              <ul className="space-y-1 mb-4 border-t pt-3">
                {order.products.map(item => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.count} x {item.product.title}</span>
                  </li>
                ))}
              </ul>
              <div className="text-right">
                <button
                  onClick={() => handleMarkAsCompleted(order.id)}
                  disabled={updatingId === order.id}
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
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