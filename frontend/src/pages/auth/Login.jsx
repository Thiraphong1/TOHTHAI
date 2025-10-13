import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useEcomStore from "../../store/ecomStore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, LoaderCircle } from "lucide-react";

// เปลี่ยนเป็น URL จาก Unsplash เพื่อความเสถียร
const RESTAURANT_IMAGE_URL = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop";

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useEcomStore((state) => state.actionLogin);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await actionLogin(formData);
      const role = res.data.payload.role;
      toast.success("เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับมาค่ะ/ครับ");
      
      setTimeout(() => {
        roleRedirect(role);
      }, 1500);

    } catch (err) {
      const errMsg = err.response?.data?.message;
      toast.error(errMsg || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดตรวจสอบข้อมูลอีกครั้ง");
      setIsSubmitting(false);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/"); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        
        {/* ส่วนฟอร์ม Login ด้านซ้าย */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-orange-600 tracking-wider">TOHTHAI</h1>
                <h2 className="mt-2 text-2xl font-bold text-gray-800 tracking-tight">
                  เข้าสู่ระบบ
                </h2>
                <p className="mt-2 text-gray-500">
                  ยินดีต้อนรับ! กรุณากรอกข้อมูลเพื่อใช้งาน
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้ใช้ / อีเมล
                </label>
                <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                      type="text" name="username" id="username" value={formData.username} onChange={handleChange}
                      placeholder="username or email" required
                    />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                      type="password" name="password" id="password" value={formData.password} onChange={handleChange}
                      placeholder="••••••••" required
                    />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3.5 px-4 bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-400/70 transition transform hover:scale-[1.02] disabled:bg-orange-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : (
                    <>
                      <LogIn size={22} className="mr-2" />
                      <span>เข้าสู่ระบบ</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชีใช่ไหม?{" "}
                <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-800 hover:underline transition">
                  ลงทะเบียนฟรี!
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* ส่วนแสดงรูปภาพด้านขวา */}
        <div className="hidden lg:block lg:w-1/2">
          <img 
            src={RESTAURANT_IMAGE_URL} 
            alt="ภาพประกอบร้านอาหาร" 
            className="w-full h-full object-cover"
          />
        </div>

      </motion.div>
    </div>
  );
}; // <-- ✨ เพิ่มวงเล็บปีกกาปิด `}` ที่หายไปตรงนี้

export default Login;