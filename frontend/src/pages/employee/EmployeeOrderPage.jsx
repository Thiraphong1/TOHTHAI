import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useEcomStore from '../../store/ecomStore';
import { toast } from 'react-toastify';
import { createOrderByEmployee } from '../../api/employee';
import CartCard from '../../components/card/CartCard';
import SlipUploader from '../../components/employee/SlipUploader';
import { Send, LoaderCircle, ArrowLeft } from 'lucide-react';
import ProductSelector from '../../components/employee/ProductSelector';

const EmployeeOrderPage = () => {
  const { tableId } = useParams(); // ดึง ID โต๊ะมาจาก URL (ถ้ามี)
  const navigate = useNavigate();

  // ดึง State และ Action จาก Zustand
  const { carts, token, clearCart } = useEcomStore();
  const total = carts.reduce((sum, item) => sum + ((item.price || 0) * (item.count || 1)), 0); // ป้องกัน Error ถ้า price/count ไม่มี

  const [slipBase64, setSlipBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ฟังก์ชันที่ถูกเรียกเมื่อ SlipUploader อัปโหลด/ลบ สลิป
  const handleSlipChange = (base64Data) => {
    setSlipBase64(base64Data);
  };

  // ฟังก์ชันสำหรับยืนยันและส่งออเดอร์
  const handleSubmitOrder = async () => {
    if (carts.length === 0) {
      return toast.warn("กรุณาเพิ่มสินค้าลงในตะกร้าก่อน");
    }
    if (!slipBase64) {
      return toast.warn("กรุณาแนบสลิปการชำระเงิน");
    }

    setIsSubmitting(true);
    try {
      // เตรียมข้อมูลที่จะส่งไป Backend
      const orderData = {
        cart: carts.map(item => ({ 
            id: item.id, 
            count: item.count || 1, // ใส่ค่า default ป้องกัน undefined
            price: item.price || 0  // ใส่ค่า default ป้องกัน undefined
        })),
        paymentSlipBase64: slipBase64,
        tableId: tableId ? Number(tableId) : null, // ส่ง tableId (ถ้ามี) แปลงเป็น Number
      };

      // เรียก API
      await createOrderByEmployee(token, orderData);
      
      toast.success("ส่งออเดอร์สำเร็จ!");
      clearCart(); // ล้างตะกร้า
      navigate('/employee/tables'); // กลับไปหน้าเลือกโต๊ะ

    } catch (error) {
      // แสดง Error ที่ได้จาก Backend หรือข้อความทั่วไป
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งออเดอร์");
      console.error("Submit Order Error:", error); // แสดง error ใน console ด้วย
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ปุ่มกลับ */}
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
      {/* แสดงหมายเลขโต๊ะ (ถ้ามี) */}
      {tableId && (
          <p className="text-lg text-gray-600 mb-6">
              สำหรับโต๊ะหมายเลข: <span className="font-bold text-orange-600">{tableId}</span>
          </p>
      )}
      <div className="mb-8">
            <ProductSelector />
        </div>
      
      {/* ส่วนแสดงตะกร้าสินค้า (ใช้ Component เดิม) */}
      <div className="mb-8">
         {/* CartCard อาจจะต้องปรับ Style เล็กน้อยให้เหมาะกับหน้านี้ */}
         <CartCard /> 
      </div>

      {/* ส่วนอัปโหลดสลิป */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">แนบสลิปการชำระเงิน</h2>
        <SlipUploader onSlipUploaded={handleSlipChange} /> 
      </div>

      {/* ส่วนสรุปยอด (Optional) */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-8 text-right">
          <p className="text-gray-600">ยอดรวม:</p>
          <p className="text-2xl font-bold text-orange-600">{total.toLocaleString()} บาท</p>
      </div>

      {/* ส่วนยืนยัน */}
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleSubmitOrder}
          disabled={isSubmitting || carts.length === 0 || !slipBase64} // Disable ถ้าไม่มีของ/สลิป หรือกำลังส่ง
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin"/>
          ) : (
            <Send size={20}/>
          )}
          <span>{isSubmitting ? 'กำลังส่งออเดอร์...' : 'ยืนยันและส่งออเดอร์'}</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeOrderPage;