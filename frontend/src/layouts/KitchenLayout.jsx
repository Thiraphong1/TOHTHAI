import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useEcomStore from "../../store/EcomStore.jsx"
import { LogOut, Soup, ListOrdered } from 'lucide-react';

// Layout หลักสำหรับหน้าของพ่อครัว
const KitchenLayout = () => {
    const user = useEcomStore((state) => state.user);
    const logout = useEcomStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Style สำหรับ NavLink ที่ Active
    const activeLinkStyle = {
        backgroundColor: '#4ade80', // สีเขียวอ่อน
        color: '#166534', // สีเขียวเข้ม
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar ด้านบนสำหรับครัว */}
            <header className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <NavLink to="/kitchen/orders" className="flex items-center gap-2 text-xl font-bold tracking-wider">
                        <Soup size={24}/> {/* ไอคอนครัว */}
                        <span>ครัว TOHTHAI</span>
                    </NavLink>
                    {/* เมนูสำหรับพ่อครัว */}
                    <nav className="hidden md:flex items-center gap-2">
                        <NavLink
                            to="/kitchen/orders"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                        >
                            <ListOrdered size={18} />
                            <span>รายการออเดอร์</span>
                        </NavLink>
                        {/* เพิ่มเมนูอื่นๆ สำหรับพ่อครัวได้ที่นี่ */}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm hidden sm:block">พ่อครัว: {user?.username || 'Cook'}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        title="ออกจากระบบ"
                    >
                        <LogOut size={18}/>
                        <span className="hidden md:block">ออกจากระบบ</span>
                    </button>
                </div>
            </header>

            {/* ส่วนแสดงเนื้อหาของหน้า */}
            <main className="p-4 md:p-6">
                <Outlet /> {/* Component ลูก (KitchenOrderPage) จะแสดงผลตรงนี้ */}
            </main>
        </div>
    );
};

export default KitchenLayout;