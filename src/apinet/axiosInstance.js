import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use the correct URL based on platform
const BASE_URL = Platform.select({
  ios: 'http://localhost:8888/api',
  android: 'http://10.0.2.2:8888/api',
  default: 'http://localhost:8888/api'
});

console.log('Using BASE_URL:', BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/auth/profile'),
};

// Product API
export const productAPI = {
  getAll: () => axiosInstance.get('/products'),
  getById: (id) => axiosInstance.get(`/products/${id}`),
  getByCategory: (categoryId) => axiosInstance.get(`/products/category/${categoryId}`),
  search: (query) => axiosInstance.get(`/products/search?q=${query}`),
  create: (product) => axiosInstance.post('/products', product),
  update: (id, product) => axiosInstance.put(`/products/${id}`, product),
  delete: (id) => axiosInstance.delete(`/products/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => axiosInstance.get('/categories'),
  getById: (id) => axiosInstance.get(`/categories/${id}`),
  create: (category) => axiosInstance.post('/categories', category),
  update: (id, category) => axiosInstance.put(`/categories/${id}`, category),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};

// Banner API
export const bannerAPI = {
  getAll: () => axiosInstance.get('/banners'),
  getById: (id) => axiosInstance.get(`/banners/${id}`),
  create: (banner) => axiosInstance.post('/banners', banner),
  update: (id, banner) => axiosInstance.put(`/banners/${id}`, banner),
  delete: (id) => axiosInstance.delete(`/banners/${id}`),
};

// Order API
export const orderAPI = {
  getAll: () => axiosInstance.get('/orders'),
  getById: (id) => axiosInstance.get(`/orders/${id}`),
  create: (order) => axiosInstance.post('/orders', order),
  update: (id, order) => axiosInstance.put(`/orders/${id}`, order),
  delete: (id) => axiosInstance.delete(`/orders/${id}`),
};

// Message API
export const messageAPI = {
  getAll: () => axiosInstance.get('/messages'),
  getById: (id) => axiosInstance.get(`/messages/${id}`),
  create: (message) => axiosInstance.post('/messages', message),
  update: (id, message) => axiosInstance.put(`/messages/${id}`, message),
  delete: (id) => axiosInstance.delete(`/messages/${id}`),
};

export default axiosInstance;