import React, { createContext, useState, useEffect } from 'react';
import api from '../apinet/netapi';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        const [prodRes, catRes, bannerRes] = await Promise.all([
          api.getAllProducts(),
          api.getAllCategories(),
          api.getAllBanners(),
        ]);

        console.log('Raw product data from API:', JSON.stringify(prodRes?.data, null, 2));

        // Xử lý dữ liệu sản phẩm để thêm userId
        const processedProducts = (prodRes?.data || []).map(product => ({
          ...product,
          userId: product.userId || product.id, // Sử dụng userId hoặc id của sản phẩm nếu không có userId
          sellerName: product.userName,
          sellerAvatar: product.sellerAvatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a8002896da71882a3.jpg',
          sellerOnline: product.sellerOnline || false
        }));

        setProducts(processedProducts);
        setCategories(catRes?.data || []);
        setBanners(bannerRes?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setProducts([]);
        setCategories([]);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const addProduct = (product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        banners,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
