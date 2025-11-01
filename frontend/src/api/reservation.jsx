import axios from "axios";

// --- สำหรับ User ---
export const listTables = async () => {
  return await axios.get('https://tohthai.vercel.app//api/tables');
  
};

export const createReservation = async (token, reservationData) => {
  // reservationData = { tableId, reservationTime, numberOfGuests }
  return await axios.post('https://tohthai.vercel.app//api/reservation', reservationData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getAvailableTables = async () => {
  return await axios.get('https://tohthai.vercel.app//api/tables');
};


export const getCurrentTableStatus = async () => {
  // ไม่ต้องใช้ Token เพราะเป็น Public
  return await axios.get('https://tohthai.vercel.app//api/tables/current-status');
};
