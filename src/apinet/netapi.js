import axiosInstance from './axiosInstance';

const api = {
  // Auth APIs
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/auth/profile'),

  // Product APIs
  getAllProducts: () => axiosInstance.get('/products'),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  createProduct: (data) => axiosInstance.post('/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`),
  importProducts: (formData) => axiosInstance.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // Category APIs
  getAllCategories: () => axiosInstance.get('/categories'),
  getCategoryById: (id) => axiosInstance.get(`/categories/${id}`),
  createCategory: (data) => axiosInstance.post('/categories', data),
  updateCategory: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  deleteCategory: (id) => axiosInstance.delete(`/categories/${id}`),

  // Banner APIs
  getAllBanners: () => axiosInstance.get('/banners'),
  getBannerById: (id) => axiosInstance.get(`/banners/${id}`),
  createBanner: (data) => axiosInstance.post('/banners', data),
  updateBanner: (id, data) => axiosInstance.put(`/banners/${id}`, data),
  deleteBanner: (id) => axiosInstance.delete(`/banners/${id}`),

  // Order APIs
  getAllOrders: () => axiosInstance.get('/orders'),
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  createOrder: (data) => axiosInstance.post('/orders', data),
  updateOrder: (id, data) => axiosInstance.put(`/orders/${id}`, data),
  deleteOrder: (id) => axiosInstance.delete(`/orders/${id}`),

  // Cart APIs
  getCart: () => axiosInstance.get('/cart'),
  addToCart: (productId, quantity) => axiosInstance.post('/cart/add', { productId, quantity }),
  updateCartItem: (itemId, quantity) => axiosInstance.put(`/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => axiosInstance.delete(`/cart/items/${itemId}`),
  clearCart: () => axiosInstance.delete('/cart/clear'),

  // Message APIs
  getAllMessages: () => axiosInstance.get('/messages'),
  getMessageById: (id) => axiosInstance.get(`/messages/${id}`),
  createMessage: (data) => axiosInstance.post('/messages', data),
  updateMessage: (id, data) => axiosInstance.put(`/messages/${id}`, data),
  deleteMessage: (id) => axiosInstance.delete(`/messages/${id}`),
  markMessageAsRead: (id) => axiosInstance.put(`/messages/${id}/read`),

  // Video APIs
  getAllVideos: () => axiosInstance.get('/videos'),
  getVideoById: (id) => axiosInstance.get(`/videos/${id}`),

  // Conversation APIs
  getUserConversations: () => axiosInstance.get('/conversations'),
  getConversation: (conversationId) => axiosInstance.get(`/conversations/${conversationId}`),
  getConversationMessages: (conversationId) => axiosInstance.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, message) => axiosInstance.post(`/conversations/${conversationId}/messages`, { message }),
  createConversation: (sellerId, productId) => axiosInstance.post('/conversations', { sellerId, productId }),
  markMessagesAsRead: (conversationId) => axiosInstance.put(`/conversations/${conversationId}/read`)


};
export const getUserConversations = api.getUserConversations;
export const getConversation = api.getConversation;
export const getConversationMessages = api.getConversationMessages;
export const sendMessage = api.sendMessage;
export const createConversation = api.createConversation;
export const markMessagesAsRead = api.markMessagesAsRead;
export const getAllVideos = api.getAllVideos;

export const getProductVariants = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}/variants`);
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy biến thể sản phẩm:', error);
    return {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Đen', 'Trắng', 'Xanh', 'Đỏ']
    };
  }
};

export const createProductReview = async (productId, reviewData) => {
  try {
    const response = await axiosInstance.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Lỗi tạo đánh giá:', error);
    throw error;
  }
};

export default api;