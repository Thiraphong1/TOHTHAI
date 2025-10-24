import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// --- Import API Functions ---
import { listCategory } from "../api/Category";

import { listProduct, searchFilters } from "../api/product";

import { createReservation as apiCreateReservation } from "../api/reservation";

import { getAllReservations as apiGetAllReservations, updateReservationStatus as apiUpdateReservationStatus } from "../api/admin";

import { getAllTables as apiGetAllTables } from "../api/table";

const ecomStore = (set, get) => ({
  // --- Core States ---
  user: null,
  token: null,
  categories: [],
  products: [],
  carts: [],

  // --- New States for Reservation System ---
  tables: [],
  reservations: [], // For Admin view
  loading: {
    tables: false,
    reservations: false,
  },
  error: {
    tables: null,
    reservations: null,
  },

  // --- Auth Actions ---
  logout: () => {
    set({
      user: null,
      token: null,
      carts: [],
    });
  },
  actionLogin: async (formData) => {
    const res = await axios.post("http://localhost:3000/api/login", formData);
    set({ user: res.data.payload, token: res.data.token });
    return res;
  },

  // ✅ [เพิ่ม Action นี้] สำหรับอัปเดตข้อมูล User ใน Store โดยตรง
  setUser: (userData) => {
    set((state) => ({
        // ใช้ spread operator (...) เพื่อ merge ข้อมูล user ใหม่กับข้อมูลเดิม (ถ้ามี)
        // และอัปเดตเฉพาะ field ที่ส่งมาใน userData
        user: { ...state.user, ...userData }
    }));
  },

  // --- Cart Actions ---
  actionAddtoCart: (product) => {
    const carts = get().carts;
    const existing = carts.find((item) => item.id === product.id);
    let updatedCart;
    if (existing) {
      updatedCart = carts.map((item) =>
        item.id === product.id
          ? { ...item, count: (item.count || 0) + 1 }
          : item
      );
    } else {
      updatedCart = [...carts, { ...product, count: 1 }];
    }
    set({ carts: updatedCart });
  },
  actionIncCart: (id) => {
    set((state) => ({
      carts: state.carts.map((c) =>
        c.id === id ? { ...c, count: (c.count || 1) + 1 } : c
      ),
    }));
  },
  actionDecCart: (id) => {
    set((state) => ({
      carts: state.carts.map((c) =>
        c.id === id ? { ...c, count: Math.max((c.count || 1) - 1, 1) } : c
      ),
    }));
  },
  actionRemoveFromCart: (id) => {
    set((state) => ({ carts: state.carts.filter((c) => c.id !== id) }));
  },
  clearCart: () => {
    set({ carts: [] });
  },

  // --- Data Fetching Actions ---
  getCategory: async () => {
    try {
      const res = await listCategory();
      set({ categories: res.data });
    } catch (err) {
      console.log("Failed to get categories:", err);
    }
  },
  getProduct: async (count) => {
    try {
      const res = await listProduct(count); // ใช้ listProduct ที่ import มา
      set({ products: res.data });
    } catch (err) {
      console.log("Failed to get products:", err);
    }
  },
  actionSearchFilters: async (arg) => {
    try {
      const res = await searchFilters(arg);
      set({ products: res.data });
    } catch (err) {
      console.log("Failed on search filter:", err);
    }
  },

  // --- New Actions for Reservation System ---

  // (For User/Employee) Fetch all available tables
  fetchTables: async () => {
    try {
      set(state => ({ loading: { ...state.loading, tables: true }, error: { ...state.error, tables: null } }));
      // ✅ [ปรับปรุง] แก้ไข API call ให้ถูกต้อง (API นี้อาจจะต้องการ token)
      const res = await apiGetAllTables(get().token);
      set({ tables: res.data, loading: { ...get().loading, tables: false } });
    } catch (err) {
      console.error("Failed to fetch tables", err);
      set(state => ({ error: { ...state.error, tables: "Failed to fetch tables" }, loading: { ...state.loading, tables: false } }));
    }
  },

  // (For User) Create a new reservation
  createReservation: (reservationData) => {
    return apiCreateReservation(get().token, reservationData);
  },

  // (For Admin) Fetch all reservations
  fetchAllReservations: async () => {
    try {
      set(state => ({ loading: { ...state.loading, reservations: true }, error: { ...state.error, reservations: null } }));
      const res = await apiGetAllReservations(get().token);
      set({ reservations: res.data, loading: { ...get().loading, reservations: false } });
    } catch (err) {
      console.error("Failed to fetch reservations", err);
      set(state => ({ error: { ...state.error, reservations: "Failed to fetch reservations" }, loading: { ...state.loading, reservations: false } }));
    }
  },

  // (For Admin) Update a reservation's status
  updateReservationStatus: async (reservationId, status) => {
    try {
      await apiUpdateReservationStatus(get().token, reservationId, status);
      await get().fetchAllReservations();
      return Promise.resolve();
    } catch (err) {
      console.error("Failed to update reservation status", err);
      return Promise.reject(err);
    }
  },
});

// Configuration for persisting state to localStorage
const usePersist = {
  name: "ecom-storage",
  storage: createJSONStorage(() => localStorage),
};

const useEcomStore = create(persist(ecomStore, usePersist));

export default useEcomStore;