import React, { useEffect, useState, useMemo, useCallback } from "react";
// ตรวจสอบ Path: ควรมาจาก src/api/admin.js
import { getOrdersAdmin } from "../../api/admin"; 
import useEcomStore from "../../store/EcomStore.jsx"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { th } from "date-fns/locale";
import {
  ShoppingBag,
  CircleDollarSign,
  Search,
  AlertTriangle,
  ClipboardList,
  Calendar, // สำหรับ header group
  DollarSign, // สำหรับแสดงรายรับ
} from "lucide-react";
import { toast } from "react-toastify";

// --- Helper Components ---

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
          <div className="h-4 bg-white/30 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-7 bg-white/30 rounded w-16 animate-pulse"></div>
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

// statusMap (เพิ่มสถานะใหม่)
const statusMap = {
    NOT_PROCESSED: { text: 'ยังไม่ดำเนินการ', color: 'bg-gray-100 text-gray-800' },
    PENDING_CONFIRMATION: { text: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
    PROCESSING: { text: 'กำลังเตรียม', color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { text: 'เสร็จสิ้น', color: 'bg-green-100 text-green-800' },
    CANCELLED: { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
};

// --- Logic สำหรับ Grouping ---

const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "วันนี้";
    if (isYesterday(date)) return "เมื่อวาน";
    return format(date, "EEEE, d MMMM yyyy", { locale: th });
};

// ✅ Logic การจัดกลุ่มและคำนวณรายรับรายวัน
const groupOrdersByDateAndCalculateRevenue = (orders) => {
    return orders.reduce((groups, order) => {
        // ต้องมั่นใจว่า Order object มี field 'createdAt'
        if (!order.createdAt) return groups;

        const dateKey = format(new Date(order.createdAt), 'yyyy-MM-dd');
        
        if (!groups[dateKey]) {
            groups[dateKey] = { orders: [], totalRevenue: 0 };
        }
        groups[dateKey].orders.push(order);
        
        // คำนวณรายรับ: เฉพาะ Order ที่เสร็จสิ้น, รอตรวจสอบ, หรือกำลังเตรียม
        if (['COMPLETED', 'PENDING_CONFIRMATION', 'PROCESSING'].includes(order.orderStatus)) {
            groups[dateKey].totalRevenue += order.cartTotal || 0;
        }

        return groups;
    }, {});
};


const ManageOrder = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrdersAdmin(token);
      // Backend ควรส่งข้อมูล Order พร้อม Include orderedBy มาให้
      const validOrders = res.data?.filter(order => order && order.id && order.createdAt) || [];

      // เรียงลำดับตามเวลาสร้าง (ล่าสุดมาก่อน)
      setOrders(validOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้ โปรดลองอีกครั้ง");
      console.error("Fetch Orders Error:", err);
      toast.error("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if(token) fetchOrders();
  }, [token, fetchOrders]);
  
  // กรองตามคำค้นหา
  const filteredOrders = useMemo(() => {
    if (!search) return orders; 
    const searchTerm = search.toLowerCase();
    return orders.filter(order => {
        const matchesId = String(order.id).includes(searchTerm);
        const matchesUser = order.orderedBy?.username?.toLowerCase().includes(searchTerm);
        return matchesId || matchesUser;
    });
  }, [orders, search]);
  
  // จัดกลุ่มข้อมูลที่ถูกกรองแล้วและคำนวณรายรับรายวัน
  const groupedOrders = useMemo(() => {
      return groupOrdersByDateAndCalculateRevenue(filteredOrders);
  }, [filteredOrders]);


  const summaryData = useMemo(() => {
    if (loading) return { totalOrders: '...' }; 
    return {
        totalOrders: orders.length.toLocaleString(), 
    };
  }, [orders, loading]);


  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <ShoppingBag size={36} className="text-blue-600" />
            <h1 className="text-4xl font-extrabold text-gray-800">จัดการคำสั่งซื้อ</h1>
        </div>

        {/* --- Summary Cards (เหลือ Card เดียว) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1 lg:col-span-1">
                <SummaryCard
                  icon={<ClipboardList size={28} className="text-white" />}
                  title="คำสั่งซื้อทั้งหมด"
                  value={summaryData.totalOrders}
                  color="from-blue-500 to-blue-400"
                  loading={loading}
                />
            </div>
        </div>

        {/* --- Search --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="relative"> 
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาด้วยเลขที่ Order หรือชื่อลูกค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
            </div>
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
            
            {/* Loading/Error/Empty State (จัดการการแสดงผล) */}
            {loading ? <OrderTableSkeleton /> : 
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
             /* Data State (Grouped by Date) */
             <tbody className="bg-white divide-y divide-gray-200">
                {Object.keys(groupedOrders).map(dateKey => (
                    <React.Fragment key={dateKey}>
                        {/* --- Header แสดงวันที่ และยอดรวม --- */}
                        <tr className="bg-gray-200 sticky top-0 shadow-sm border-t border-gray-300">
                            <td colSpan={5} className="px-6 py-3 text-left text-sm font-extrabold text-gray-800 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <Calendar size={18}/>
                                    {formatDateHeader(dateKey)} ({groupedOrders[dateKey].orders.length} ออเดอร์)
                                </span>
                                {/* ✅ แสดงรายรับรวมของวันนั้นๆ */}
                                <span className="text-lg font-extrabold text-green-700 flex items-center gap-1">
                                    <DollarSign size={20} />
                                    ฿{groupedOrders[dateKey].totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </td>
                        </tr>

                        {/* --- Loop แสดง Order ในวันนั้นๆ --- */}
                        {groupedOrders[dateKey].orders.map((order) => {
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
                    </React.Fragment>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;