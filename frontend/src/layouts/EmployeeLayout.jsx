import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useEcomStore from "./../store/EcomStore.jsx"
import { LogOut, Armchair, ShoppingBasket } from 'lucide-react';

// นี่คือ Layout หลักสำหรับหน้าของพนักงานทั้งหมด
const EmployeeLayout = () => {
    const user = useEcomStore((state) => state.user);
    const logout = useEcomStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Style สำหรับ NavLink ที่ Active
    const activeLinkStyle = {
        backgroundColor: '#ea580c', // สีส้มเข้ม
        color: 'white',
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar ด้านบน */}
            <header className="bg-orange-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    {/* ลิงก์กลับไปหน้าหลักของ Employee (หน้าเลือกโต๊ะ) */}
                    <NavLink to="/employee/tables" className="text-xl font-bold tracking-wider">
                        TOHTHAI (พนักงาน)
                    </NavLink>
                    {/* เมนูสำหรับ Desktop */}
                    <nav className="hidden md:flex items-center gap-2">
                        <NavLink
                            to="/employee/tables"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <Armchair size={18} />
                            <span>จัดการโต๊ะ</span>
                        </NavLink>
                        <NavLink
                            to="/employee/order"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <ShoppingBasket size={18} />
                            <span>สั่งกลับบ้าน</span>
                        </NavLink>
                        {/* คุณสามารถเพิ่มเมนูอื่นๆ สำหรับ Employee ได้ที่นี่ */}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:block">สวัสดี, {user?.username || 'พนักงาน'}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        title="ออกจากระบบ"
                    >
                        <LogOut size={18}/>
                        <span className="hidden md:block">ออกจากระบบ</span>
                    </button>
                    {/* อาจจะมีปุ่มเมนูสำหรับ Mobile ที่นี่ */}
                </div>
            </header>

            {/* ส่วนแสดงเนื้อหาของแต่ละหน้า */}
            <main className="p-4 md:p-6">
                {/* Outlet คือที่ที่ Component ลูก (เช่น EmployeeTableSelectionPage, EmployeeOrderPage)
                  จะถูกแสดงผลตาม Route ที่ตรงกัน
                */}
                <Outlet />
            </main>

            {/* (Optional) Footer */}
            {/* <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
                © {new Date().getFullYear()} TOHTHAI. All rights reserved.
            </footer> */}
        </div>
    );
};

export default EmployeeLayout;