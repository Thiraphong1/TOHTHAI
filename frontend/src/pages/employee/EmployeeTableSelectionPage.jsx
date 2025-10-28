import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ [แก้ไข] เปลี่ยนชื่อ API function เป็น listAllTables (ถ้าใช้ชื่อนี้ใน api/table.js)
import { getAllTables } from '../../api/table'; 
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { Armchair, XCircle, CheckCircle, LoaderCircle, ShoppingBag, AlertTriangle, Utensils } from 'lucide-react'; // เพิ่ม Utensils

// Logic การเรียงลำดับโต๊ะตามหมายเลข (T1, T2, T10)
const sortTables = (data) => {
    // ใช้ localeCompare สำหรับการเปรียบเทียบตัวอักษรผสมตัวเลข
    return data.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }));
};

const EmployeeTableSelectionPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // เพิ่ม state สำหรับ error
  const token = useEcomStore(state => state.token);
  const navigate = useNavigate();

  const fetchTables = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await getAllTables(token);
      // ✅ [ปรับปรุง] เรียงลำดับข้อมูลก่อนตั้งค่า State
      setTables(sortTables(res.data)); 
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลโต๊ะได้ กรุณาตรวจสอบการเชื่อมต่อ");
      toast.error("ไม่สามารถโหลดข้อมูลโต๊ะได้");
      console.error("Fetch Tables Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTables();
    }
  }, [token, fetchTables]);

  const handleTableSelect = (table) => {
    // พนักงานสามารถสร้างออเดอร์ให้โต๊ะใดก็ได้ (ว่าง/ไม่ว่าง)
    navigate(`/employee/order/table/${table.id}`);
  };

  const handleTakeawayOrder = () => {
    // ไปหน้าสั่งอาหารแบบไม่มี ID โต๊ะ
    navigate('/employee/order');
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle size={48} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 p-8 bg-white rounded-lg shadow mx-auto max-w-lg">
        <AlertTriangle size={32} className="mb-3"/>
        <p className="font-semibold text-center">{error}</p>
        <button onClick={fetchTables} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  // --- Main Render Content ---
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Utensils size={32} className="text-orange-500"/>
            สร้างออเดอร์ (เลือกโต๊ะ)
        </h1>
        <button 
          onClick={handleTakeawayOrder}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition transform hover:scale-[1.02]"
        >
          <ShoppingBag size={20} />
          สั่งกลับบ้าน
        </button>
      </div>
      
      {/* ❌ จัดการกรณีไม่มีโต๊ะในระบบเลย */}
      {tables.length === 0 && (
         <p className="text-center text-gray-500 py-10 text-lg">
             <Armchair size={40} className="mx-auto mb-2 text-gray-300"/>
             ไม่พบข้อมูลโต๊ะในระบบ โปรดแจ้งผู้ดูแลระบบ
         </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <div
            key={table.id}
            onClick={() => handleTableSelect(table)}
            className={`p-4 border-2 rounded-lg text-center transition-transform transform hover:scale-105 cursor-pointer shadow-lg ${
              // ✅ ปรับ Style ตามสถานะ
              table.status === 'AVAILABLE' 
                ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                : 'border-red-500 bg-red-50 hover:bg-red-100'
            }`}
          >
            <Armchair size={48} className={`mx-auto ${table.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`} />
            <p className="font-bold text-xl mt-2">{table.number}</p>
            <p className="text-sm text-gray-500">ที่นั่ง: {table.capacity}</p>
            {table.status === 'AVAILABLE' ? (
              <span className="flex items-center justify-center mt-1 text-green-600 text-sm font-semibold"><CheckCircle size={16} className="mr-1" /> ว่าง</span>
            ) : (
              <span className="flex items-center justify-center mt-1 text-red-600 text-sm font-semibold"><XCircle size={16} className="mr-1" /> ไม่ว่าง / มีลูกค้า</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTableSelectionPage;