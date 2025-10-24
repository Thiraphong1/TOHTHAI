// src/api/kitchen.js
import axios from "axios";

export const getKitchenOrders = async (token) => {
  return await axios.get('http://localhost:3000/api/cookorders', {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateOrderStatus = async (token, orderId, status) => {
  return await axios.put(`http://localhost:3000/api/cookorders/${orderId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};