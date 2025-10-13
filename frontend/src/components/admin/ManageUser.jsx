import React, { useState, useEffect, useCallback } from "react";
import { getListAllUser, changeUserStatus, changeUserRole } from "../../api/admin";
import useEcomStore from "../../store/ecomStore";
import { get } from "lodash";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { UsersRound, ToggleRight, ToggleLeft, ShieldCheck, Shield, LoaderCircle, AlertTriangle } from "lucide-react";

// --- Skeleton Component สำหรับตอน Loading ---
const TableSkeleton = () => (
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-full"></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
        <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-28"></div></td>
      </tr>
    ))}
  </tbody>
);

const ManageUser = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListAllUser(token);
      setUsers(res.data);
    } catch (err) {
      const errorMessage = get(err, "response.data.message", "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId, currentStatus) => {
    const result = await Swal.fire({
      title: `ยืนยันการ${currentStatus ? "ปิด" : "เปิด"}ใช้งาน?`,
      text: `คุณต้องการเปลี่ยนสถานะผู้ใช้งานคนนี้ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      setUpdatingUserId(userId);
      const originalUsers = [...users];
      
      setUsers(users.map(u => u.id === userId ? { ...u, enabled: !u.enabled } : u));
      
      try {
        await changeUserStatus(token, { id: userId, enabled: !currentStatus });
        toast.success("อัปเดตสถานะเรียบร้อยแล้ว");
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        setUsers(originalUsers);
        console.error(err);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const originalUser = users.find(u => u.id === userId);
    if (originalUser.role === newRole) return;

    const result = await Swal.fire({
      title: "ยืนยันการเปลี่ยนบทบาท?",
      text: `คุณต้องการเปลี่ยนบทบาทเป็น "${newRole}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    
    if (result.isConfirmed) {
      setUpdatingUserId(userId);
      const originalUsers = [...users];

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      try {
        await changeUserRole(token, { id: userId, role: newRole });
        toast.success("อัปเดตบทบาทเรียบร้อยแล้ว");
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตบทบาท");
        setUsers(originalUsers);
        console.error(err);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const renderContent = () => {
    if (loading) return <TableSkeleton />;
    if (error) return (
      <tbody>
        <tr>
          <td colSpan={5} className="py-16 text-center text-red-500">
            <AlertTriangle className="mx-auto mb-2 h-12 w-12" />
            <p className="font-semibold text-lg">{error}</p>
          </td>
        </tr>
      </tbody>
    );
    if (users.length === 0) return (
        <tbody>
            <tr>
            <td colSpan={5} className="py-16 text-center text-gray-500">
                <UsersRound className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="font-semibold text-lg">ไม่มีผู้ใช้งานในระบบ</p>
            </td>
            </tr>
        </tbody>
    );
    
    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.id} className={`transition hover:bg-gray-50 ${updatingUserId === user.id ? "opacity-50" : ""}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{user.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.username}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="relative">
                    <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUserId === user.id}
                        className="appearance-none w-full bg-gray-100 border-gray-200 border text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      {user.role === 'admin' ? <ShieldCheck size={16} className="text-blue-600"/> : <Shield size={16}/>}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {user.enabled ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => handleStatusChange(user.id, user.enabled)}
                disabled={updatingUserId === user.id}
                className={`w-28 flex justify-center items-center gap-2 px-3 py-2 rounded-md font-medium text-white transition ${user.enabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} disabled:bg-gray-400`}
              >
                {updatingUserId === user.id ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : user.enabled ? (
                  <><ToggleLeft size={18} /> ปิดใช้งาน</>
                ) : (
                  <><ToggleRight size={18} /> เปิดใช้งาน</>
                )}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
            <UsersRound size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
        </div>
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            {renderContent()}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;