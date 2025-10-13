import React, { useState, createContext, useContext } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  LayoutDashboard,
  Users,
  Layers3,
  Package,
  Warehouse,
  UserCircle,
  ClipboardList,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import useEcomStore from "../../store/ecomStore";

// สร้าง Context
const SidebarContext = createContext();

const SidebarAdmin = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useEcomStore((state) => state.user) || { username: 'Admin User' }; 
  const logout = useEcomStore((state) => state.logout);
  const navigate = useNavigate(); // 2. ประกาศใช้งาน navigate

  // --- 3. สร้างฟังก์ชันสำหรับจัดการการ Logout ---
  const handleLogout = () => {
    logout(); // เรียกใช้ฟังก์ชัน logout จาก store
    navigate('/login'); // นำทางไปยังหน้า login
  };

  const SidebarItem = ({ icon, text, to, alert }) => {
    const { isCollapsed } = useContext(SidebarContext);
  
    return (
      <NavLink
        to={to}
        end={to === "/admin"}
        className={({ isActive }) =>
          `relative flex items-center py-2.5 px-4 my-1 font-medium rounded-lg cursor-pointer transition-colors group ${
            isActive
              ? "bg-gradient-to-tr from-orange-200 to-orange-100 text-orange-800"
              : "hover:bg-orange-50 text-gray-600"
          }`
        }
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            isCollapsed ? "w-0" : "w-52 ml-3"
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded bg-orange-400 ${
              isCollapsed ? "" : "top-2"
            }`}
          />
        )}
  
        {!isCollapsed && (
          <div
            className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-orange-100 text-orange-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
        `}
          >
            {text}
          </div>
        )}
      </NavLink>
    );
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, text: "Dashboard", to: "/admin" },
    { icon: <Users size={20} />, text: "Manage Users", to: "manage" },
    { icon: <Layers3 size={20} />, text: "Category", to: "category" },
    { icon: <Package size={20} />, text: "Product", to: "product" },
    { icon: <ClipboardList size={20} />, text: "Orders", to: "orders", alert: true },
    { icon: <Warehouse size={20} />, text: "Storage", to: "storage" },
    { icon: <UserCircle size={20} />, text: "Personal Info", to: "personal" },
  ];

  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <aside className={`h-screen sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`}>
        <nav className="h-full flex flex-col bg-white border-r shadow-sm">
          <div className="p-4 pb-2 flex justify-between items-center">
            <Link to="/admin" className="flex items-center min-w-0">
              <span
                className={`text-2xl font-black text-orange-500 tracking-wider overflow-hidden transition-all ${
                  isCollapsed ? "w-0" : "w-32"
                }`}
              >
                TOHTHAI
              </span>
            </Link>
            <button
              onClick={() => setIsCollapsed((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
          </div>

          <ul className="flex-1 px-3 mt-4">
            {navItems.map((item, index) => (
              <SidebarItem key={index} {...item} />
            ))}
          </ul>

          <div className="border-t flex p-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png"
              alt="Avatar"
              className="w-10 h-10 rounded-md"
            />
            <div
              className={`
              flex justify-between items-center
              overflow-hidden transition-all ${isCollapsed ? "w-0" : "w-52 ml-3"}
          `}
            >
              <div className="leading-4">
                <h4 className="font-semibold">{user.username}</h4>
                <span className="text-xs text-gray-600">{user.email || 'admin@example.com'}</span>
              </div>
              {/* --- 4. เรียกใช้ handleLogout เมื่อกดปุ่ม --- */}
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </SidebarContext.Provider>
  );
};

export default SidebarAdmin;