import axios from "axios"

export const getAllTables = async (token) => {
  return await axios.get('http://localhost:3000/api/tables', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateTableStatus = async (token, tableId, status) => {
    return  await axios.put(`http://localhost:3000/api/${tableId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};