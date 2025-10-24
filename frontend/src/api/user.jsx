import axios from "axios";

export const createUserCart = async (token, cart) => {
  // code body
  return axios.post("http://localhost:3000/api/user/cart", cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const listUserCart = async (token) => {
  // code body
  return axios.get("http://localhost:3000/api/user/cart",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const saveOrder = async (token,payload) => {
  // code body
  return axios.post("http://localhost:3000/api/user/order", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getOrders = async (token) => {
  // code body
  return axios.get("http://localhost:3000/api/user/order", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateUserAddress = async (token, addressData) => {
  // addressData = { addressLine1, addressLine2, city, postalCode }
  return await axios.put('http://localhost:3000/api/user/address', addressData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateCartDeliveryOption = async (token, deliveryData) => {
  // deliveryData = { deliveryMethod: 'DELIVERY' | 'TABLE', tableId: number | null }
  return await axios.put('http://localhost:3000/api/user/cart/delivery', deliveryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
