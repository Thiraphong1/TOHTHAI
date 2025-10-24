import axios from "axios";

export const createProduct = async (token, form) => {
  return await axios.post("http://localhost:3000/api/product", form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const listProduct = async (count = 20) => {
  // ถูกต้อง: URL จะกลายเป็น /products?count=20
  return axios.get(`http://localhost:3000/api/products?count=${count}`);
};

export const uploadFiles = async (token, body) => {
  // body ต้องเป็น { image: '<data-url-or-base64>' }
  return await axios.post(
    'http://localhost:3000/api/images',
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',   // สำคัญ!
      },
    }
  );
};
export const removeFiles = async (token, public_id) => {
  // code
  // console.log('form api frontent', form)
  return axios.post(
    "http://localhost:3000/api/removeimages",
    {
      public_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const readProduct = async (token, id) => {
  return await axios.get(`http://localhost:3000/api/product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateProduct = async (token, id, form) => {
  return await axios.put(`http://localhost:3000/api/product/${id}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteProduct = async (token, id) => {
  return await axios.delete(`http://localhost:3000/api/product/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const searchFilters = async (arg) => {
  return await axios.post(`http://localhost:3000/api/search/filters`, arg)
};

export const listProductsBy = async (sort, order, limit) => {
  // URL จะเป็น /products?sort=price&order=desc&limit=5
  return await axios.get(
    `http://localhost:3000/api/products?sort=${sort}&order=${order}&limit=${limit}`
  );
};