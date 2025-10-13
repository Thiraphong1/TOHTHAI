import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation"; // เพิ่มสำหรับปุ่มนำทาง (ถ้าต้องการ)
import { Pagination, Autoplay, Navigation } from "swiper/modules"; // เพิ่ม Navigation module
import axios from "axios";
import { motion } from "framer-motion"; // สำหรับ Animation ที่ลื่นไหล
import { ArrowLeft, ArrowRight } from "lucide-react"; // สำหรับไอคอนลูกศร

// URL สำหรับรูปภาพทดสอบ (ถ้า Picsum ไม่เหมาะ สามารถเปลี่ยนเป็น URL ของคุณเองได้)
const HERO_IMAGE_API = "https://picsum.photos/v2/list?page=1&limit=5"; // 5 รูปสำหรับ Hero
const THUMBNAIL_IMAGE_API = "https://picsum.photos/v2/list?page=6&limit=10"; // 10 รูปสำหรับ Thumbnail

// Animation Variants สำหรับ Framer Motion
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.2,
            duration: 0.5,
            ease: "easeOut"
        }
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ContentHome = () => {
    const [heroImages, setHeroImages] = useState([]);
    const [thumbnailImages, setThumbnailImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const [heroRes, thumbnailRes] = await Promise.all([
                    axios.get(HERO_IMAGE_API),
                    axios.get(THUMBNAIL_IMAGE_API),
                ]);
                setHeroImages(heroRes.data);
                setThumbnailImages(thumbnailRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch images:", err);
                setError("เกิดข้อผิดพลาดในการโหลดรูปภาพ โปรดลองอีกครั้งในภายหลัง");
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-red-100 text-red-700 rounded-lg shadow-md p-6">
                <p className="text-lg font-medium">{error}</p>
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section */}
            <motion.section className="relative w-full rounded-2xl overflow-hidden shadow-xl" variants={itemVariants}>
                {loading ? (
                    <SkeletonLoader type="hero" />
                ) : (
                    <Swiper
                        className="w-full h-[450px] md:h-[550px]" // ปรับความสูงให้เหมาะสม
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        navigation={{
                            nextEl: '.swiper-button-next-hero',
                            prevEl: '.swiper-button-prev-hero',
                        }}
                        loop={true}
                        modules={[Pagination, Autoplay, Navigation]}
                    >
                        {heroImages.map((item, index) => (
                            <SwiperSlide key={item.id}>
                                <div className="relative w-full h-full">
                                    <img
                                        src={item.download_url}
                                        alt={item.author}
                                        className="w-full h-full object-cover animate-fade-in transition-transform duration-1000 ease-out hover:scale-105"
                                    />
                                    {/* Text Overlay */}
                                    <motion.div
                                        className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-6 text-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                    >
                                        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                                            รสชาติไทยแท้ สู่มือคุณ
                                        </h2>
                                        <p className="text-lg md:text-xl font-medium max-w-2xl drop-shadow-md">
                                            สำรวจเมนูอาหารไทยต้นตำรับ ที่ปรุงด้วยใจและวัตถุดิบคุณภาพดีที่สุด
                                        </p>
                                        <motion.button
                                            className="mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold rounded-full shadow-lg transition transform hover:scale-105 active:scale-95"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            ดูเมนูทั้งหมด
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </SwiperSlide>
                        ))}
                        {/* Custom Navigation Buttons */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 cursor-pointer swiper-button-prev-hero transition-all duration-300">
                            <ArrowLeft className="text-white" size={24} />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 p-2 rounded-full bg-white/30 hover:bg-white/50 cursor-pointer swiper-button-next-hero transition-all duration-300">
                            <ArrowRight className="text-white" size={24} />
                        </div>
                    </Swiper>
                )}
            </motion.section>

            {/* Thumbnail/Category Section */}
            <motion.section className="w-full" variants={itemVariants}>
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
                    เมนูแนะนำประจำวัน
                </h3>
                {loading ? (
                    <SkeletonLoader type="thumbnails" />
                ) : (
                    <Swiper
                        slidesPerView={2}
                        spaceBetween={15}
                        breakpoints={{
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 4,
                                spaceBetween: 25,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 30,
                            },
                        }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        loop={true}
                        modules={[Autoplay]}
                        className="mySwiper"
                    >
                        {thumbnailImages.map((item) => (
                            <SwiperSlide key={item.id}>
                                <motion.div
                                    className="relative group cursor-pointer bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                                    whileHover={{ y: -5 }} // ยกขึ้นเล็กน้อยเมื่อ Hover
                                    whileTap={{ scale: 0.98 }} // กดแล้วยุบลงเล็กน้อย
                                >
                                    <img
                                        src={item.download_url}
                                        alt={item.author}
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="p-4">
                                        <h4 className="text-lg font-semibold text-gray-800 truncate">
                                            {item.author.split(' ')[0]} {/* แสดงแค่ชื่อแรกของ Author */}
                                        </h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            เมนูอร่อยจากเชฟมืออาชีพ ที่คุณไม่ควรพลาด!
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="text-white text-base font-bold px-4 py-2 bg-orange-500 rounded-full">
                                            ดูรายละเอียด
                                        </span>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </motion.section>

            {/* Featured Categories (ตัวอย่างเพิ่มเติม) */}
            <motion.section className="w-full" variants={itemVariants}>
                <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
                    สำรวจตามหมวดหมู่
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img
                                src={`https://picsum.photos/id/${10 + index}/200/200`} // ใช้รูปภาพแบบสุ่ม
                                alt={`Category ${index + 1}`}
                                className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-orange-400 ring-offset-2"
                            />
                            <h4 className="text-lg font-semibold text-gray-800">หมวดหมู่ {index + 1}</h4>
                            <p className="text-sm text-gray-500">100+ เมนู</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
};

// --- Skeleton Loader Component ---
const SkeletonLoader = ({ type }) => {
    if (type === "hero") {
        return (
            <div className="w-full h-[450px] md:h-[550px] bg-gray-200 animate-pulse rounded-2xl">
                <div className="absolute inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center">
                    <div className="h-10 w-3/4 bg-gray-400 rounded-md mb-4"></div>
                    <div className="h-6 w-1/2 bg-gray-400 rounded-md"></div>
                </div>
            </div>
        );
    }
    if (type === "thumbnails") {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="bg-gray-200 animate-pulse rounded-xl shadow-md overflow-hidden h-64">
                        <div className="w-full h-48 bg-gray-300"></div>
                        <div className="p-4">
                            <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


export default ContentHome;