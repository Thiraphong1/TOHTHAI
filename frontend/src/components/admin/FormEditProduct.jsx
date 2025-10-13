import React, { useEffect, useState, useCallback } from "react";
import useEcomStore from "../../store/EcomStore";
import { readProduct, updateProduct } from "../../api/product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Uploadfile from "./Uploadfile";
import { useParams, useNavigate } from "react-router-dom";
import {
  Edit,
  LoaderCircle,
  Tag,
  AlignLeft,
  DollarSign,
  Hash,
  Box,
  Save,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const initialState = {
  title: "",
  description: "",
  price: "",
  quantity: "",
  categoryId: "",
  images: [],
};

// --- [ใหม่] Skeleton Component สำหรับตอน Loading ---
const FormEditSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2"><div className="h-12 bg-gray-200 rounded-lg"></div></div>
      <div className="md:col-span-2"><div className="h-24 bg-gray-200 rounded-lg"></div></div>
      <div><div className="h-12 bg-gray-200 rounded-lg"></div></div>
      <div><div className="h-12 bg-gray-200 rounded-lg"></div></div>
      <div className="md:col-span-2"><div className="h-12 bg-gray-200 rounded-lg"></div></div>
      <div className="md:col-span-2"><div className="h-32 bg-gray-200 rounded-lg"></div></div>
    </div>
    <div className="flex justify-end gap-3 mt-8">
      <div className="h-12 bg-gray-200 rounded-lg w-28"></div>
      <div className="h-12 bg-gray-200 rounded-lg w-40"></div>
    </div>
  </div>
);

const FormEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useEcomStore((state) => state.token);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);

  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchProductData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await getCategory(token); // Load categories first
      const res = await readProduct(token, id);
      // Ensure categoryId is a string for the select input
      setValues({ ...res.data, categoryId: String(res.data.categoryId) });
    } catch (err) {
      console.error("err data fetch", err);
      setError("ไม่พบสินค้า หรือเกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [id, token, getCategory]);

  useEffect(() => {
    if (token) {
      fetchProductData();
    }
  }, [token, fetchProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (newImages) => {
    setValues((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProduct(token, id, values);
      toast.success(`แก้ไขข้อมูล "${values.title}" สำเร็จ`);
      setTimeout(() => navigate('/admin/product'), 1500); // Navigate after a short delay
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8">
          <FormEditSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => navigate('/admin/product')}
                className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
            >
                กลับไปหน้าจัดการสินค้า
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Edit size={32} className="text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">แก้ไขสินค้า</h1>
        </div>
        <p className="text-gray-600 mb-8 -mt-4 ml-12">
            ทำการแก้ไขรายละเอียดสินค้า <span className="font-bold text-blue-600">"{values.title}"</span>
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อสินค้า <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" id="title" name="title" value={values.title} onChange={handleChange}
                placeholder="กรอกชื่อสินค้า"
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดสินค้า <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AlignLeft size={20} className="absolute left-3 top-4 text-gray-400" />
              <textarea
                id="description" name="description" value={values.description} onChange={handleChange}
                placeholder="กรอกรายละเอียดสินค้า" rows="4"
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              ราคา (บาท) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" id="price" name="price" value={values.price} onChange={handleChange}
                placeholder="ราคา" min="0"
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนสินค้า <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number" id="quantity" name="quantity" value={values.quantity} onChange={handleChange}
                placeholder="จำนวน" min="0"
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Box size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                id="categoryId" name="categoryId" value={values.categoryId} onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              >
                <option value="" disabled>กรุณาเลือกหมวดหมู่สินค้า</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพสินค้า
            </label>
            <Uploadfile values={values} setValues={handleImageChange} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/product')}
              className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 rounded-lg py-3 px-6 font-semibold hover:bg-gray-300 transition-colors"
            >
                <XCircle size={20} />
                <span>ยกเลิก</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 px-6 font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
            </button>
          </div>
        </form>
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};

export default FormEditProduct;