import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getOrdersAdmin } from "../../api/admin";
import useEcomStore from "../../store/ecomStore";
import { get } from "lodash";
import { format, formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import {
  ShoppingBag,
  CircleDollarSign,
  Truck,
  Search,
  AlertTriangle,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

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

const statusMap = {
    pending: { text: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
    paid: { text: 'จ่ายแล้ว', color: 'bg-blue-100 text-blue-800' },
    shipped: { text: 'จัดส่งแล้ว', color: 'bg-green-100 text-green-800' },
    cancelled: { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
};

const ManageOrder = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrdersAdmin(token);
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if(token) fetchOrders();
  }, [token, fetchOrders]);
  
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const matchesSearch = search && order.id && order.orderedBy?.username ? 
            String(order.id).toLowerCase().includes(search.toLowerCase()) || order.orderedBy?.username.toLowerCase().includes(search.toLowerCase()) 
            : true;
        const matchesStatus = statusFilter !== 'all' ? order.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);
  
  const summaryData = useMemo(() => {
    if (!orders) return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
    return {
        totalOrders: orders.length,
        totalRevenue: orders.filter(o => o.status === 'paid' || o.status === 'shipped').reduce((sum, o) => sum + o.cartTotal, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
    };
  }, [orders]);


  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <ShoppingBag size={36} className="text-blue-600" />
            <h1 className="text-4xl font-extrabold text-gray-800">จัดการคำสั่งซื้อ</h1>
        </div>

        {/* --- Summary Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SummaryCard 
                icon={<CircleDollarSign size={28} className="text-white" />}
                title="รายรับทั้งหมด"
                value={loading ? '...' : `฿${summaryData.totalRevenue.toLocaleString()}`}
                color="from-green-500 to-green-400"
                loading={loading}
            />
            <SummaryCard 
                icon={<ClipboardList size={28} className="text-white" />}
                title="คำสั่งซื้อทั้งหมด"
                value={loading ? '...' : summaryData.totalOrders.toLocaleString()}
                color="from-blue-500 to-blue-400"
                loading={loading}
            />
            <SummaryCard 
                icon={<Truck size={28} className="text-white" />}
                title="รอจัดส่ง"
                value={loading ? '...' : summaryData.pendingOrders.toLocaleString()}
                color="from-yellow-500 to-yellow-400"
                loading={loading}
            />
        </div>

        {/* --- Filter and Search --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="ค้นหาด้วยเลขที่ Order หรือชื่อลูกค้า..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </div>
                <div className="relative">
                    <Truck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    >
                        <option value="all">สถานะทั้งหมด</option>
                        {Object.entries(statusMap).map(([key, value]) => (
                            <option key={key} value={key}>{value.text}</option>
                        ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
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
            {loading ? <OrderTableSkeleton /> : error ? (
                 <tbody>
                    <tr>
                    <td colSpan={5} className="py-16 text-center text-red-500">
                        <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
                        <p className="font-semibold text-lg">{error}</p>
                    </td>
                    </tr>
                </tbody>
            ) : filteredOrders.length === 0 ? (
                <tbody>
                    <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                        <ShoppingBag className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                        <p className="font-semibold text-lg">ไม่พบคำสั่งซื้อ</p>
                        <p className="text-sm">ลองเปลี่ยนเงื่อนไขการค้นหาหรือ Filter</p>
                    </td>
                    </tr>
                </tbody>
            ) : (
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      #{String(order.id).substring(0, 8)}{String(order.id).length > 8 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderedBy?.username || "ไม่ระบุ"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-green-600">
                        ฿{order.cartTotal?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusMap[order.status]?.text || order.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" title={format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}>
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: th })}
                    </td>
                  </tr>
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