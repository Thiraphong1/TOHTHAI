import axios from "axios"

export const getAllTables = async (token) => {
  return await axios.get('https://tohthaibackend.vercel.app/api/tables', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateTableStatus = async (token, tableId, status) => {
    return  await axios.put(`https://tohthaibackend.vercel.app/api/${tableId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};