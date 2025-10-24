import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAvailableTables, createReservation } from '../../api/reservation';
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { Armchair, XCircle, CheckCircle, LoaderCircle, Calendar, Users, Clock } from 'lucide-react'; // เพิ่ม Clock icon

const TableUser = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useEcomStore(state => state.token);

  const navigate = useNavigate();
  const location = useLocation();

  // State สำหรับ Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  // ✅ 2. [แก้ไข] เปลี่ยนชื่อ state ให้สื่อถึงการเลือก "เวลา"
  const [selectedTime, setSelectedTime] = useState(''); 
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      console.log("ดึงข้อมูลโต๊ะที่ว่าง...");
      // ✅ 1. [แก้ไข] เรียกใช้ฟังก์ชันที่ถูกต้อง
      const res = await getAvailableTables(); 
      if (Array.isArray(res.data)) {
        setTables(res.data);
      } else {
        setTables([]);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลโต๊ะได้");
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    if (table.status !== 'AVAILABLE') return;

    if (token) {
      setSelectedTable(table);
      setNumberOfGuests(table.capacity);
      setSelectedTime(''); // เคลียร์เวลาที่เลือกไว้ก่อนหน้า
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

  // ✅ 3. [แก้ไข] ฟังก์ชันสำหรับส่งข้อมูลการจอง
  const handleSubmitReservation = async () => {
    if (!selectedTime || numberOfGuests < 1) { // เช็ค selectedTime แทน reservationTime
      return toast.error("กรุณากรอกข้อมูลการจองให้ครบถ้วน");
    }
    if (numberOfGuests > selectedTable.capacity) {
      return toast.warn(`โต๊ะนี้รองรับได้สูงสุด ${selectedTable.capacity} คน`);
    }

    // [เพิ่ม] ตรวจสอบช่วงเวลาที่อนุญาต (Client-side validation)
    const [hours] = selectedTime.split(':').map(Number);
     if (hours < 10 || hours >= 18) {
       return toast.error("สามารถจองได้ระหว่างเวลา 10:00 - 17:59 เท่านั้น");
     }

    setIsSubmitting(true);
    try {
      // ✅ ส่ง reservationTimeString แทน reservationTime
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
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการจอง");
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

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">จองโต๊ะสำหรับวันนี้</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {tables.map(table => (
          <div
            key={table.id}
            onClick={() => handleTableSelect(table)}
            className={`p-4 border-2 rounded-lg text-center transition-transform transform hover:scale-105 ${
              table.status === 'AVAILABLE' ? 'border-green-500 bg-green-50 hover:shadow-lg cursor-pointer' : 'border-red-300 bg-red-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Armchair size={48} className={`mx-auto ${table.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-400'}`} />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">ยืนยันการจองโต๊ะ {selectedTable?.number}</h2>
            <div className="space-y-4">
              <div>
                {/* ✅ 2. [แก้ไข] เปลี่ยน Input เป็น type="time" */}
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาที่ต้องการจอง (10:00 - 17:59)</label>
                <div className="relative">
                  <Clock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="time" 
                    value={selectedTime} 
                    onChange={e => setSelectedTime(e.target.value)} 
                    min="10:00" 
                    max="17:59" 
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