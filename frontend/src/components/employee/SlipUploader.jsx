import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Resize from 'react-image-file-resizer';
import { UploadCloud, X, Image as ImageIcon, LoaderCircle } from 'lucide-react'; // Rename Image to avoid conflict

// Component นี้รับฟังก์ชัน onSlipUploaded (prop) มาจาก Component แม่ (EmployeeOrderPage)
// เพื่อใช้ส่งข้อมูล Base64 ของสลิปกลับไป
const SlipUploader = ({ onSlipUploaded }) => {
    const [slipPreview, setSlipPreview] = useState(null); // State เก็บ Base64 สำหรับแสดงตัวอย่าง
    const [loading, setLoading] = useState(false);        // State เก็บสถานะกำลังประมวลผลรูป

    // ฟังก์ชันทำงานเมื่อผู้ใช้เลือกไฟล์
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return; // ถ้าไม่เลือกไฟล์ ก็ไม่ต้องทำอะไร

        // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
        if (!file.type.startsWith("image/")) {
            e.target.value = null; // เคลียร์ค่า input file
            return toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)");
        }

        setLoading(true); // เริ่มแสดงสถานะ Loading

        // ใช้ react-image-file-resizer เพื่อย่อขนาดและแปลงเป็น Base64
        Resize.imageFileResizer(
            file,     // ไฟล์ที่เลือก
            800,      // ความกว้างสูงสุด
            800,      // ความสูงสูงสุด
            "JPEG",   // Format ปลายทาง
            90,       // คุณภาพ (0-100)
            0,        // Rotation (องศา)
            (base64) => { // Callback function ทำงานเมื่อแปลงเสร็จ
                setSlipPreview(base64); // อัปเดต State เพื่อแสดงตัวอย่าง
                onSlipUploaded(base64); // เรียกฟังก์ชันที่แม่ส่งมา พร้อมส่งข้อมูล Base64 กลับไป
                setLoading(false);      // หยุด Loading
            },
            "base64"  // Output type
        );
        e.target.value = null; // เคลียร์ค่า input file เพื่อให้เลือกไฟล์เดิมซ้ำได้
    };
    
    // ฟังก์ชันทำงานเมื่อกดปุ่ม X เพื่อลบรูปตัวอย่าง
    const handleRemoveSlip = () => {
        setSlipPreview(null); // ลบรูปตัวอย่าง
        onSlipUploaded(null); // แจ้ง Component แม่ว่าไม่มีสลิปแล้ว (ส่ง null กลับไป)
    };

    return (
        <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
            {/* แสดง Spinner ขณะกำลังประมวลผล */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <LoaderCircle className="animate-spin text-orange-500" size={32}/>
                    <p className="mt-2 text-sm text-gray-500">กำลังประมวลผลรูปภาพ...</p>
                </div>
            ) : slipPreview ? ( 
                /* แสดงรูปตัวอย่างเมื่อมีสลิปแล้ว */
                <div className="relative inline-block group">
                    <img 
                        src={slipPreview} 
                        alt="ตัวอย่างสลิป" 
                        className="max-h-48 rounded-md shadow-md" 
                    />
                    {/* ปุ่มลบรูป จะแสดงเมื่อเอาเมาส์ไปชี้ */}
                    <button 
                        onClick={handleRemoveSlip}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="ลบสลิป"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                /* แสดงส่วนให้เลือกไฟล์เมื่อยังไม่มีสลิป */
                <div className="flex flex-col items-center">
                    <UploadCloud size={48} className="mx-auto text-gray-400 mb-2" />
                    <label htmlFor="slip-upload" className="text-sm font-medium text-orange-600 hover:text-orange-800 cursor-pointer bg-orange-100 px-4 py-2 rounded-md transition-colors">
                        <span>คลิกเพื่อแนบสลิป</span>
                        <input 
                            id="slip-upload" 
                            type="file" 
                            className="sr-only" // ซ่อน input file เดิมๆ
                            accept="image/png, image/jpeg, image/webp" // จำกัดชนิดไฟล์
                            onChange={handleFileChange} 
                        />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">รองรับไฟล์ PNG, JPG, WEBP</p>
                </div>
            )}
        </div>
    );
};

export default SlipUploader;