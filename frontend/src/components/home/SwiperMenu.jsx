import React from "react";
import { Swiper } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const SwiperMenu = ({ children, title }) => {
  // สร้าง ID ที่ไม่ซ้ำกันสำหรับ mỗi Swiper instance เพื่อให้ปุ่ม navigation ทำงานแยกกัน
  const uniqueId = React.useId();
  const prevButtonId = `prev-${uniqueId}`;
  const nextButtonId = `next-${uniqueId}`;

  return (
    <>
      <style>
        {`
          /* Custom Pagination Styles */
          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background-color: #d1d5db; /* gray-300 */
            opacity: 1;
            transition: background-color 0.3s, transform 0.3s;
          }
          .swiper-pagination-bullet-active {
            transform: scale(1.25);
            background-color: #f97316; /* orange-500 */
          }

          /* Hide default navigation arrows */
          .swiper-button-next,
          .swiper-button-prev {
            display: none;
          }
        `}
      </style>

      <section className="relative group w-full max-w-7xl mx-auto py-8">
        {/* Section Title */}
        {title && (
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 px-4 md:px-0">
            {title}
          </h2>
        )}

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: `#${prevButtonId}`,
            nextEl: `#${nextButtonId}`,
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true, // หยุดเมื่อเอาเมาส์ชี้
          }}
          spaceBetween={20}
          slidesPerView={1.5} // Mobile-first: แสดง 1 slide เต็ม และ slide ถัดไปเล็กน้อย
          centeredSlides={true}
          loop={true}
          breakpoints={{
            // Responsive breakpoints
            640: { // sm
              slidesPerView: 2.5,
              spaceBetween: 20,
              centeredSlides: false,
            },
            768: { // md
              slidesPerView: 3.5,
              spaceBetween: 25,
              centeredSlides: false,
            },
            1024: { // lg
              slidesPerView: 4.5,
              spaceBetween: 30,
              centeredSlides: false,
            },
            1280: { // xl
              slidesPerView: 5,
              spaceBetween: 30,
              centeredSlides: false,
            },
          }}
          className="!px-4 !py-4" // เพิ่ม padding เพื่อไม่ให้เงาถูกตัด
        >
          {children}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button
          id={prevButtonId}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-1/2 group-hover:translate-x-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          id={nextButtonId}
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 p-3 bg-white rounded-full shadow-lg text-gray-700 hover:bg-orange-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-1/2 group-hover:-translate-x-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <ChevronRight size={24} />
        </button>
      </section>
    </>
  );
};

export default SwiperMenu;