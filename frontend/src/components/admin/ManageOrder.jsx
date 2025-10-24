import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getOrdersAdmin } from "../../api/admin"; // ตรวจสอบ Path ให้ถูกต้อง
import useEcomStore from "../../store/ecomStore"; // ตรวจสอบ Path ให้ถูกต้อง
// import { get } from "lodash"; //lodash ไม่ได้ถูกใช้งาน ลบออกได้
import { format, formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  ShoppingBag,
  CircleDollarSign, // ยังคง import ไว้เผื่อใช้ในอนาคต
  Truck, // ยังคง import ไว้เผื่อใช้ในอนาคต
  Search,
  AlertTriangle,
  ClipboardList, // ใช้สำหรับ Summary Card ที่เหลือ
} from "lucide-react";
// ไม่ต้อง import Toastify CSS ถ้าไม่ได้ใช้ toast ในหน้านี้โดยตรง

// --- Helper Components ---

// SummaryCard Component (เหมือนเดิม)
const SummaryCard = ({ icon, title, value, color, loading }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center gap-5 bg-gradient-to-br ${color}`}>
    {loading ? (
      <div className="w-12 h-12 bg-white/30 rounded-full animate-pulse"></div>
    ) : (
      <div className="p-3 bg-white/20 rounded-full">{icon}</div>
    )}
    <div>
      {loading ? (
        <>
          <div className="h-4 bg-white/30 rounded w-24 mb-2"></div>
          <div className="h-7 bg-white/30 rounded w-16"></div>
        </>
      ) : (
        <>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </>
      )}
    </div>
  </div>
);

// OrderTableSkeleton Component (เหมือนเดิม)
const OrderTableSkeleton = () => (
    <tbody>
      {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
          <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
      </tr>
      ))}
    </tbody>
);

// statusMap ยังคงใช้สำหรับแสดงผลในตาราง
const statusMap = {
    NOT_PROCESSED: { text: 'ยังไม่ดำเนินการ', color: 'bg-gray-100 text-gray-800' },
    PENDING_CONFIRMATION: { text: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
    PROCESSING: { text: 'กำลังเตรียม', color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { text: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' },
    CANCELLED: { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
    // เพิ่มสถานะอื่นๆ ตามที่คุณมีใน Enum
};

const ManageOrder = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  // ❌ ลบ state statusFilter ออก
  // const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrdersAdmin(token); // ❗️ ต้องสร้าง API Function นี้ใน src/api/admin.js
      // ✅ [ปรับปรุง] กรองข้อมูล null/undefined ที่อาจทำให้ Error ตอนแสดงผล
      const validOrders = res.data?.filter(order => order && order.id && order.createdAt) || [];
      setOrders(validOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้ โปรดลองอีกครั้ง");
      console.error("Fetch Orders Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if(token) fetchOrders();
  }, [token, fetchOrders]);
  
  // ✅ [แก้ไข] เอา statusFilter ออกจากการกรอง
  const filteredOrders = useMemo(() => {
    if (!search) return orders; // ถ้าไม่มีคำค้นหา แสดงทั้งหมด
    const searchTerm = search.toLowerCase();
    return orders.filter(order => {
        // ค้นหาจาก ID (แปลงเป็น String) หรือ Username (ถ้ามี)
        const matchesId = String(order.id).includes(searchTerm);
        const matchesUser = order.orderedBy?.username?.toLowerCase().includes(searchTerm);
        return matchesId || matchesUser;
    });
  }, [orders, search]);
  
  // ✅ [แก้ไข] คำนวณแค่ totalOrders
  const summaryData = useMemo(() => {
    if (loading) return { totalOrders: '...' }; // แสดง ... ตอนโหลด
    return {
        totalOrders: orders.length.toLocaleString(), // แปลงเป็น string ที่มี comma
    };
  }, [orders, loading]);


  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <ShoppingBag size={36} className="text-blue-600" />
            <h1 className="text-4xl font-extrabold text-gray-800">จัดการคำสั่งซื้อ</h1>
        </div>

        {/* --- Summary Cards --- */}
        {/* ✅ [แก้ไข] เหลือแค่ Card เดียว และปรับ Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1 lg:col-span-1"> {/* กำหนดให้แสดงแค่ 1 card */}
                <SummaryCard
                  icon={<ClipboardList size={28} className="text-white" />}
                  title="คำสั่งซื้อทั้งหมด"
                  value={summaryData.totalOrders}
                  color="from-blue-500 to-blue-400"
                  loading={loading}
                />
            </div>
            {/* ❌ ลบ Card รายรับ และ รอจัดส่ง ออก */}
        </div>

        {/* --- Search --- */}
        {/* ✅ [แก้ไข] เอา Filter ออก เหลือแค่ Search */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="relative"> {/* ไม่ต้องใช้ Grid แล้ว */}
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยเลขที่ Order หรือชื่อลูกค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
            </div>
            {/* ❌ ลบ Select Dropdown ของ Status ออก */}
        </div>
        
        {/* --- Orders Table --- */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ลูกค้า</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ยอดรวม</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่สั่ง</th>
              </tr>
            </thead>
            {/* Loading State */}
            {loading ? <OrderTableSkeleton /> : 
             /* Error State */
             error ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-red-500">
                      <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
                      <p className="font-semibold text-lg">{error}</p>
                      <button onClick={fetchOrders} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">ลองอีกครั้ง</button>
                    </td>
                  </tr>
                </tbody>
             ) : 
             /* Empty State */
             filteredOrders.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                      <p className="font-semibold text-lg">
                        {search ? 'ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา' : 'ยังไม่มีคำสั่งซื้อ'}
                      </p>
                      {search && <p className="text-sm">ลองเปลี่ยนคำค้นหาของคุณ</p>}
                    </td>
                  </tr>
                </tbody>
             ) : (
             /* Data State */
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  // ✅ [ปรับปรุง] เพิ่ม Default ถ้าไม่เจอ status หรือ orderedBy
                  const statusInfo = statusMap[order.orderStatus] || { text: order.orderStatus || 'N/A', color: 'bg-gray-100 text-gray-800' };
                  const username = order.orderedBy?.username || "ไม่ระบุ";
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-green-600">
                          ฿{order.cartTotal?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${statusInfo.color}`}>
                              {statusInfo.text}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" title={format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}>
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: th })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;