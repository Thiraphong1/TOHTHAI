import React, { useState, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// ✅ 1. เพิ่ม Eye, EyeOff
import { User, Lock, CheckCircle, XCircle, LoaderCircle, UserPlus, Mail, Phone, Eye, EyeOff } from "lucide-react";

// --- Schema สำหรับตรวจสอบความถูกต้องของข้อมูล (Zod Validation) ---
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" })
      .regex(/^[a-zA-Z0-9_]+$/, "ใช้ได้แค่ตัวอักษร, ตัวเลข, หรือ _ เท่านั้น"),
    email: z
      .string()
      .min(1, { message: "กรุณากรอกอีเมล" })
      .email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    phone: z // ✅ 2. [แก้ไข] ทำให้ phone เป็น Required
      .string()
      .min(1, { message: "กรุณากรอกเบอร์โทรศัพท์" }) // เพิ่ม min(1)
      .regex(/^[0-9]{10}$/, { message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" }),
      // .optional() // ลบออก
      // .or(z.literal('')), // ลบออก
    password: z
      .string()
      .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
    confirmPassword: z
      .string()
      .min(6, { message: "กรุณายืนยันรหัสผ่าน" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

// รูปภาพประกอบ
const REGISTER_IMAGE_URL = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop";

const Register = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ✅ 3. เพิ่ม State สำหรับ Show/Hide Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const password = watch("password", "");

  const passwordStrength = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const strengthLevels = [
    { text: "อ่อนแอมาก", color: "bg-red-500", width: "w-1/4" },
    { text: "อ่อนแอ", color: "bg-orange-500", width: "w-2/4" },
    { text: "ปานกลาง", color: "bg-yellow-500", width: "w-3/4" },
    { text: "แข็งแกร่ง", color: "bg-green-500", width: "w-full" },
    { text: "แข็งแกร่งมาก", color: "bg-emerald-500", width: "w-full" },
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const strength = zxcvbn(data.password);
    if (strength.score < 2) {
      toast.warn("🔒 รหัสผ่านคาดเดาได้ง่ายเกินไป โปรดใช้รหัสที่ซับซ้อนขึ้น");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("https://tohthai.vercel.app//api/register", data);
      toast.success("🎉 สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก";
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* ส่วนฟอร์ม Register ด้านซ้าย */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-orange-600 tracking-wider">TOHTHAI</h1>
              <h2 className="mt-2 text-2xl font-bold text-gray-800 tracking-tight">สร้างบัญชีใหม่</h2>
              <p className="mt-2 text-gray-500">เข้าร่วมกับเราง่ายๆ ในไม่กี่ขั้นตอน</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="username" type="text" placeholder="username" {...register("username")}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm transition ${errors.username ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/50'} focus:outline-none focus:ring-2`}
                  />
                </div>
                <InputErrorMessage name="username" />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="email" type="email" placeholder="you@example.com" {...register("email")}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm transition ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/50'} focus:outline-none focus:ring-2`}
                  />
                </div>
                <InputErrorMessage name="email" />
              </div>

              {/* Phone Field */}
              <div>
                {/* ✅ 2. [แก้ไข] ลบ (ไม่บังคับ) ออก */}
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="phone" type="tel" placeholder="08xxxxxxxx" {...register("phone")}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm transition ${errors.phone ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/50'} focus:outline-none focus:ring-2`}
                  />
                </div>
                <InputErrorMessage name="phone" />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* ✅ 4. [แก้ไข] เปลี่ยน type และเพิ่ม pr-12 */}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg shadow-sm transition ${errors.password ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/50'} focus:outline-none focus:ring-2`}
                  />
                  {/* ✅ 5. [เพิ่ม] ปุ่ม Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* --- Password Strength Meter (เหมือนเดิม) --- */}
                {passwordStrength && (
                  <div className="mt-2 space-y-1">
                    {/* ... */}
                  </div>
                )}
                <InputErrorMessage name="password" />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                <div className="relative">
                  <CheckCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* ✅ 4. [แก้ไข] เปลี่ยน type และเพิ่ม pr-12 */}
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg shadow-sm transition ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500/50'} focus:outline-none focus:ring-2`}
                  />
                  {/* ✅ 5. [เพิ่ม] ปุ่ม Toggle */}
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <InputErrorMessage name="confirmPassword" />
              </div>

                 <button type="submit" disabled={isSubmitting}

                className="w-full flex items-center justify-center py-3.5 px-4 bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-400/70 transition transform hover:scale-[1.02] disabled:bg-orange-400 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <LoaderCircle size={24} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={22} className="mr-2" />
                    <span>สร้างบัญชี</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600" >
                เป็นสมาชิกอยู่แล้ว?{" "}
                <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-800 hover:underline transition"> เข้าสู่ระบบที่นี่ </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ส่วนแสดงรูปภาพด้านขวา */}
        <div className="hidden lg:block lg:w-1/2">
          <img src={REGISTER_IMAGE_URL} alt="บรรยากาศร้านอาหาร" className="w-full h-full object-cover" />
        </div>
      </motion.div>
    </div>
  );
};

export default Register;