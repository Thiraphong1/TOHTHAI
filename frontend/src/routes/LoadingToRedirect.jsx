import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // ✨ แก้ไขตรงนี้
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

const LoadingToRedirect = () => {
  const [count, setCount] = useState(5);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        const next = currentCount - 1;
        if (next === 0) {
          clearInterval(interval);
          setRedirect(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <AnimatePresence>
      {!redirect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md text-center flex flex-col items-center"
          >
            <div className="mb-6">
                <ShieldAlert size={64} className="text-orange-500" strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
              จำเป็นต้องเข้าสู่ระบบ
            </h1>
            <p className="text-gray-600 mb-8">
              คุณต้องเข้าสู่ระบบก่อนเพื่อเข้าถึงหน้านี้ ระบบจะนำคุณไปยังหน้า Login...
            </p>

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="absolute w-full h-full" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r={radius}
                  className="stroke-gray-200"
                  strokeWidth="8" fill="transparent"
                />
                <motion.circle
                  cx="40" cy="40" r={radius}
                  className="stroke-orange-500 -rotate-90 origin-center"
                  strokeWidth="8" fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: circumference * (count / 3) }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
              </svg>
              <span className="text-4xl font-bold text-orange-600">{count}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
      {redirect && <Navigate to="/login" replace />} 
    </AnimatePresence>
  );
};

export default LoadingToRedirect;