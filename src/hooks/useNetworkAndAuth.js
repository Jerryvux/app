import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const useNetworkAndAuth = () => {
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    setIsLoggedInState(!!userToken);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuth();
        const netInfo = await NetInfo.fetch();
        setIsConnected(netInfo.isConnected);
      } catch (error) {
        console.error('Lỗi khởi tạo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [checkAuth]);

  const setIsLoggedIn = async (value) => {
    if (value) {
    } else {
      await AsyncStorage.removeItem('userToken');
    }
    await checkAuth();
  };

  return { isLoggedIn, setIsLoggedIn, isConnected, isLoading };
};

export default useNetworkAndAuth;