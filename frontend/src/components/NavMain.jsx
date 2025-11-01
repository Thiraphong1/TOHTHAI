import React, { useEffect, useRef, useState, useCallback } from "react";
import { NavLink, Link } from "react-router-dom";
import useEcomStore from "../../store/EcomStore.jsx"
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  History,
  LogOut,
  UserPlus,
  LogIn,
  Home,
  BookOpen,
  Coffee,
} from "lucide-react";

// --- Custom Hook สำหรับจัดการ Click Outside ---
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

// --- NavItem พร้อม Animated Underline ---
const NavItem = ({ to, children, onClick, icon: Icon }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      clsx(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        isActive ? "text-white" : "text-white/80 hover:text-white"
      )
    }
  >
    {Icon && <Icon size={16} />}
    {children}
    {({ isActive }) =>
      isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-300"
          layoutId="underline"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )
    }
  </NavLink>
);

// --- CartLink พร้อม Animated Counter ---
const CartLink = ({ count, onClick }) => (
  <NavLink
    to="/cart"
    onClick={onClick}
    className={({ isActive }) =>
      clsx(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        isActive ? "text-white" : "text-white/80 hover:text-white"
      )
    }
  >
    <ShoppingCart size={18} />
    <span>ตะกร้า</span>
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 flex items-center justify-center text-[11px] font-bold bg-red-600 text-white rounded-full shadow-lg"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  </NavLink>
);

export default function NavMain() {
  const cart = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, []);
  
  useClickOutside(dropdownRef, () => setDropdownOpen(false));
  useClickOutside(mobileMenuRef, () => {
    if (mobileOpen) setMobileOpen(false);
  });

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const MenuLinks = ({ onItemClick }) => (
    <>
      <NavItem to="/" onClick={onItemClick} icon={Home}>หน้าแรก</NavItem>
      <NavItem to="/table" onClick={onItemClick} icon={BookOpen}>จองโต๊ะ</NavItem>
      <NavItem to="/menu" onClick={onItemClick} icon={Coffee}>เมนู</NavItem>
    </>
  );

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-gradient-to-r from-orange-600/95 to-orange-700/95 shadow-xl backdrop-blur-lg"
          : "bg-gradient-to-r from-orange-500/90 to-orange-600/90 shadow-sm backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Desktop menu */}
          <div className="flex items-center gap-6">
            <Link to="/" onClick={closeAll} className="text-2xl font-black tracking-wider text-white drop-shadow-md hover:opacity-90 active:scale-95 transition-transform duration-200">
              TOHTHAI
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <MenuLinks />
            </div>
          </div>

          {/* Right: Cart + Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            <CartLink count={cart.length} />
            <div className="w-px h-6 bg-white/20"></div>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-medium pl-2 pr-3 py-1.5 rounded-full shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-haspopup="true" aria-expanded={dropdownOpen}
                >
                  <img
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white/50"
                    src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png"
                  />
                  <span>{user.username}</span>
                  <ChevronDown size={16} className={clsx("opacity-80 transition-transform", dropdownOpen && "rotate-180")}/>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none"
                      role="menu" tabIndex={-1}
                    >
                      <div className="p-1.5">
                        <Link to="/history" onClick={closeAll} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors" role="menuitem">
                          <History size={16} /> Order History
                        </Link>
                        <button onClick={() => { closeAll(); logout(); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors" role="menuitem" type="button">
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-orange-600 font-semibold rounded-lg shadow-sm hover:bg-orange-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                  <UserPlus size={16} /> Register
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-400 text-orange-900 font-semibold rounded-lg shadow-sm hover:bg-yellow-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                  <LogIn size={16} /> Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggler */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-white/95 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition"
            onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle Menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- Mobile Menu Panel --- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-orange-500 to-orange-600 shadow-2xl p-6 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b border-white/20">
                    <span className="text-xl font-bold text-white">เมนู</span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-1 rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                    >
                        <X size={20}/>
                    </button>
                </div>
                <div className="grid gap-2 py-4">
                  <MenuLinks onItemClick={closeAll} />
                  <CartLink count={cart.length} onClick={closeAll} />
                </div>
                <div className="mt-auto pt-4 border-t border-white/20">
                  {user ? (
                    <div className="grid gap-2">
                       <Link to="/history" onClick={closeAll} className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <History size={16} /> Order History
                      </Link>
                      <button onClick={() => { closeAll(); logout(); }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors" type="button">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/register" onClick={closeAll} className="px-3 py-2.5 bg-white text-orange-600 font-semibold rounded-lg shadow hover:bg-orange-50 transition-colors text-center">
                        Register
                      </Link>
                      <Link to="/login" onClick={closeAll} className="px-3 py-2.5 bg-yellow-400 text-orange-900 font-semibold rounded-lg shadow hover:bg-yellow-300 transition-colors text-center">
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}