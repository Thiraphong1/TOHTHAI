import React, { useEffect, useState, useCallback } from "react";
import useEcomStore from "../../store/EcomStore";
import { createProduct, deleteProduct } from "../../api/product";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Uploadfile from "./Uploadfile"; // อย่าลืมปรับ Uploadfile ตามด้านล่าง
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  LoaderCircle,
  Tag,
  AlignLeft,
  DollarSign,
  Hash,
  Box,
  Image as ImageIcon, // Rename Image to ImageIcon to avoid conflict
  AlertTriangle,
} from "lucide-react";

// --- Skeleton Component สำหรับตอน Loading ---
const ProductFormSkeleton = () => (
  <div className="flex flex-col gap-5 bg-gray-50 p-6 rounded-lg shadow-md animate-pulse">
    <div className="h-10 bg-gray-200 rounded-md"></div>
    <div className="h-20 bg-gray-200 rounded-md"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded-md"></div>
    <div className="h-32 bg-gray-200 rounded-md"></div> {/* For uploadfile */}
    <div className="h-12 bg-gray-200 rounded-md"></div>
  </div>
);

const ProductTableSkeleton = () => (
  <div className="mt-10 overflow-hidden rounded-xl shadow-lg">
    <table className="w-full border-collapse">
      <thead className="bg-gray-100">
        <tr>
          {Array.from({ length: 10 }).map((_, i) => (
            <th key={i} className="p-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="animate-pulse bg-white">
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="w-16 h-16 bg-gray-200 rounded-md mx-auto"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
            <td className="p-4 border-b border-gray-200"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
            <td className="p-4 border-b border-gray-200 flex gap-2"><div className="h-8 bg-gray-200 rounded w-10"></div><div className="h-8 bg-gray-200 rounded w-10"></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


const initialState = {
  title: "",
  description: "",
  price: "",
  quantity: "",
  categoryId: "",
  images: [], // images ควรเป็น array ของ objects { public_id, url }
};

const FromProduct = () => {
  const token = useEcomStore((state) => state.token);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const setProducts = useEcomStore((state) => state.setProducts); // Assuming you have a setProducts in your store

  const [values, setValues] = useState(initialState);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const memoizedGetCategory = useCallback(() => getCategory(token), [token, getCategory]);
  const memoizedGetProduct = useCallback(() => getProduct(token, 100), [token, getProduct]); // Pass token to getProduct

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInitialData(true);
      try {
        if (token) {
          await Promise.all([memoizedGetCategory(), memoizedGetProduct()]);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลเริ่มต้นได้");
      } finally {
        setLoadingInitialData(false);
      }
    };
    loadInitialData();
  }, [token, memoizedGetCategory, memoizedGetProduct]);


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

    // Basic validation
    if (!values.title.trim() || !values.description.trim() || !values.price || !values.quantity || !values.categoryId) {
        toast.error("กรุณากรอกข้อมูลสินค้าให้ครบถ้วน");
        setIsSubmitting(false);
        return;
    }
    if (values.images.length === 0) {
        toast.error("กรุณาอัปโหลดรูปภาพสินค้าอย่างน้อย 1 รูป");
        setIsSubmitting(false);
        return;
    }
    if (values.price <= 0 || values.quantity <= 0) {
        toast.error("ราคาและจำนวนสินค้าต้องมากกว่า 0");
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await createProduct(token, values);
      toast.success(`เพิ่มข้อมูล "${res.data.title}" สำเร็จ`);
      setValues(initialState); // Clear form
      memoizedGetProduct(); // Refresh product list
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบสินค้า?",
      text: `คุณต้องการลบสินค้า "${title}" ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#718096",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      setDeletingProductId(id);
      // Optimistic UI update
      const originalProducts = [...products];
      setProducts(products.filter((p) => p.id !== id));

      try {
        await deleteProduct(token, id);
        toast.success(`ลบสินค้า "${title}" สำเร็จ`);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบสินค้า");
        setProducts(originalProducts); // Rollback
      } finally {
        setDeletingProductId(null);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Package size={36} className="text-blue-600" />
          <h1 className="text-4xl font-extrabold text-gray-800">จัดการสินค้า</h1>
        </div>

        {/* ฟอร์มเพิ่มสินค้า */}
        <div className="bg-white shadow-xl rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <PlusCircle size={24} className="text-green-500" /> เพิ่มสินค้าใหม่
          </h2>
          {loadingInitialData ? <ProductFormSkeleton /> : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Tag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={values.title}
                        onChange={handleChange}
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
                        id="description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        placeholder="กรอกรายละเอียดสินค้า"
                        rows="4"
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
                        type="number"
                        id="price"
                        name="price"
                        value={values.price}
                        onChange={handleChange}
                        placeholder="ราคา"
                        min="0"
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
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={values.quantity}
                        onChange={handleChange}
                        placeholder="จำนวน"
                        min="0"
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
                        id="categoryId"
                        name="categoryId"
                        value={values.categoryId}
                        onChange={handleChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        required
                    >
                        <option value="" disabled>
                            กรุณาเลือกหมวดหมู่สินค้า
                        </option>
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
                    รูปภาพสินค้า <span className="text-red-500">*</span>
                </label>
                <Uploadfile values={values} setValues={handleImageChange} /> {/* ส่ง handleImageChange แทน setValues ตรงๆ */}
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 px-8 font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    <PlusCircle size={20} />
                  )}
                  <span>{isSubmitting ? "กำลังเพิ่มสินค้า..." : "เพิ่มสินค้า"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ตารางสินค้า */}
        <div className="bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Package size={24} className="text-purple-500" /> รายการสินค้าทั้งหมด
          </h2>
          {loadingInitialData ? <ProductTableSkeleton /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รูป</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อสินค้า</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รายละเอียด</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ราคา</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จำนวน</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">หมวดหมู่</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ขายได้</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">อัปเดตล่าสุด</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-lg">ยังไม่มีสินค้าในระบบ</p>
                        <p className="text-sm">ลองเพิ่มสินค้าใหม่ด้านบนดูสิ</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${deletingProductId === item.id ? "opacity-50 bg-red-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.images && item.images.length > 0 ? (
                            <img
                              className="w-16 h-16 object-cover rounded-md shadow-sm mx-auto"
                              src={item.images[0].url}
                              alt={item.title}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 mx-auto">
                              <ImageIcon size={24} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-pre-wrap font-medium text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis">
                            {item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                          ฿{item.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                          {categories.find(cat => cat.id === item.categoryId)?.name || "ไม่ระบุ"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{item.sold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("th-TH") : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                          <Link
                            to={`/admin/product/${item.id}`}
                            className="inline-flex items-center justify-center bg-amber-500 text-white px-3 py-2 rounded-md shadow-sm hover:bg-amber-600 transition"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deletingProductId === item.id}
                            className="inline-flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-md shadow-sm hover:bg-red-700 transition disabled:bg-red-300"
                          >
                            {deletingProductId === item.id ? (
                                <LoaderCircle size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};

export default FromProduct;