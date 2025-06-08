import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:8888/api',
  android: 'http://10.0.2.2:8888/api',
  default: 'http://localhost:8888/api'
});

console.log('Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    if (config.url && !config.url.startsWith('/auth/')) {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
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
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('Login attempt with:', credentials);
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      console.log('Login response:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        console.log('Token saved after login:', response.data.token);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      console.log('Register attempt with:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data);
      return response;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);

      if (error.response && error.response.data) {
        if (error.response.data === "Email đã tồn tại") {
          throw new Error("Email đã được sử dụng. Vui lòng sử dụng email khác.");
        } else if (error.response.data === "Mật khẩu phải có ít nhất 6 ký tự") {
          throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
        }
      }

      throw error;
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      return api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};

export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByUserId: (userId) => api.get('/products', { params: { user_id: userId } }),
  getByUser: (userId) => api.get(`/products/user/${userId}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  search: (query) => api.get(`/products/search?q=${query}`),
  getColors: (id) => api.get(`/products/${id}/colors`),
  getSizes: (id) => api.get(`/products/${id}/sizes`),
  getSellerInfo: (sellerId) => api.get(`/sellers/${sellerId}/info`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  getByUUID: (uuid) => api.get(`/products/uuid/${uuid}`),
  delete: (id) => api.delete(`/products/${id}`),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (userId, sellerId) => api.get(`/messages/${userId}/${sellerId}`),
  getConversations: () => api.get('/conversations'),
  deleteMessage: (conversationId, messageId) => api.delete(`/conversations/${conversationId}/messages/${messageId}`)
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`)
};

export const bannerAPI = {
  getAll: () => api.get('/banners'),
  getById: (id) => api.get(`/banners/${id}`)
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (productId) => api.post('/users/favorites', { productId }),
  removeFavorite: (productId) => api.delete(`/users/favorites/${productId}`)
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

export const messageAPI = {
  getAll: () => api.get('/messages'),
  getUnread: () => api.get('/messages/unread'),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`)
};
export const getVouchers = async () => {
  try {
    const response = await api.get('/vouchers/available');
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy vouchers:', error);
    return [];
  }
};

export const getBannerDetails = async (bannerId) => {
  try {
    const response = await api.get(`/banners/${bannerId}/details`);
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy chi tiết banner:', error);
    throw error;
  }
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/status`),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),

  getAllPolicies: () => api.get('/policies'),
  createPolicy: (policyData) => api.post('/policies', policyData),
  togglePolicyStatus: (policyId) => api.patch(`/policies/${policyId}/toggle`),
  sendMessageToUser: (messageData) => api.post('/admin/messages', messageData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  createUser: (userData) => api.post('/auth/register', userData),

  getAllCategories: () => api.get('/categories'),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (categoryId, categoryData) => api.put(`/categories/${categoryId}`, categoryData),
  deleteCategory: (categoryId) => api.delete(`/categories/${categoryId}`),

  getAllVouchers: () => api.get('/vouchers/available'),
  createVoucher: (voucherData) => api.post('/admin/vouchers', voucherData),
  updateVoucher: (voucherId, voucherData) => api.put(`/admin/vouchers/${voucherId}`, voucherData),
  deleteVoucher: (voucherId) => api.delete(`/admin/vouchers/${voucherId}`)
};

export default api;

// Banner
export const getAllBanners = () => api.get('/banners');

// Cart
export const getCartByUser = (userId) =>
  api.get(`/cart/${userId}`);

export const addToServerCart = (userId, productId) =>
  api.post('/cart/add', { userId, productId });

export const removeFromServerCart = (userId, productId) =>
  api.delete('/cart/remove', {
    data: { userId, productId },
  });

export const updateCartQuantity = (userId, productId, quantity) =>
  api.put('/cart/update', { userId, productId, quantity });

export const clearCartAPI = (userId) =>
  api.delete(`/cart/clear/${userId}`);

// USER
export const getUserProfile = (userId) =>
  api.get(`/users/${userId}`);

export const updateUserProfile = (userId, updatedData) =>
  api.put(`/users/${userId}`, updatedData);

// PRODUCT
export const createProduct = (product) =>
  api.post('/products', product);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

// CATEGORY
export const getAllCategories = () =>
  api.get('/categories');

// ORDER
export const getOrdersByUser = (userId) =>
  api.get('/orders', { params: { userId } });

// MESSAGES
export const getMessagesByUser = (userId) =>
  api.get('/messages', { params: { userId } });

// VIDEOS - Thêm API endpoint để lấy tất cả video
export const getAllVideos = () => api.get('/videos');

// CONVERSATION APIS
// Lấy tất cả cuộc hội thoại của người dùng
export const getUserConversations = () => {
  return api.get('/conversations');
};

// Lấy chi tiết một cuộc hội thoại
export const getConversation = (conversationId) => {
  return api.get(`/conversations/${conversationId}`);
};

// Lấy tin nhắn của một cuộc hội thoại
export const getConversationMessages = (conversationId) => {
  return api.get(`/conversations/${conversationId}/messages`);
};

// Gửi tin nhắn mới
export const sendMessage = (conversationId, message) => {
  return api.post(`/conversations/${conversationId}/messages`, { message });
};

// Tạo cuộc hội thoại mới với người bán
export const createConversation = (sellerId, productId) => {
  return api.post('/conversations', {
    sellerId, productId, buyerId,
    message: "Khởi tạo cuộc trò chuyện"
  });
};

// Tìm hoặc tạo cuộc hội thoại
export const getOrCreateConversation = (buyerId, sellerId, productId) => {
  return api.post('/conversations', {
    sellerId,
    productId
  });
};

export const markMessagesAsRead = (conversationId) => {
  return api.put(`/conversations/${conversationId}/read`);
};

const chatAPIs = {
  getUserConversations,
  getConversation,
  getConversationMessages,
  sendMessage,
  createConversation,
  markMessagesAsRead,
  getAllVideos,
  deleteMessage: (conversationId, messageId) => api.delete(`/conversations/${conversationId}/messages/${messageId}`)
};

Object.assign(api, chatAPIs);
