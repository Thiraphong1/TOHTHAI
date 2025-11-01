import axios from "axios"

export const getOrdersAdmin = async (token) => {
    return await axios.get('https://tohthai.vercel.app/api/admin/orders', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const getListAllUser = async (token) => {
    return await axios.get('https://tohthai.vercel.app/api/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}
export const changeUserStatus = async (token, data) => {
  return await axios.put(
    "https://tohthai.vercel.app/api/change-status",
    data, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const changeUserRole = async (token, data) => {
  return await axios.put(
    `https://tohthai.vercel.app/api/change-role`,
    data, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // เพิ่มให้ชัดเจน
      },
    }
  );
};
export const getAllReservations = async (token) => {
  return await axios.get('https://tohthai.vercel.app/api/reservations', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const updateReservationStatus = async (token, reservationId, status) => {
  // status = "CONFIRMED" หรือ "CANCELLED"
  return await axios.put(`https://tohthai.vercel.app/api/reservations/${reservationId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getDashboardSummaryToday = async (token) => {
  return await axios.get('https://tohthai.vercel.app/api/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getOrderTypeStatsToday = async (token) => {
  return await axios.get('https://tohthai.vercel.app/api/statstoday', {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getTopSellingProducts = async (token, period = 'week', limit = 5) => {
  // ส่ง period และ limit เป็น query params
  return await axios.get(`https://tohthai.vercel.app/api/topselling?period=${period}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};