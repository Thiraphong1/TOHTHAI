import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTables } from '../../api/table';
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { Armchair, XCircle, CheckCircle, LoaderCircle, ShoppingBag } from 'lucide-react';

const EmployeeTableSelectionPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useEcomStore(state => state.token);
  const navigate = useNavigate();

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

  const handleTableSelect = (table) => {
    // ไม่ว่าโต๊ะจะว่างหรือไม่ ก็ให้ไปหน้าสั่งอาหารได้
    // เพราะพนักงานอาจจะแค่ต้องการดูออเดอร์ของโต๊ะนั้นๆ (ฟีเจอร์ในอนาคต)
    navigate(`/employee/order/table/${table.id}`);
  };

  const handleTakeawayOrder = () => {
    // ไปหน้าสั่งอาหารแบบไม่มี ID โต๊ะ
    navigate('/employee/order');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle size={48} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">เลือกโต๊ะ / สร้างออเดอร์</h1>
        <button 
          onClick={handleTakeawayOrder}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <ShoppingBag size={20} />
          สั่งกลับบ้าน
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <div
            key={table.id}
            onClick={() => handleTableSelect(table)}
            className={`p-4 border-2 rounded-lg text-center transition-transform transform hover:scale-105 cursor-pointer ${
              table.status === 'AVAILABLE' ? 'border-green-500 bg-green-50 hover:shadow-lg' : 'border-red-500 bg-red-50 hover:shadow-lg'
            }`}
          >
            <Armchair size={48} className={`mx-auto ${table.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`} />
            <p className="font-bold text-xl mt-2">{table.number}</p>
            <p className="text-sm text-gray-500">ที่นั่ง: {table.capacity}</p>
            {table.status === 'AVAILABLE' ? (
              <span className="flex items-center justify-center mt-1 text-green-600 text-sm"><CheckCircle size={16} className="mr-1" /> ว่าง</span>
            ) : (
              <span className="flex items-center justify-center mt-1 text-red-400 text-sm"><XCircle size={16} className="mr-1" /> ไม่ว่าง</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTableSelectionPage;
