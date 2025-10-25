import React, { useEffect, useState, useCallback } from "react";
import { getAllReservations, updateReservationStatus } from "../../api/admin"; 
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { LoaderCircle, Check, X, Users, CalendarDays, Clock, AlertTriangle } from 'lucide-react'; 
import { format, formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale"; // สำหรับแสดงผลภาษาไทย

// Map สำหรับ Role Icons และ Text (ใช้ในการแสดงชื่อผู้จอง)
const statusConfig = {
    PENDING: { style: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} className="mr-1 inline"/>, text: "รออนุมัติ" },
    CONFIRMED: { style: "bg-green-100 text-green-800", icon: <Check size={14} className="mr-1 inline"/>, text: "อนุมัติแล้ว" },
    CANCELLED: { style: "bg-red-100 text-red-800", icon: <X size={14} className="mr-1 inline"/>, text: "ยกเลิก" },
    DEFAULT: { style: "bg-gray-100 text-gray-800", icon: <AlertTriangle size={14} className="mr-1 inline"/>, text: "ไม่ระบุ" },
};

// --- Skeleton Component ---
const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded-lg w-full"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded-lg w-28"></div></td>
      </tr>
    ))}
  </tbody>
);


const FromTable = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const token = useEcomStore(state => state.token);

  // --- Fetch Reservations ---
  const fetchReservations = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await getAllReservations(token); 
      
      // เรียงลำดับตามเวลาที่สร้าง (createdAt) จากล่าสุดไปเก่า
      const sortedData = res.data?.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) || [];
      
      setReservations(sortedData);
    } catch (err) {
      console.error("Fetch Reservations Error:", err);
      toast.error("ไม่สามารถโหลดข้อมูลการจองได้");
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [token, fetchReservations]);

  // --- Handle Update Status (CONFIRMED/CANCELLED) ---
  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'CONFIRMED' ? 'ยืนยัน' : 'ยกเลิก';

    const result = await Swal.fire({
      title: `คุณแน่ใจจะ${actionText}การจองนี้?`,
      text: `สถานะจะเปลี่ยนเป็น ${statusConfig[status].text}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === 'CONFIRMED' ? "#10b981" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `ใช่, ${actionText}`,
      cancelButtonText: "ไม่, เก็บไว้ก่อน",
    });

    if (result.isConfirmed) {
      setUpdatingId(id);
      try {
        await updateReservationStatus(token, id, status);
        toast.success(`${actionText}การจอง #${id} เรียบร้อยแล้ว`);
        fetchReservations(); // Refresh data
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <CalendarDays /> จัดการการจองโต๊ะ
      </h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่/เวลาจอง</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">โต๊ะ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ผู้จอง</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จำนวนแขก</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          
          {loading ? <TableSkeleton /> : 
           error ? (
                <tbody>
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-red-500">
                      <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
                      <p className="font-semibold text-lg">{error}</p>
                      <button onClick={fetchReservations} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">ลองใหม่</button>
                    </td>
                  </tr>
                </tbody>
           ) :
           reservations.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      <Users size={48} className="mx-auto mb-2 text-gray-400" />
                      <p className="font-semibold text-lg">ยังไม่มีรายการจอง</p>
                    </td>
                  </tr>
                </tbody>
           ) : (
             <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map(res => {
                const currentStatusConfig = statusConfig[res.status] || statusConfig.DEFAULT;
                const isUpdating = updatingId === res.id;

                return (
                  <tr key={res.id} className={`${isUpdating ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.id}</td>
                    {/* ✅ แก้ไข Timezone และ Format */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(res.reservationTime).toLocaleString('th-TH', {
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute: '2-digit',
                        timeZone: 'Asia/Bangkok'
                      })}
                      <p className="text-xs text-gray-400 mt-1" title={format(new Date(res.createdAt), "dd/MM/yyyy HH:mm")}>
                          (สร้างเมื่อ: {formatDistanceToNow(new Date(res.createdAt), { addSuffix: true, locale: th })})
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{res.table?.number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{res.reservedBy?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">{res.numberOfGuests}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${currentStatusConfig.style}`}>
                        {currentStatusConfig.icon} {currentStatusConfig.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      {/* แสดงปุ่มจัดการเฉพาะเมื่อสถานะเป็น PENDING */}
                      {res.status === 'PENDING' && (
                        <div className="flex gap-2 justify-center items-center">
                          {isUpdating ? (
                            <LoaderCircle size={20} className="animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')} title="ยืนยัน" className="p-1 text-green-600 hover:text-green-900 rounded-full hover:bg-green-100 transition"><Check size={20}/></button>
                              <button onClick={() => handleUpdateStatus(res.id, 'CANCELLED')} title="ยกเลิก" className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-100 transition"><X size={20}/></button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            }
            </tbody>
           )}
        </table>
      </div>
    </div>
  );
};

export default FromTable;