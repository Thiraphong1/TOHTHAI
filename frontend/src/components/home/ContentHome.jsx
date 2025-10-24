import React from "react"; 
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


// Animation Variants (เก็บไว้ใช้กับข้อความและปุ่ม)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            duration: 0.4,
            ease: "easeOut"
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut"} },
};

const ContentHome = () => {
    // ไม่ต้องใช้ state และ useEffect สำหรับโหลดรูปภาพแล้ว

    return (
        <motion.div
            className="container mx-auto px-4 py-8" // ลด space-y ลง หรือเอาออกถ้าไม่ต้องการ Section อื่น
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* --- Hero Section --- */}
            <motion.section
                className="relative w-full rounded-2xl overflow-hidden shadow-xl" // คง Style กรอบไว้
                variants={itemVariants}
            >
                {/* ✅ ใช้ div พื้นหลังสีดำ */}
                <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-black flex flex-col items-center justify-center text-white p-6 sm:p-12 md:p-20 text-center">
                    {/* Text Overlay (อยู่บนพื้นดำโดยตรง) */}
                    <motion.h2
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg leading-tight"
                        variants={itemVariants}
                    >
                        รสชาติไทยแท้ สู่มือคุณ
                    </motion.h2>
                    <motion.p
                        className="text-base sm:text-lg md:text-xl font-medium max-w-2xl drop-shadow-md mb-8 sm:mb-10"
                         variants={itemVariants}
                    >
                        สำรวจเมนูอาหารไทยต้นตำรับ ที่ปรุงด้วยใจและวัตถุดิบคุณภาพดีที่สุด
                    </motion.p>
                    <Link to="/menu">
                        <motion.button
                            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold rounded-full shadow-lg transition transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ดูเมนูทั้งหมด
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

             {/* คุณสามารถเพิ่ม Section อื่นๆ ต่อจากนี้ได้ */}

        </motion.div>
    );
};

export default ContentHome;