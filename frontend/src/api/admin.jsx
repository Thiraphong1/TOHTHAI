import axios from "axios"

export const getOrdersAdmin = async (token) => {
    return await axios.get('http://localhost:3000/api/admin/orders', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const getListAllUser = async (token) => {
    return await axios.get('http://localhost:3000/api/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const changeUserStatus = async (token, value) => {
  return await axios.post(
    "http://localhost:3000/api/change-status",
    value, // value = { id, enabled }
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const changeUserRole = async (token, data) => {
  return await axios.post(
    `http://localhost:3000/api/change-role`,
    data, // data = {id, role}
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // เพิ่มให้ชัดเจน
      },
    }
  );
};