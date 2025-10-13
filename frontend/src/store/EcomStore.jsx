import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/Category";
import { listProduct, searchFilters } from "../api/product";
import _ from "lodash";

const ecomStore = (set, get) => ({
  user: null,
  token: null,
  categories: [],
  products: [],
  carts: [],
  logout : () => {
    set({
      user: null,
      token: null,
      categories: [],
      products: [],
      carts: [],
    })



  },
  

  //  เพิ่มสินค้าเข้าตะกร้า
  actionAddtoCart: (product) => {
  const carts = get().carts;
  const existing = carts.find((item) => item.id === product.id);

  let updatedCart;
  if (existing) {
    updatedCart = carts.map((item) =>
      item.id === product.id
        ? { ...item, count: item.count + 1 } // ใช้ count
        : item
    );
  } else {
    updatedCart = [...carts, { ...product, count: 1 }]; // เริ่มต้น count = 1
  }

  set({ carts: updatedCart });
},

  // ✅ ปรับจำนวนสินค้า
  actionIncCart: (id) => {
    const carts = get().carts || [];
    set({
      carts: carts.map((c) =>
        c.id === id ? { ...c, count: (c.count || 1) + 1 } : c
      ),
    });
  },

  actionDecCart: (id) => {
    const carts = get().carts || [];
    set({
      carts: carts.map((c) =>
        c.id === id ? { ...c, count: Math.max((c.count || 1) - 1, 1) } : c
      ),
    });
  },

  actionSetCartCount: (id, count) => {
    const qty = Math.max(parseInt(count || 1, 10), 1);
    const carts = get().carts || [];
    set({
      carts: carts.map((c) => (c.id === id ? { ...c, count: qty } : c)),
    });
  },

  actionRemoveFromCart: (id) => {
    const carts = get().carts || [];
    set({ carts: carts.filter((c) => c.id !== id) });
  },

  // ✅ Auth
  actionLogin: async (formData) => {
    const res = await axios.post("http://localhost:3000/api/login", formData);
    set({
      user: res.data.payload,
      token: res.data.token,
    });
    return res;
  },

  // ✅ Category
  getCategory: async () => {
    try {
      const res = await listCategory();
      set({ categories: res.data });
    } catch (err) {
      console.log(err);
    }
  },

  // ✅ Product
  getProduct: async (count) => {
    try {
      const res = await listProduct(count);
      set({ products: res.data });
    } catch (err) {
      console.log(err);
    }
  },

  // ✅ Search
  actionSearchFilters: async (arg) => {
    try {
      const res = await searchFilters(arg);
      set({ products: res.data });
    } catch (err) {
      console.log(err);
    }
  },
  clearCart : () => {
    set({ carts: [] });
  }
});

const usePersist = {
  name: "ecom-storage",
  storage: createJSONStorage(() => localStorage),
};

const useEcomStore = create(persist(ecomStore, usePersist));

export default useEcomStore;
