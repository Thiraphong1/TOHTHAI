import React, { useState, useEffect, useCallback } from 'react';
// สมมติว่าสร้าง listAllTables และ updateTableStatus ใน api/table.js แล้ว
import { getAllTables, updateTableStatus } from '../../api/table'; 
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { LoaderCircle, Armchair, ToggleLeft, ToggleRight } from 'lucide-react';

const ManageTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useEcomStore(state => state.token);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllTables(token);
      setTables(res.data);
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลโต๊ะได้");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTables();
    }
  }, [token, fetchTables]);

  const handleStatusToggle = async (tableId, currentStatus) => {
    const newStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      await updateTableStatus(token, tableId, newStatus);
      toast.success("อัปเดตสถานะโต๊ะสำเร็จ");
      // อัปเดต state ทันทีเพื่อ UX ที่ดี
      setTables(currentTables => 
        currentTables.map(t => t.id === tableId ? {...t, status: newStatus} : t)
      );
      // หรือจะ fetchTables() ใหม่ก็ได้ แต่จะช้ากว่าเล็กน้อย
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  if (loading) return (
      <div className="flex justify-center items-center h-64">
          <LoaderCircle size={48} className="animate-spin text-orange-500" />
      </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">จัดการสถานะโต๊ะปัจจุบัน</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <div
            key={table.id}
            className={`p-4 border-2 rounded-lg text-center ${
              table.status === 'AVAILABLE' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}
          >
            <Armchair size={48} className={`mx-auto ${table.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`} />
            <p className="font-bold text-xl mt-2">{table.number}</p>
            <p className="text-sm text-gray-500">ที่นั่ง: {table.capacity}</p>
            <button 
              onClick={() => handleStatusToggle(table.id, table.status)}
              className={`mt-2 flex items-center justify-center w-full px-3 py-1 rounded-md text-white font-medium ${
                table.status === 'AVAILABLE' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {table.status === 'AVAILABLE' ? 
                <><ToggleLeft className="mr-1"/> ว่าง (กดเพื่อปิด)</> : 
                <><ToggleRight className="mr-1"/> ไม่ว่าง (กดเพื่อเปิด)</>
              }
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageTables;