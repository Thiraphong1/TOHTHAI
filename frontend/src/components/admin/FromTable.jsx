import React, { useState, useEffect, useCallback } from 'react';
import { getAllReservations, updateReservationStatus } from "../../api/admin"; // ตรวจสอบ Path ให้ถูกต้อง
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { LoaderCircle, Check, X, Users, CalendarDays, Clock, AlertCircle } from 'lucide-react'; // เพิ่ม Icons

const FromTable = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // ✨ [ปรับปรุง] 2. State สำหรับแสดง loading ตอนกดปุ่ม
  const [error, setError] = useState(null); // ✨ [ปรับปรุง] 3. State สำหรับเก็บข้อผิดพลาดในการโหลด
  const token = useEcomStore(state => state.token);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // เคลียร์ error เก่า
      const res = await getAllReservations(token);
      setReservations(res.data);
    } catch (err) {
      console.error("Fetch Reservations Error:", err); // แสดง error ใน console ด้วย
      toast.error("ไม่สามารถโหลดข้อมูลการจองได้");
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง"); // ✨ [ปรับปรุง] 3. เก็บข้อความ error
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReservations();
    } else {
      setLoading(false); // ถ้าไม่มี token ก็ไม่ต้องโหลด
    }
  }, [token, fetchReservations]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id); // ✨ [ปรับปรุง] 2. เริ่ม loading ที่ปุ่ม
    try {
      await updateReservationStatus(token, id, status);
      toast.success(`อัปเดตสถานะการจอง #${id} เป็น ${status} สำเร็จ`);
      fetchReservations(); // Refresh data
    } catch (error) {
      console.error("Update Status Error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setUpdatingId(null); // ✨ [ปรับปรุง] 2. หยุด loading ที่ปุ่ม
    }
  };

  // ✨ [ปรับปรุง] 4. ย้าย Styles ออกมาเพื่อให้อ่านง่ายขึ้น
  const statusConfig = {
    PENDING: { style: "bg-yellow-100 text-yellow-800", icon: <Clock size={14} className="mr-1 inline"/>, text: "รออนุมัติ" },
    CONFIRMED: { style: "bg-green-100 text-green-800", icon: <Check size={14} className="mr-1 inline"/>, text: "อนุมัติแล้ว" },
    CANCELLED: { style: "bg-red-100 text-red-800", icon: <X size={14} className="mr-1 inline"/>, text: "ยกเลิก" },
    DEFAULT: { style: "bg-gray-100 text-gray-800", icon: <Clock size={14} className="mr-1 inline"/>, text: "ไม่ระบุ" },
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle size={48} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // --- Render Error State ---
  // ✨ [ปรับปรุง] 3. แสดงข้อความเมื่อโหลดข้อมูลล้มเหลว
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
            <AlertCircle size={48} className="mb-2"/>
            <p className="font-semibold">{error}</p>
            <button
                onClick={fetchReservations}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
                ลองใหม่
            </button>
        </div>
     );
  }

  // --- Render Main Content ---
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto"> {/* เพิ่ม max-w-7xl ให้กว้างขึ้น */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <CalendarDays /> จัดการการจองโต๊ะ
      </h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* ✨ [ปรับปรุง] 5. เพิ่ม header ให้ชัดเจน */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่/เวลาจอง</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โต๊ะ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้จอง</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนแขก</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* ✨ [ปรับปรุง] 6. จัดการกรณีไม่มีข้อมูล */}
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                  <Clock size={48} className="mx-auto mb-2 text-gray-400" />
                  ยังไม่มีรายการจอง
                </td>
              </tr>
            ) : (
              reservations.map(res => {
                const currentStatusConfig = statusConfig[res.status] || statusConfig.DEFAULT;
                const isUpdating = updatingId === res.id; // เช็คว่ากำลังอัปเดตแถวนี้หรือไม่

                return (
                  <tr key={res.id} className={`${isUpdating ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(res.reservationTime).toLocaleString('th-TH', {
                        year: 'numeric', month: 'short', day: 'numeric', // ✨ [ปรับปรุง] 5. รูปแบบวันที่ให้อ่านง่าย
                        hour: '2-digit', minute: '2-digit',
                        timeZone: 'Asia/Bangkok'
                      })}
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
                      {res.status === 'PENDING' && (
                        <div className="flex gap-2 justify-center items-center">
                          {isUpdating ? (
                            <LoaderCircle size={20} className="animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')} title="ยืนยัน" className="text-green-600 hover:text-green-900"><Check size={20}/></button>
                              <button onClick={() => handleUpdateStatus(res.id, 'CANCELLED')} title="ยกเลิก" className="text-red-600 hover:text-red-900"><X size={20}/></button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ✨ [ปรับปรุง] 1. เปลี่ยนชื่อ Export ให้ตรง
export default FromTable;