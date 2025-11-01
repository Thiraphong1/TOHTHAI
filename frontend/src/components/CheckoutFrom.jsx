import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { saveOrder } from "../api/user";
import useEcomStore from "./../store/EcomStore.jsx"
import { useNavigate } from "react-router-dom";

const CheckoutFrom = () => {
  const stripe = useStripe();
  const elements = useElements();
  const cart = useEcomStore(state => state.carts);
  const token = useEcomStore(state => state.token);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Confirm Payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // ป้องกัน Stripe redirect
      });

      if (error) {
        toast.error(error.message || "เกิดข้อผิดพลาดในการชำระเงิน");
        setLoading(false);
        return;
      }

      // ตรวจสอบสถานะการชำระเงิน
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // บันทึก order ที่ backend
        await saveOrder(token);

        toast.success("ชำระเงินเรียบร้อยแล้ว");
        navigate("/menu"); // redirect กลับหน้า menu
      } else {
        toast.warning("ชำระเงินยังไม่เสร็จสมบูรณ์");
      }

    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อหรือชำระเงิน");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        {loading ? "กำลังประมวลผล..." : "ชำระเงินด้วย PromptPay"}
      </button>

      {/* แสดงรายการสินค้า */}
      <div className="mt-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-gray-700">
            <span>{item.title} x {item.count || 1}</span>
            <span>{(item.price * (item.count || 1)).toLocaleString()} ฿</span>
          </div>
        ))}
      </div>
    </form>
  );
};

export default CheckoutFrom;
