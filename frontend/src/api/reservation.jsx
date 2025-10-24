import axios from "axios";

// --- สำหรับ User ---
export const listTables = async () => {
  return await axios.get('http://localhost:3000/api/tables');
  
};

export const createReservation = async (token, reservationData) => {
  // reservationData = { tableId, reservationTime, numberOfGuests }
  return await axios.post('http://localhost:3000/api/reservation', reservationData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getAvailableTables = async () => {
  return await axios.get('http://localhost:3000/api/tables');
};


export const getCurrentTableStatus = async () => {
  // ไม่ต้องใช้ Token เพราะเป็น Public
  return await axios.get('http://localhost:3000/api/tables/current-status');
};
