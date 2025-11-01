import axios from "axios"

export const getAllTables = async (token) => {
  return await axios.get('https://tohthai.vercel.app//api/tables', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateTableStatus = async (token, tableId, status) => {
    return  await axios.put(`https://tohthai.vercel.app//api/${tableId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};