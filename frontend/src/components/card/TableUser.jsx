import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAvailableTables, createReservation } from '../../api/reservation'; 
import useEcomStore from "../../store/EcomStore.jsx" 
import { toast } from 'react-toastify';
import { Armchair, XCircle, CheckCircle, LoaderCircle, Users, Clock, Square, Utensils, DoorOpen, Toilet, MessageSquare } from 'lucide-react'; 

// Logic การเรียงลำดับโต๊ะตามหมายเลข (T1, T2, T10)
const sortTables = (data) => {
    return data.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' }));
};

const TableUser = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useEcomStore(state => state.token);

  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTime, setSelectedTime] = useState(''); 
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Tables ---
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await getAvailableTables(); 
      
      if (Array.isArray(res.data)) {
        setTables(sortTables(res.data)); 
      } else {
        setTables([]);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลโต๊ะได้");
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []); // ทำให้ทำงานแค่ครั้งเดียว

  const handleTableSelect = (table) => {
    if (table.status !== 'AVAILABLE') return; 

    if (token) {
      setSelectedTable(table);
      setNumberOfGuests(table.capacity);
      setSelectedTime(''); 
      setIsModalOpen(true);
    } else {
      toast.info("กรุณาเข้าสู่ระบบก่อนทำการจองโต๊ะ");
      navigate('/login', { state: { from: location } });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setSelectedTime('');
    setNumberOfGuests(1);
  };

  const handleSubmitReservation = async () => {
    if (!selectedTime || numberOfGuests < 1) {
      return toast.error("กรุณากรอกข้อมูลการจองให้ครบถ้วน");
    }
    if (numberOfGuests > selectedTable.capacity) {
      return toast.warn(`โต๊ะนี้รองรับได้สูงสุด ${selectedTable.capacity} คน`);
    }

    const [hours] = selectedTime.split(':').map(Number);
    
    if (hours < 8 || hours >= 17) {
        return toast.error("สามารถจองได้ระหว่างเวลา 08:00 - 17:00 เท่านั้น");
    }

    setIsSubmitting(true);
    try {

      const reservationData = {
        tableId: selectedTable.id,
        reservationTimeString: selectedTime,
        numberOfGuests: Number(numberOfGuests),
      };
      
      await createReservation(token, reservationData); 
      
      toast.success(`ส่งคำขอจองโต๊ะ ${selectedTable.number} เวลา ${selectedTime} สำเร็จ!`);
      handleCloseModal();
      fetchTables(); // โหลดข้อมูลโต๊ะใหม่
    } catch (error) {
      const errorMessage = error.response?.data?.message || "เกิดข้อผิดพลาดในการจอง";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle size={48} className="animate-spin text-orange-500" />
        </div>
    );
  }

  // จัดการกรณีไม่มีโต๊ะว่างเลย
  if (tables.length === 0) {
    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto text-center">
             <h1 className="text-3xl font-bold mb-6 text-gray-800">จองโต๊ะสำหรับวันนี้ เปิดเวลา 10:00-18:00</h1>
             <div className="bg-white p-10 rounded-lg shadow-md">
                <Armchair size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600">ขออภัย, ขณะนี้ไม่มีโต๊ะว่างสำหรับจอง</p>
                <p className="text-gray-500">กรุณาลองใหม่อีกครั้งในภายหลัง</p>
             </div>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">จองโต๊ะสำหรับวันนี้ เปิดเวลา 10:00-18:00</h1>
      
      {/* ✅ โครงสร้าง Floor Plan หลัก */}
      <div className="relative w-full aspect-[4/3] bg-gray-200 border-8 border-gray-400 rounded-lg shadow-2xl p-4">
        
        {/* --- โซน 1: องค์ประกอบคงที่ (Fixed Elements) --- */}

        {/* 1. ประตูทางเข้า (ด้านล่างขวา) */}
        <div className="absolute bottom-0 right-0 w-20 h-10 bg-orange-600 text-white flex items-center justify-center rounded-tl-lg shadow-inner z-10 cursor-default">
            <DoorOpen size={20} />
        </div>
        <p className="absolute bottom-10 right-0 text-xs text-gray-600 font-semibold transform -rotate-90">ทางเข้ามาร้าน</p>

        {/* 2. เวที (ด้านบน) */}
        <div className="absolute top-0 left-0 w-full h-16 bg-purple-700 text-white flex items-center justify-center rounded-t-lg shadow-lg">
            <Square size={24} className="mr-2" /> 
            <span className="font-bold text-lg">เวทีหลัก (STAGE)</span>
        </div>

        {/* 3. ห้องครัว (ด้านล่างซ้าย) */}
        <div className="absolute bottom-0 left-0 w-1/3 h-16 bg-gray-800 text-white flex items-center justify-center rounded-tr-lg shadow-lg">
            <Utensils size={20} className="mr-2" />
            <span className="font-semibold text-sm">ห้องครัว</span>
        </div>

        {/* 4. ห้องน้ำ (ด้านซ้าย) */}
        <div className="absolute left-0 top-1/4 transform -translate-y-1/2 flex flex-col gap-1 z-10">
            <div className="w-16 h-16 bg-blue-500 text-white flex flex-col items-center justify-center rounded-r-lg shadow-md cursor-default">
                <Toilet size={20} />
                <span className="text-xs">ชาย</span>
            </div>
            <div className="w-16 h-16 bg-pink-500 text-white flex flex-col items-center justify-center rounded-r-lg shadow-md cursor-default">
                <Toilet size={20} />
                <span className="text-xs">หญิง</span>
            </div>
        </div>
        
        {/* --- โซน 2: พื้นที่วางโต๊ะ (Dynamic Table Area) --- */}
        <div className="absolute inset-0 pt-16 pb-16 pl-16 pr-24 flex items-start justify-center">
             
            {/* Grid สำหรับวางโต๊ะ (จำลองตำแหน่งหลัก) */}
            <div className="w-full h-full grid grid-cols-6 grid-rows-3 gap-8 p-4"> 
                {tables.map((table) => (
                    <div
                        key={table.id}
                        onClick={() => handleTableSelect(table)}
                        className={`p-4 border-2 rounded-lg text-center transition-transform transform hover:scale-105 cursor-pointer shadow-md flex flex-col justify-center items-center ${
                            table.status === 'AVAILABLE' ? 'border-green-500 bg-green-50 hover:shadow-xl' : 'border-red-300 bg-red-50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Armchair size={36} className={`mx-auto ${table.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-400'}`} />
                        <p className="font-bold text-base mt-2">{table.number}</p>
                        <p className="text-sm text-gray-500">จุ: {table.capacity}</p>
                        {table.status === 'AVAILABLE' ? (
                          <span className="flex items-center justify-center mt-1 text-green-600 text-xs"><CheckCircle size={14} className="mr-1" /> ว่าง</span>
                        ) : (
                          <span className="flex items-center justify-center mt-1 text-red-400 text-xs"><XCircle size={14} className="mr-1" /> ไม่ว่าง</span>
                        )}
                    </div>
                ))}
            </div>

        </div>
      </div>
      
      {/* --- Modal (เหมือนเดิม) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">ยืนยันการจองโต๊ะ {selectedTable?.number}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาที่สามารถจองได้ (08:00 - 17:00)</label>
                <div className="relative">
                  <Clock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="time" 
                    value={selectedTime} 
                    onChange={e => setSelectedTime(e.target.value)} 
                    min="08:00" 
                    max="17:00" 
                    className="pl-10 w-full border border-gray-300 rounded-lg p-3"
                  />
                </div> 
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนแขก (สูงสุด {selectedTable?.capacity} คน)</label>
                <div className="relative">
                  <Users size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" min="1" max={selectedTable?.capacity} value={numberOfGuests} onChange={e => setNumberOfGuests(e.target.value)} className="pl-10 w-full border border-gray-300 rounded-lg p-3"/>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={handleCloseModal} className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">ยกเลิก</button>
              <button onClick={handleSubmitReservation} disabled={isSubmitting} className="w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-orange-300 hover:bg-orange-600">
                {isSubmitting ? <LoaderCircle className="animate-spin inline-block"/> : 'ยืนยันการจอง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableUser;