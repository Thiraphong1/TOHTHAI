import React, { useEffect, useState, useCallback } from "react";
import { createCategory, removeCategory } from "../../api/Category";
import useEcomStore from "../../store/EcomStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Layers, Plus, Trash2, LoaderCircle, AlertTriangle } from "lucide-react";

// --- [ใหม่] Skeleton Component สำหรับตอน Loading ---
const CategorySkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);

const FormCategory = () => {
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const memoizedGetCategory = useCallback(() => {
    setLoading(true);
    getCategory(token).finally(() => setLoading(false));
  }, [token, getCategory]);

  useEffect(() => {
    if (token) memoizedGetCategory();
  }, [token, memoizedGetCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่");

    setIsSubmitting(true);
    try {
      await createCategory(token, { name });
      toast.success(`สร้างหมวดหมู่ "${name}" สำเร็จ`);
      setName("");
      memoizedGetCategory(); // โหลดข้อมูลใหม่
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด: อาจมีชื่อซ้ำ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id, categoryName) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: `คุณแน่ใจหรือว่าต้องการลบหมวดหมู่ "${categoryName}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#718096",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      setDeletingId(id);
      // Optimistic UI: ลบออกจาก UI ก่อน
      const originalCategories = [...categories];
      const newCategories = originalCategories.filter(cat => cat.id !== id);
      useEcomStore.setState({ categories: newCategories });
      
      try {
        await removeCategory(token, id);
        toast.success(`ลบหมวดหมู่ "${categoryName}" สำเร็จ`);
        // ไม่ต้อง fetch ใหม่เพราะ UI update ไปแล้ว
      } catch (err) {
        console.log(err);
        toast.error("เกิดข้อผิดพลาดในการลบ");
        // Rollback: นำข้อมูลเดิมกลับมาถ้า API fail
        useEcomStore.setState({ categories: originalCategories });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const renderCategoryList = () => {
    if (loading) return <CategorySkeleton />;

    if (categories.length === 0) {
      return (
        <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg text-gray-400">
          <Layers size={48} className="mx-auto" />
          <p className="mt-4 font-semibold text-lg">ยังไม่มีหมวดหมู่</p>
          <p className="text-sm">เริ่มสร้างหมวดหมู่ใหม่ด้านบนได้เลย</p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {categories.map((item) => (
          <li
            key={item.id}
            className={`flex justify-between items-center border rounded-lg p-4 transition-all duration-300 ${deletingId === item.id ? "bg-red-50 opacity-50" : "bg-white hover:shadow-md hover:border-blue-300"}`}
          >
            <span className="text-gray-800 font-medium">{item.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(item.id, item.name)}
              disabled={deletingId === item.id}
              className="flex items-center justify-center w-20 bg-red-500 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-red-600 transition-colors disabled:bg-red-300"
            >
              {deletingId === item.id ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Layers size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-800">จัดการหมวดหมู่</h1>
          </div>

          <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น เครื่องดื่ม, ของทอด, สลัด..."
              className="flex-grow border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center bg-blue-500 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Plus size={20} className="-ml-1 mr-2" />
              )}
              <span>{isSubmitting ? "กำลังสร้าง..." : "สร้างหมวดหมู่"}</span>
            </button>
          </form>

          <hr className="my-6" />

          {renderCategoryList()}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};

export default FormCategory;