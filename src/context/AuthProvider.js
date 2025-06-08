import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { authAPI } from '../data/api';
import axios from 'axios'; // Import axios to check for axios errors

// Add Axios interceptor
axios.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.url && !config.url.startsWith('/api/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Clear existing token first
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');

      const response = await authAPI.login({ email, password });
      
      if (!response.data || !response.data.token) {
        throw new Error('Không nhận được token từ server');
      }

      const { token, user } = response.data;
      
      // Save token and user data
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setIsLoggedIn(true);
      
      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        error.message || 
                        'Có lỗi xảy ra khi đăng nhập';
      
      if (errorMessage === 'Email không tồn tại') {
        errorMessage = 'Email chưa được đăng ký. Vui lòng đăng ký trước.';
      } else if (errorMessage === 'Invalid email or password') {
        errorMessage = 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại!';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('AuthProvider - Attempting logout.');
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsLoggedIn(false);
      console.log('AuthProvider - User logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      console.log('AuthProvider - Logout error:', error.message);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      console.log('AuthProvider - Initializing...');
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userDataJson = await AsyncStorage.getItem('userData');
        let loadedUser = null;
        if (userDataJson) {
          try {
            loadedUser = JSON.parse(userDataJson);
            setUser(loadedUser);
            console.log('AuthProvider - User data loaded from AsyncStorage on init:', loadedUser?.id);
          } catch (parseError) {
            console.error('AuthProvider - Error parsing user data from AsyncStorage on init:', parseError);
            await AsyncStorage.removeItem('userData'); // Clear invalid data
          }
        }
        setIsLoggedIn(!!token);
        console.log('AuthProvider - Initial state set:', { isLoggedIn: !!token, user: loadedUser !== null ? loadedUser?.id : 'Null' });
        const netInfo = await NetInfo.fetch();
        setIsConnected(netInfo.isConnected);
      } catch (error) {
        console.error('Lỗi khi khởi tạo AuthContext:', error);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider - Initialization finished.');
      }
    };

    // Load initial data on mount
    initialize();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
    // Depend on isLoggedIn to re-check user data when login status changes
  }, [isLoggedIn]);

  // Effect to load user data if isLoggedIn becomes true and user is null
  useEffect(() => {
    if (isLoggedIn && !user && !isLoading) { // Only run if logged in, user is null, and not during initial load
      console.log('AuthProvider - isLoggedIn is true but user is null, attempting to load from AsyncStorage (secondary effect).');
      const loadUserData = async () => {
        try {
          const userDataJson = await AsyncStorage.getItem('userData');
          if (userDataJson) {
            const parsedUser = JSON.parse(userDataJson);
            setUser(parsedUser);
            console.log('AuthProvider - User data loaded in secondary effect:', parsedUser?.id);
          } else {
            console.warn('AuthProvider - Logged in but no user data in AsyncStorage in secondary effect. Logging out.');
            // This case should ideally not happen if login saves correctly
            // Consider logging out user if token exists but no user data
             logout(); // Log out user if inconsistency detected
          }
        } catch (error) {
          console.error('AuthProvider - Error loading user data in secondary effect:', error);
        }
      };
      loadUserData();
    }
  }, [isLoggedIn, user, isLoading, logout]); // Depend on isLoggedIn, user, isLoading, and logout

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      isConnected, 
      isLoading, 
      user, 
      setUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
