import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../data/api';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      return {
        success: true,
        token: response.data.token,
        user: response.data.user
      };
    }
    return { success: false };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
  }
};