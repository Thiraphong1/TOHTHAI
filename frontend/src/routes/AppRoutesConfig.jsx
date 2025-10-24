//rafce
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../layouts/Layout";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Checkout from "../pages/Checkout";
import Dashboard from "../pages/admin/Dashboard";
import LayoutAdmin from "../layouts/LayoutAdmin";
import LayoutUser from "../layouts/LayoutUser";
import Homeuser from "../pages/user/Homeuser";
import Table from "../pages/Table";
import Category from "../pages/admin/Category";
import Product from "../pages/admin/Product";
import Manage from "../pages/admin/Manage";
import History from "../pages/user/History";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import ProtectRouteUser from "./ProtectRouteUser";
import ProtectRouteAdmin from "./ProtectRouteAdmin";
import EditProduct from "../pages/admin/EditProduct";
import StripePayment from "../pages/user/StripePayment";
import CheckoutSuccess from "../components/CheckoutSuccess";
import MOrder from "../pages/admin/MOrder";
import TableAdmin from "../pages/admin/TableAdmin";
import ManageTable from "../pages/admin/ManageTable";

// --- เพิ่ม Import สำหรับ Employee ---
import ProtectRouteEmployee from "./ProtectRouteEmployee";
import EmployeeLayout from "../layouts/EmployeeLayout";
import EmployeeTableSelectionPage from "../pages/employee/EmployeeTableSelectionPage";
import EmployeeOrderPage from "../pages/employee/EmployeeOrderPage";


import ProtectRouteCook from "./ProtectRouteCook";
import KitchenLayout from "../layouts/KitchenLayout";
import KitchenOrderPage from "../pages/kitchen/KitchenOrderPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "table", element: <Table /> },
      { path: "history", element: <History /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "checkout", element: <Checkout /> },
      { path: "menu", element: <Menu /> },
      { path: "cart", element: <Cart /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "category", element: <Category /> },
      { path: "product", element: <Product /> },
      { path: "product/:id", element: <EditProduct /> },
      { path: "manage", element: <Manage /> },
      { path: "orders", element: <MOrder /> },
      { path: "tables", element: <TableAdmin /> },
      { path: "manage-tables", element: <ManageTable /> },
    ],
  },
  // --- เพิ่ม Route ทั้งหมดสำหรับ Employee ที่นี่ ---
  {
    path: "/employee",
    element: <ProtectRouteEmployee element={<EmployeeLayout />} />,
    children: [
      // ถ้าเข้า /employee เฉยๆ ให้เด้งไปหน้าเลือกโต๊ะ
      { index: true, element: <Navigate to="tables" replace /> },
      // หน้าเลือกโต๊ะ
      { path: "tables", element: <EmployeeTableSelectionPage /> },
      // หน้าสร้างออเดอร์ (สำหรับกลับบ้าน)
      { path: "order", element: <EmployeeOrderPage /> },
      // หน้าสร้างออเดอร์ (สำหรับโต๊ะที่ระบุ)
      { path: "order/table/:tableId", element: <EmployeeOrderPage /> },
    ],
  },
  // --- จบส่วนของ Employee ---
  {
    path: "/user", //element:<LayoutUser /> ,
    element: <ProtectRouteUser element={<LayoutUser />} />,
    children: [
      { index: true, element: <Homeuser /> },
      { path: "payment", element: <StripePayment /> },
      { path: "history", element: <History /> },
      { path: "checkout-success", element: <CheckoutSuccess /> },
    ],
  },
  {
    path: "/kitchen",
    element: <ProtectRouteCook allowedRoles={['COOK', 'ADMIN']} element={<KitchenLayout />} />, // หรือใช้ Layout เดิมถ้าไม่มี Layout แยก
    children: [
        { index: true, element: <Navigate to="orders" replace /> },
        { path: 'orders', element: <KitchenOrderPage /> },
    ],
},
]);

const AppRoutesConfig = () => {
  return (
    <>
      <RouterProvider router={router} />{" "}
    </>
  );
};

export default AppRoutesConfig;
