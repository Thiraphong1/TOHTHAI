import axios from "axios";

export const createUserCart = async (token, cart) => {
  // code body
  return axios.post("https://tohthai.vercel.app//api/user/cart", cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const listUserCart = async (token) => {
  // code body
  return axios.get("https://tohthai.vercel.app//api/user/cart",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const saveOrder = async (token,payload) => {
  // code body
  return axios.post("https://tohthai.vercel.app//api/user/order", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getOrders = async (token) => {
  // code body
  return axios.get("https://tohthai.vercel.app//api/user/order", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateUserAddress = async (token, addressData) => {
  // addressData = { addressLine1, addressLine2, city, postalCode }
  return await axios.put('https://tohthai.vercel.app//api/user/address', addressData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateCartDeliveryOption = async (token, deliveryData) => {
  // deliveryData = { deliveryMethod: 'DELIVERY' | 'TABLE', tableId: number | null }
  return await axios.put('https://tohthai.vercel.app//api/user/cart/delivery', deliveryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
