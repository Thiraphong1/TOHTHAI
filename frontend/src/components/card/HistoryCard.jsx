import React, { useState, useEffect } from 'react';
import { getOrders } from '../../api/user';
import useEcomStore from '../../store/ecomStore';
import { format } from 'date-fns';

const HistoryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await getOrders(token);
      if (res.data.ok) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          ประวัติการสั่งซื้อ
        </h2>
        <p className="text-center text-gray-500">คุณยังไม่มีคำสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ประวัติการสั่งซื้อ
      </h2>

      <div className="flex flex-col gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Order ID: #{order.id}</span>
              <span className="text-gray-500 text-sm">
                วันที่: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">สินค้า</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">จำนวน</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">ราคาต่อหน่วย</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.products.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-gray-700">{item.product.title}</td>
                      <td className="px-4 py-2 text-center">{item.count}</td>
                      <td className="px-4 py-2 text-right">{item.price.toLocaleString()} ฿</td>
                      <td className="px-4 py-2 text-right">{(item.price * item.count).toLocaleString()} ฿</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="p-4 border-t border-gray-200 flex justify-end items-center">
              <span className="font-semibold text-gray-800 text-lg">
                รวมทั้งหมด: {order.cartTotal.toLocaleString()} ฿
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryCard;
