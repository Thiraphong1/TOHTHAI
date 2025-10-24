import React, { useState, useEffect, useCallback } from "react";
// ✅ 1. [แก้ไข] เปลี่ยนชื่อ API function ให้ตรงกับที่สร้างไว้ (getAllUsers)
import { getListAllUser, changeUserStatus, changeUserRole } from "../../api/admin";
import useEcomStore from "../../store/ecomStore";
import { toast } from "react-toastify"; // อย่าลืม import ToastContainer ที่ App หลัก
import Swal from "sweetalert2";
import { UsersRound, ToggleRight, ToggleLeft, ShieldCheck, ShieldAlert, Shield, UserCog, ChefHat, LoaderCircle, AlertTriangle } from "lucide-react"; // เพิ่ม Icons

// --- Skeleton Component ---
const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded-lg w-full"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded-lg w-28"></div></td>
      </tr>
    ))}
  </tbody>
);

// Map สำหรับ Role Icons และ Text
const roleMap = {
    USER: { text: "ลูกค้า", icon: <UserCog size={16} className="text-gray-500 mr-2"/>, selectClass: "text-gray-700" },
    ADMIN: { text: "ผู้ดูแลระบบ", icon: <ShieldCheck size={16} className="text-blue-600 mr-2"/>, selectClass: "text-blue-700 font-semibold" },
    EMPLOYEE: { text: "พนักงาน", icon: <Shield size={16} className="text-purple-600 mr-2"/>, selectClass: "text-purple-700" },
    COOK: { text: "พ่อครัว", icon: <ChefHat size={16} className="text-orange-600 mr-2"/>, selectClass: "text-orange-700" },
};

const ManageUser = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // --- Fetch Users ---
  const fetchUsers = useCallback(async () => {
    setError(null);
    try {
      // ✅ 1. [แก้ไข] ใช้ชื่อฟังก์ชัน API ที่ถูกต้อง
      const res = await getListAllUser(token);
      setUsers(res.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้";
      setError(errorMessage);
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
        setLoading(true);
        fetchUsers();
    } else {
        setLoading(false);
        setError("ไม่พบ Token สำหรับการยืนยันตัวตน");
    }
  }, [token, fetchUsers]);

  // --- Handle Status Change ---
  const handleStatusChange = async (userId, currentStatus) => {
    const actionText = currentStatus ? "ปิด" : "เปิด";
    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}ใช้งานผู้ใช้ #${userId}?`,
      text: `คุณต้องการเปลี่ยนสถานะผู้ใช้งานคนนี้ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#d33" : "#3085d6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `ใช่, ${actionText}ใช้งาน`,
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      setUpdatingUserId(userId);
      const originalUsers = [...users];

      setUsers(prevUsers =>
          prevUsers.map(u => u.id === userId ? { ...u, enabled: !u.enabled } : u)
      );

      try {
        const dataToSend = { id: Number(userId), enabled: !currentStatus };
        await changeUserStatus(token, dataToSend);
        toast.success(`อัปเดตสถานะผู้ใช้ #${userId} เรียบร้อยแล้ว`);
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        setUsers(originalUsers);
        console.error("Status Change Error:", err);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  // --- Handle Role Change ---
  const handleRoleChange = async (userId, newRole) => {
    const originalUser = users.find(u => u.id === userId);
    if (!originalUser || originalUser.role === newRole) return;

    const result = await Swal.fire({ 
      title: `ยืนยันการเปลี่ยนบทบาทผู้ใช้ #${userId}?`,
      text: `เปลี่ยนบทบาทเป็น "${roleMap[newRole]?.text || newRole}" ใช่หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
     });

    if (result.isConfirmed) {
      setUpdatingUserId(userId);
      const originalUsers = [...users];

      setUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );

      try {
        // ✅ 2. [แก้ไข] ส่งข้อมูลเป็น Object ตามที่ API function ต้องการ
        const dataToSend = { id: Number(userId), role: newRole };
        await changeUserRole(token, dataToSend);
        toast.success(`อัปเดตบทบาทผู้ใช้ #${userId} เรียบร้อยแล้ว`);
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตบทบาท");
        setUsers(originalUsers);
        console.error("Role Change Error:", err);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <UsersRound size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
        </div>
        {/* ✅ 3. [แก้ไข] แก้ไข Tag ปิดที่นี่ */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">สถานะ</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">จัดการสถานะ</th>
                </tr>
              </thead>
              {loading ? <TableSkeleton /> :
               error ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-red-500">
                      <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
                      <p className="font-semibold text-lg">{error}</p>
                      <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">ลองอีกครั้ง</button>
                    </td>
                  </tr>
                </tbody>
               ) :
               users.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <UsersRound className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                      <p className="font-semibold text-lg">ไม่มีผู้ใช้งานในระบบ</p>
                    </td>
                  </tr>
                </tbody>
               ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className={`transition hover:bg-gray-50 ${updatingUserId === user.id ? "opacity-60 bg-gray-100 pointer-events-none" : ""}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="relative">
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={updatingUserId === user.id}
                                className={`appearance-none w-full border border-gray-300 rounded-md py-2 pl-3 pr-8 leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer hover:border-gray-400 ${roleMap[user.role]?.selectClass || 'text-gray-700'}`}
                            >
                                <option value="USER">ลูกค้า</option>
                                <option value="ADMIN">ผู้ดูแลระบบ</option>
                                <option value="EMPLOYEE">พนักงาน</option>
                                <option value="COOK">พ่อครัว</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                {roleMap[user.role]?.icon || <ShieldAlert size={16} className="text-gray-400"/>}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {user.enabled ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleStatusChange(user.id, user.enabled)}
                          disabled={updatingUserId === user.id}
                          className={`w-28 flex justify-center items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-white transition shadow-sm ${user.enabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                        >
                          {updatingUserId === user.id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : user.enabled ? (
                            <><ToggleLeft size={16} /> ปิดใช้งาน</>
                          ) : (
                            <><ToggleRight size={16} /> เปิดใช้งาน</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
               )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;