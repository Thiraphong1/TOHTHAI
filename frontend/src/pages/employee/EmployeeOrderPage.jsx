import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { createOrderByEmployee } from '../../api/employee';
import CartCard from '../../components/card/CartCard';
import SlipUploader from '../../components/employee/SlipUploader';
import { Send, LoaderCircle, ArrowLeft, Banknote, Smartphone,CheckCircle } from 'lucide-react';
import ProductSelector from '../../components/employee/ProductSelector';
import { motion } from 'framer-motion';

const EmployeeOrderPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const { carts, token, clearCart } = useEcomStore();
  const total = carts.reduce((sum, item) => sum + ((item.price || 0) * (item.count || 1)), 0);

  const [slipBase64, setSlipBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ 2. เพิ่ม State สำหรับเลือกวิธีชำระเงิน ( 'TRANSFER' หรือ 'CASH' )
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER'); // ตั้งค่าเริ่มต้นเป็น "โอน"

  const handleSlipChange = (base64Data) => {
    setSlipBase64(base64Data);
  };

  const handleSubmitOrder = async () => {
    if (carts.length === 0) {
      return toast.warn("กรุณาเพิ่มสินค้าลงในตะกร้าก่อน");
    }
    
    // ✅ 3. แก้ไขเงื่อนไข: ถ้าจ่ายสด (CASH) ไม่ต้องเช็คสลิป
    if (paymentMethod === 'TRANSFER' && !slipBase64) {
      return toast.warn("กรุณาแนบสลิปการชำระเงิน");
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        cart: carts.map(item => ({ 
            id: item.id, 
            count: item.count || 1,
            price: item.price || 0,
            note: item.note || null 
        })),
        // ✅ 4. ส่ง paymentSlipBase64 ไปก็ต่อเมื่อเลือก 'TRANSFER'
        paymentSlipBase64: paymentMethod === 'TRANSFER' ? slipBase64 : null,
        tableId: tableId ? Number(tableId) : null,
        // (Optional: คุณอาจจะต้องเพิ่ม field 'paymentMethod' ใน Backend ด้วย)
        // paymentMethod: paymentMethod 
      };

      await createOrderByEmployee(token, orderData);
      
      toast.success("ส่งออเดอร์สำเร็จ!");
      clearCart();
      navigate('/employee/tables');

    } catch (error) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งออเดอร์");
      console.error("Submit Order Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 5. เงื่อนไขสำหรับปิดปุ่มยืนยัน
  const isSubmitDisabled = isSubmitting || 
                           carts.length === 0 || 
                           (paymentMethod === 'TRANSFER' && !slipBase64);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate('/employee/tables')} 
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
      >
        <ArrowLeft size={18} />
        กลับไปหน้าเลือกโต๊ะ
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        สร้างออเดอร์ใหม่
      </h1>
      {tableId && (
        <p className="text-lg text-gray-600 mb-6">
            สำหรับโต๊ะหมายเลข: <span className="font-bold text-orange-600">{tableId}</span>
        </p>
      )}

      {/* 1. เลือกเมนู */}
      <div className="mb-8">
        <ProductSelector />
      </div>
      
      {/* 2. สรุปตะกร้า */}
      <div className="mb-8">
        <CartCard /> 
      </div>

      {/* ✅ 6. [เพิ่ม] ส่วนเลือกวิธีการชำระเงิน */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">วิธีการชำระเงิน</h2>
        <div className="flex gap-4">
          {/* ปุ่มเลือก "โอนเงิน" */}
          <button
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`flex-1 p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
              paymentMethod === 'TRANSFER' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Smartphone className={paymentMethod === 'TRANSFER' ? 'text-orange-600' : 'text-gray-500'} />
            <span className="font-medium">โอนชำระ</span>
            {paymentMethod === 'TRANSFER' && <CheckCircle size={20} className="text-orange-600 ml-auto" />}
          </button>
          
          {/* ปุ่มเลือก "เงินสด" */}
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`flex-1 p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
              paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <Banknote className={paymentMethod === 'CASH' ? 'text-orange-600' : 'text-gray-500'} />
            <span className="font-medium">เงินสด</span>
            {paymentMethod === 'CASH' && <CheckCircle size={20} className="text-orange-600 ml-auto" />}
          </button>
        </div>
      </div>

      {/* ✅ 7. [แก้ไข] ส่วนอัปโหลดสลิป ให้แสดงผลแบบมีเงื่อนไข */}
      {paymentMethod === 'TRANSFER' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md mb-8 overflow-hidden"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">แนบสลิปการชำระเงิน</h2>
          <SlipUploader onSlipUploaded={handleSlipChange} /> 
        </motion.div>
      )}
      
      {/* ส่วนสรุปยอด (เหมือนเดิม) */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-8 text-right">
          <p className="text-gray-600">ยอดรวม:</p>
          <p className="text-2xl font-bold text-orange-600">{total.toLocaleString()} บาท</p>
      </div>

      {/* ส่วนยืนยัน */}
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleSubmitOrder}
          disabled={isSubmitDisabled} // ✅ 5. ใช้ State ที่สร้างไว้
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin"/>
          ) : (
            <Send size={20}/>
          )}
          <span>{isSubmitting ? 'กำลังส่ง...' : 'ยืนยันและส่งออเดอร์'}</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeOrderPage;