// ✅ [แก้ไข] แก้ไข Syntax การ import ให้ถูกต้อง
import React, { useState, useEffect, useCallback } from 'react'; 
import useEcomStore from "../../store/EcomStore.jsx" // ตรวจสอบ Path
import { getDashboardSummaryToday, getOrderTypeStatsToday, getTopSellingProducts } from '../../api/admin'; // ตรวจสอบ Path
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LayoutDashboard, CircleDollarSign, ShoppingCart, AlertTriangle, LoaderCircle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


// --- Component ย่อยสำหรับ Card แสดงข้อมูล ---
const StatCard = ({ icon, title, value, colorClass, loading }) => (
    <motion.div
        className={`p-6 rounded-xl shadow-lg flex items-center gap-5 text-white ${colorClass}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        {loading ? (
             <div className="w-12 h-12 bg-white/30 rounded-full animate-pulse flex-shrink-0"></div>
        ) : (
            <div className="p-3 bg-white/25 rounded-full flex-shrink-0">{icon}</div>
        )}
        <div className="overflow-hidden">
            {loading ? (
                <>
                    <div className="h-4 bg-white/30 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-7 bg-white/30 rounded w-16 animate-pulse"></div>
                </>
            ) : (
                <>
                    <p className="text-sm font-medium opacity-80 truncate">{title}</p>
                    <p className="text-3xl font-bold truncate">{value}</p>
                </>
            )}
        </div>
    </motion.div>
);


// --- Component ย่อยสำหรับ Chart Skeletons ---
const ChartSkeleton = ({ height = 'h-72' }) => ( // ✅ แก้ไข default height
    <div className={`w-full ${height} bg-gray-200 rounded-lg animate-pulse`}></div>
);

const Dashboard = () => {
    const token = useEcomStore((state) => state.token);
    const [summary, setSummary] = useState({ totalRevenueToday: 0, totalOrdersToday: 0 });
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [summaryError, setSummaryError] = useState(null);

    const [orderTypeData, setOrderTypeData] = useState(null);
    const [topProductData, setTopProductData] = useState(null);
    const [loadingCharts, setLoadingCharts] = useState(true);
    const [chartsError, setChartsError] = useState(null);


    // --- Fetch Summary Data ---
    const fetchSummary = useCallback(async () => {
        setSummaryError(null);
        try {
            const res = await getDashboardSummaryToday(token);
            setSummary(res.data || { totalRevenueToday: 0, totalOrdersToday: 0 });
        } catch (err) {
            console.error("Fetch Dashboard Summary Error:", err);
            setSummaryError("ไม่สามารถโหลดข้อมูลสรุปได้");
            // toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสรุป"); // อาจจะแสดงเยอะไปถ้า chart ก็ error
        }
    }, [token]);

    // --- Fetch Chart Data ---
    const fetchChartData = useCallback(async () => {
        setChartsError(null);
        try {
            const [orderTypeRes, topProductRes] = await Promise.all([
                getOrderTypeStatsToday(token),
                getTopSellingProducts(token, 'week', 5)
            ]);

            setOrderTypeData({
                labels: orderTypeRes.data.labels || [],
                datasets: [{
                    label: 'จำนวนออเดอร์',
                    data: orderTypeRes.data.data || [],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)', // Blue
                        'rgba(239, 68, 68, 0.7)',  // Red
                        'rgba(245, 158, 11, 0.7)', // Amber
                        'rgba(16, 185, 129, 0.7)', // Emerald
                        'rgba(139, 92, 246, 0.7)', // Violet
                    ],
                    borderColor: [ '#ffffff' ],
                    borderWidth: 2,
                }],
            });

            setTopProductData({
                labels: topProductRes.data.labels || [],
                datasets: [{
                    label: 'จำนวนที่ขายได้ (สัปดาห์นี้)',
                    data: topProductRes.data.data || [],
                    backgroundColor: 'rgba(249, 115, 22, 0.7)', // Orange
                    borderColor: 'rgba(234, 88, 12, 1)',
                    borderWidth: 1,
                    borderRadius: 4, // เพิ่มความโค้งมน
                }],
            });

        } catch (err) {
            console.error("Fetch Chart Data Error:", err);
            setChartsError("ไม่สามารถโหลดข้อมูลกราฟได้");
            // toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลกราฟ"); // แสดง toast รวมทีเดียว
        }
    }, [token]);


    // --- Initial Data Loading Effect ---
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingSummary(true);
            setLoadingCharts(true);
            let summaryFetchError = false;
            let chartFetchError = false;

            if (token) {
                 try {
                     await Promise.all([
                         fetchSummary().catch(e => { summaryFetchError = true; }), // ดัก error แยก
                         fetchChartData().catch(e => { chartFetchError = true; }) // ดัก error แยก
                     ]);
                 } catch (e) {
                      // Should not happen with individual catches, but as a fallback
                      console.error("Unexpected error during initial load:", e);
                 }
            } else {
                setSummaryError("ไม่พบ Token");
                setChartsError("ไม่พบ Token");
                summaryFetchError = true;
                chartFetchError = true;
            }

            setLoadingSummary(false); // Set loading false after fetches complete
            setLoadingCharts(false);

            // แสดง Toast รวมถ้ามี Error
            if(summaryFetchError || chartFetchError) {
                toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลบางส่วน");
            }
        };
        loadInitialData();
    }, [token, fetchSummary, fetchChartData]); // ใส่ dependencies ให้ครบ


    // --- Render Error State ---
    const renderError = (errorMsg, retryFunc) => (
        <div className="p-6 flex flex-col items-center justify-center text-red-600 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle size={32} className="mb-2"/>
            <p className="font-semibold text-center">{errorMsg}</p>
            <button
                onClick={retryFunc}
                className="mt-3 px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
                ลองใหม่
            </button>
        </div>
     );

    // Options for Bar Chart
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // ✅ เพิ่มเพื่อให้ปรับความสูงได้
        plugins: {
            legend: { display: false },
            title: { display: true, text: '5 เมนูขายดี (สัปดาห์นี้)' },
        },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, // ✅ ไม่แสดงทศนิยมที่แกน Y
    };

    // Options for Pie Chart
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // ✅ เพิ่มเพื่อให้ปรับขนาดได้
        plugins: {
            legend: {
                position: 'bottom', // ย้าย legend ไปด้านล่าง
            },
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3" // ลด mb เพราะใช้ space-y ที่ parent
            >
                <LayoutDashboard size={32} className="text-orange-600" />
                <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ดวันนี้</h1>
            </motion.div>

            {/* --- Summary Cards --- */}
            {summaryError ? renderError(summaryError, fetchSummary) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        icon={<CircleDollarSign size={28} />}
                        title="รายรับวันนี้"
                        value={loadingSummary ? '...' : `฿${summary.totalRevenueToday?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                        colorClass="bg-gradient-to-br from-green-500 to-emerald-600"
                        loading={loadingSummary}
                    />
                     <StatCard
                        icon={<ShoppingCart size={28} />}
                        title="ออเดอร์วันนี้"
                        value={loadingSummary ? '...' : summary.totalOrdersToday?.toLocaleString() || '0'}
                        colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                        loading={loadingSummary}
                    />
                </div>
            )}


            {/* --- Charts Section --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Order Type Pie Chart --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">ประเภทออเดอร์วันนี้</h2>
                    <div className="h-72"> {/* ✅ กำหนดความสูงให้ Container */}
                        {chartsError ? renderError(chartsError, fetchChartData) :
                         loadingCharts ? <ChartSkeleton height="h-full"/> : // ให้ Skeleton สูงเต็มพื้นที่
                         orderTypeData && orderTypeData.datasets[0].data.length > 0 ? ( // เช็คว่ามี data จริงๆ
                            <Pie data={orderTypeData} options={pieChartOptions}/>
                         ) : (
                             <p className="flex items-center justify-center h-full text-center text-gray-500">ไม่มีข้อมูลประเภทออเดอร์สำหรับวันนี้</p>
                         )}
                     </div>
                </div>

                {/* --- Top Selling Products Bar Chart --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">เมนูขายดี</h2>
                    <div className="h-72"> {/* ✅ กำหนดความสูงให้ Container */}
                        {chartsError ? renderError(chartsError, fetchChartData) :
                         loadingCharts ? <ChartSkeleton height="h-full"/> :
                         topProductData && topProductData.datasets[0].data.length > 0 ? ( // เช็คว่ามี data จริงๆ
                             <Bar options={barChartOptions} data={topProductData} />
                         ) : (
                             <p className="flex items-center justify-center h-full text-center text-gray-500">ไม่มีข้อมูลเมนูขายดี</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;