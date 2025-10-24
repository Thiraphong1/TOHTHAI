import axios from "axios"

export const createOrderByEmployee = async (token, orderData) => {
      // orderData ควรมีหน้าตาแบบ { cart: [...], tableId: 1, paymentSlipBase64: "data:image/..." }
      return await axios.post('http://localhost:3000/api/employee/order', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    };