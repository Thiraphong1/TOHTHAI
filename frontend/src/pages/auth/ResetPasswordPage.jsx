import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ Import Icons ที่จำเป็น
import { Lock, CheckCircle, XCircle, LoaderCircle, AlertTriangle } from 'lucide-react';
// ✅ Import API (คุณต้องสร้างไฟล์นี้ด้วย)
import { resetPassword } from '../../api/auth'; // สมมติว่าสร้างฟังก์ชันนี้ใน api/auth.js

// --- Schema สำหรับตรวจสอบความถูกต้องของข้อมูล (Zod Validation) ---
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
    confirmPassword: z
      .string()
      .min(1, { message: "กรุณายืนยันรหัสผ่าน" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });


const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // ดึง Token จาก URL
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onTouched",
    });

    // 💡 [Check] ถ้าไม่มี Token ใน URL ให้แสดง Error
    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">ไม่พบโทเค็น</h1>
                <p className="text-gray-600 mt-2">กรุณาเข้าถึงหน้านี้ผ่านลิงก์ที่ส่งไปทางอีเมลเท่านั้น</p>
                <button onClick={() => navigate('/login')} className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg">
                    กลับสู่หน้าเข้าสู่ระบบ
                </button>
            </div>
        );
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // ✅ 1. เรียก API เพื่อตั้งรหัสผ่านใหม่
            await resetPassword({ token, newPassword: data.password });

            toast.success("ตั้งรหัสผ่านใหม่สำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
            
            setTimeout(() => {
                navigate('/login', { replace: true }); // พาไปหน้า Login
            }, 2500);

        } catch (err) {
            const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการตั้งรหัสผ่าน";
            toast.error(errMsg);
            setIsSubmitting(false);
        }
    };

    const InputErrorMessage = ({ name }) => (
        <AnimatePresence>
            {errors[name] && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-1 text-red-600 text-sm mt-2 font-medium"
                >
                    <XCircle size={14} /> {errors[name].message}
                </motion.p>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10"
            >
                <div className="text-center mb-10">
                    <Lock size={36} className="text-orange-600 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">ตั้งรหัสผ่านใหม่</h1>
                    <p className="mt-2 text-gray-500 text-sm">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg shadow-sm transition ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <InputErrorMessage name="password" />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                        <div className="relative">
                            <CheckCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                                className={`w-full pl-12 pr-12 py-3 border rounded-lg shadow-sm transition ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-orange-500'} focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                            />
                        </div>
                        <InputErrorMessage name="confirmPassword" />
                    </div>

                    <button type="submit" disabled={isSubmitting}
                        className="w-full flex items-center justify-center py-3.5 px-4 bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-orange-700 transition disabled:bg-orange-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <LoaderCircle size={24} className="animate-spin" />
                        ) : (
                            <span>ตั้งรหัสผ่านใหม่</span>
                        )}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                        กลับสู่หน้าเข้าสู่ระบบ
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;