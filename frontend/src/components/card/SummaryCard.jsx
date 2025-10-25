import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  Truck,
  Store,
  AlertCircle,
  ShoppingCart,
  LoaderCircle,
  Edit,
  MessageSquare,
} from "lucide-react";
import {
  listUserCart,
  updateCartDeliveryOption,
  updateUserAddress,
} from "../../api/user";
import { getAllTables } from "../../api/table"; // Make sure path is correct
import useEcomStore from "../../store/ecomStore"; // Make sure path is correct
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-10"></div>
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        {/* Delivery Options Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        {/* Product List Skeleton */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="h-6 bg-gray-200 rounded-md w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
      {/* Summary Skeleton */}
      <div className="lg:sticky top-8 bg-white p-6 rounded-xl shadow-md space-y-4">
        <div className="h-6 bg-gray-200 rounded-md w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="border-t-2 border-dashed border-gray-200 my-4 pt-4">
          <div className="h-8 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  </div>
);

const SummaryCard = () => {
  const token = useEcomStore((state) => state.token);
  const user = useEcomStore((state) => state.user);
  const updateUserInStore = useEcomStore((state) => state.setUser); // ✅ เพิ่ม Action สำหรับอัปเดต user ใน store
  const [cartData, setCartData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("DELIVERY");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    addressLine1: "", // Initialize empty
    addressLine2: "",
    city: "",
    postalCode: "",
  });

  const shippingCost = deliveryMethod === "DELIVERY" ? 40 : 0;
  const finalTotal = cartTotal + shippingCost;

  // --- Update address form when user data loads/changes ---
  useEffect(() => {
    if (user) {
      setAddressFormData({
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
      });
    }
  }, [user]);

  // --- Fetch Initial Cart Data ---
  const handleGetUserCart = useCallback(async () => {
    // ไม่ต้อง setIsLoading(true) ที่นี่ เพราะจะทำใน useEffect หลัก
    setError(null);
    try {
      const res = await listUserCart(token);
      setCartData(res.data);
      setProducts(res.data.products || []);
      setCartTotal(res.data.cartTotal || 0);
      setDeliveryMethod(res.data.deliveryMethod || "DELIVERY");
      setSelectedTableId(res.data.tableId || "");
    } catch (err) {
      console.error("Get Cart Error:", err);
      setError("ไม่สามารถโหลดข้อมูลตะกร้าได้ โปรดลองอีกครั้ง");
      setProducts([]); // Clear products on error
      setCartTotal(0);
    }
  }, [token]);

  // --- Fetch Tables ---
  const fetchTables = useCallback(async () => {
    try {
      const res = await getAllTables(token); // Use the correct API function
      setTables(res.data);
    } catch (error) {
      console.error("Failed to fetch tables", error);
    }
  }, [token]);

  // --- Initial Data Loading ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (token) {
        // Fetch cart and tables in parallel
        await Promise.all([handleGetUserCart(), fetchTables()]);
      } else {
        // Handle case where user might log out on this page
        setCartData(null);
        setProducts([]);
        setCartTotal(0);
        setError("กรุณาเข้าสู่ระบบเพื่อดูตะกร้าสินค้า");
      }
      setIsLoading(false);
    };
    loadData();
  }, [token, handleGetUserCart, fetchTables]); // Rerun if token changes

  // --- Handle Delivery Method Change ---
  const handleDeliveryChange = async (method) => {
    // Don't change immediately, wait for API response if needed
    setIsUpdatingDelivery(true);
    try {
      const currentTableId = cartData?.tableId; // Use current tableId from cartData
      const deliveryData = {
        deliveryMethod: method,
        tableId: method === "TABLE" ? currentTableId || null : null, // Keep tableId if switching to TABLE, else null
      };
      const res = await updateCartDeliveryOption(token, deliveryData);
      // Update local state after successful API call
      setDeliveryMethod(method);
      setSelectedTableId(res.data.cart.tableId || ""); // Update selected table from response
      setCartData(res.data.cart); // Update full cart data
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตวิธีรับของ");
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  // --- Handle Table Selection Change ---
  const handleTableChange = async (e) => {
    const newTableId = e.target.value;
    // Don't change immediately
    setIsUpdatingDelivery(true);
    try {
      const deliveryData = {
        deliveryMethod: "TABLE",
        tableId: newTableId ? Number(newTableId) : null,
      };
      const res = await updateCartDeliveryOption(token, deliveryData);
      setSelectedTableId(newTableId); // Update after success
      setCartData(res.data.cart); // Update full cart data
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเลือกโต๊ะ");
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  // --- Handle Address Form Change ---
  const handleAddressFormChange = (e) => {
    setAddressFormData({ ...addressFormData, [e.target.name]: e.target.value });
  };

  // --- Handle Save Address ---
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsUpdatingDelivery(true); // Reuse loading state
    try {
      const res = await updateUserAddress(token, addressFormData);
      toast.success("อัปเดตที่อยู่สำเร็จ");
      setIsEditingAddress(false);
      // ✅ อัปเดต user state ใน Zustand
      updateUserInStore(res.data.user);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตที่อยู่");
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <SkeletonLoader />
      </div>
    );
  }

  // Handle general error after loading
  if (error && !isLoading) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-red-600">
          เกิดข้อผิดพลาด
        </h3>
        <p className="mt-1 text-gray-500">{error}</p>
        <button
          onClick={handleGetUserCart}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center mx-auto gap-2"
        >
          <LoaderCircle
            size={16}
            className={`${!isLoading ? "hidden" : "animate-spin"}`}
          />{" "}
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  // Handle empty cart after loading
  if (products.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-800">
          ตะกร้าของคุณว่างเปล่า
        </h3>
        <p className="mt-1 text-gray-500">
          ดูเหมือนว่าคุณยังไม่ได้เลือกสินค้าใดๆ
        </p>
        <Link
          to="/menu"
          className="mt-6 inline-block px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          กลับไปเลือกเมนู
        </Link>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        ยืนยันคำสั่งซื้อ
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* --- Delivery Method Section --- */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              วิธีการรับสินค้า
            </h2>
            <div
              className={`grid sm:grid-cols-2 gap-4 ${
                isUpdatingDelivery ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* Delivery Option */}
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="delivery_option"
                  value="DELIVERY"
                  checked={deliveryMethod === "DELIVERY"}
                  onChange={() => handleDeliveryChange("DELIVERY")}
                  className="sr-only peer"
                />
                <div className="p-5 border rounded-lg peer-checked:border-blue-600 peer-checked:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <Truck size={28} className="text-gray-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        จัดส่งถึงที่
                      </h3>
                      <p className="text-sm text-gray-500">
                        ค่าจัดส่ง {deliveryMethod === "DELIVERY" ? "40" : "0"}{" "}
                        บาท (ระยะทางไม่เกิน 2 กม. หาเกินคิดเพิ่ม กม.ละ 20 บาท)
                      </p>
                    </div>
                  </div>
                </div>
                <CheckCircle
                  size={20}
                  className="absolute top-3 right-3 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity"
                />
              </label>

              {/* Table Option */}
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="delivery_option"
                  value="TABLE"
                  checked={deliveryMethod === "TABLE"}
                  onChange={() => handleDeliveryChange("TABLE")}
                  className="sr-only peer"
                />
                <div className="p-5 border rounded-lg peer-checked:border-blue-600 peer-checked:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <Store size={28} className="text-gray-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        รับที่โต๊ะ
                      </h3>
                      <p className="text-sm text-gray-500">ไม่มีค่าใช้จ่าย</p>
                    </div>
                  </div>
                </div>
                <CheckCircle
                  size={20}
                  className="absolute top-3 right-3 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity"
                />
              </label>
            </div>

            {/* --- Address or Table Selection --- */}
            {deliveryMethod === "DELIVERY" && (
              <div className="mt-6 relative">
                {isEditingAddress ? (
                  <form
                    onSubmit={handleSaveAddress}
                    className="space-y-3 p-4 bg-gray-50 border rounded-lg animate-fade-in"
                  >
                    <h3 className="font-semibold mb-2 text-gray-700">
                      แก้ไขที่อยู่จัดส่ง
                    </h3>
                    <div>
                      <label
                        htmlFor="addressLine1"
                        className="text-sm font-medium text-gray-600"
                      >
                        ที่อยู่บรรทัด 1 *
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={addressFormData.addressLine1}
                        onChange={handleAddressFormChange}
                        required
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="addressLine2"
                        className="text-sm font-medium text-gray-600"
                      >
                        ที่อยู่บรรทัด 2
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={addressFormData.addressLine2}
                        onChange={handleAddressFormChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="city"
                          className="text-sm font-medium text-gray-600"
                        >
                          เมือง/จังหวัด *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={addressFormData.city}
                          onChange={handleAddressFormChange}
                          required
                          className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="text-sm font-medium text-gray-600"
                        >
                          รหัสไปรษณีย์
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={addressFormData.postalCode}
                          onChange={handleAddressFormChange}
                          className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingDelivery}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-blue-300 hover:bg-blue-700 flex items-center gap-1"
                      >
                        {isUpdatingDelivery ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : null}{" "}
                        บันทึก
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg text-blue-800 animate-fade-in">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">จัดส่งไปที่:</p>
                        {/* ใช้ข้อมูลจาก user state ล่าสุด */}
                        <p className="text-sm">
                          {user?.addressLine1 || "(ยังไม่ได้ระบุที่อยู่)"}
                        </p>
                        {user?.addressLine2 && (
                          <p className="text-sm">{user.addressLine2}</p>
                        )}
                        <p className="text-sm">
                          {user?.city || ""} {user?.postalCode || ""}
                        </p>
                        <p className="text-sm mt-1">
                          เบอร์โทร: {user?.phone || "(ไม่ได้ระบุ)"}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="แก้ไขที่อยู่"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {deliveryMethod === "TABLE" && (
              <div className="mt-6 animate-fade-in">
                <label
                  htmlFor="tableSelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  เลือกหมายเลขโต๊ะ:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="tableSelect"
                    value={selectedTableId || ""} // Handle null/undefined case for controlled component
                    onChange={handleTableChange}
                    disabled={isUpdatingDelivery || tables.length === 0}
                    className={`flex-grow p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      !selectedTableId ? "text-gray-500" : "text-gray-900"
                    } ${
                      tables.length === 0
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  >
                    <option value="" disabled>
                      -- กรุณาเลือกโต๊ะ --
                    </option>
                    {tables.length === 0 && (
                      <option disabled>กำลังโหลด...</option>
                    )}
                    {tables
                      // Filter for available tables ONLY if you want to prevent selection of occupied tables here
                      // .filter(table => table.status === 'AVAILABLE')
                      .map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.number} ({table.capacity} ที่นั่ง){" "}
                          {table.status !== "AVAILABLE" ? "(ไม่ว่าง)" : ""}
                        </option>
                      ))}
                  </select>
                  {isUpdatingDelivery && (
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-blue-500 flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- Product List --- */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              รายการสินค้า ({products.length})
            </h2>
            <div className="divide-y divide-gray-200">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border">
                      {item.product?.images &&
                      item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">ไม่มีรูป</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.product?.title || "สินค้าถูกลบ"}
                      </p>
                      <p className="text-sm text-gray-500">
                        จำนวน: {item.count}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    {((item.price || 0) * (item.count || 1)).toLocaleString()} ฿
                  </p>
                  {item.note && (
                    <div className="mt-2 ml-[calc(4rem+1rem)] flex items-start text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200">
                      <MessageSquare size={14} className="flex-shrink-0 mr-2 mt-0.5 text-gray-500" />
                      <span className="break-all"><strong>หมายเหตุ:</strong> {item.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Summary Section --- */}
        <div className="lg:sticky lg:top-28 bg-white p-6 rounded-xl shadow-md space-y-4 self-start">
          {" "}
          {/* Use self-start for alignment */}
          <h2 className="text-xl font-bold text-gray-800 text-center">
            สรุปยอด
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            {" "}
            {/* Smaller text */}
            <div className="flex justify-between">
              <p>ยอดรวมสินค้า</p>
              <p className="font-medium">{cartTotal.toLocaleString()} ฿</p>
            </div>
            <div className="flex justify-between">
              <p>ค่าจัดส่ง</p>
              <p className="font-medium">{shippingCost.toLocaleString()} ฿</p>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-gray-200 my-4 pt-4">
            <div className="flex justify-between items-center text-gray-900">
              <p className="text-lg font-bold">ยอดสุทธิ</p>
              <p className="text-2xl font-extrabold text-green-600">
                {finalTotal.toLocaleString()} ฿
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/user/payment")}
            disabled={
              isUpdatingDelivery ||
              (deliveryMethod === "TABLE" && !selectedTableId) ||
              products.length === 0
            } // Disable if cart empty
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-lg font-bold text-lg hover:bg-green-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            <CheckCircle size={22} />
            ดำเนินการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
