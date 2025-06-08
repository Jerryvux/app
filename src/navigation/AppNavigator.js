// AppNavigator.js
import React, { useRef, useState } from 'react';
import { SafeAreaView, Animated, View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthProvider';
import useNetworkAndAuth from '../hooks/useNetworkAndAuth';
import { login, logout } from '../services/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import Maincontents from '../components/Maincontents';
import styles from '../styles/App.components.style';
import { COLORS } from '../styles/colors';

import StoreScreen from '../screens/StoreScreen';
import VideoScreen from '../screens/VideoScreen';
import MessageScreen from '../screens/MessageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import CategoryProducts from '../screens/CategoryProducts';
import AllProductsScreen from '../screens/AllProductsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import FavoriteProductsScreen from '../screens/FavoriteProductsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import EnterAddressScreen from '../screens/EnterAddressScreen';
import UploadProductScreen from '../screens/UploadProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import MyProductsScreen from '../screens/MyProductsScreen';
import SelectProductVariantScreen from '../screens/SelectProductVariantScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ConversationListScreen from '../screens/ConversationListScreen';
import ShopScreen from '../screens/ShopScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import VouchersScreen from '../screens/VouchersScreen';
import BannerDetailScreen from '../screens/BannerDetailScreen';
import AdminScreen from '../screens/AdminScreen';
import SellerOrderScreen from '../screens/SellerOrderScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const { isLoggedIn, setIsLoggedIn, isConnected, isLoading } = useNetworkAndAuth();
  const headerOffset = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
  });

  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
  };

  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
    if (isCartVisible) {
      Animated.timing(headerOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <StatusBar style="auto" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.safeContainer}>
            {!isConnected && (
              <View style={{ backgroundColor: 'red', padding: 10 }}>
                <Text style={{ color: COLORS.background, textAlign: 'center' }}>
                  Mất kết nối mạng!
                </Text>
              </View>
            )}

            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home">
                {({ navigation }) => (
                  <>
                    <Header
                      onPress={() => navigation.navigate('Home')}
                      onCartPress={toggleCart}
                      navigation={navigation} />
                    {isCartVisible ? <Cart onBack={toggleCart} /> : <Maincontents navigation={navigation} />}
                    {!isCartVisible && <Footer activeTab="Home" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>

              <Stack.Screen name="AllProducts" component={AllProductsScreen} />
              <Stack.Screen name="Cửa hàng">
                {({ navigation }) => (
                  <>
                    <Header onPress={() => navigation.navigate('Home')} onCartPress={toggleCart} navigation={navigation} />
                    {isCartVisible ? <Cart onBack={toggleCart} /> : <StoreScreen navigation={navigation} />}
                    {!isCartVisible && <Footer activeTab="Cửa hàng" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="Cart">
                {({ navigation }) => <Cart onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Video">
                {({ navigation }) => (
                  <>
                    {isCartVisible ? <Cart onBack={toggleCart} /> : <VideoScreen navigation={navigation} />}
                    {!isCartVisible && <Footer activeTab="Video" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="Hộp thư">
                {({ navigation }) => (
                  <>

                    {isCartVisible ? <Cart onBack={toggleCart} /> : <MessageScreen navigation={navigation} />}
                    {!isCartVisible && <Footer activeTab="Hộp thư" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="Hồ sơ">
                {({ navigation }) => (
                  <>
                    {isCartVisible ? (
                      <Cart onBack={toggleCart} />
                    ) : isLoggedIn ? (
                      <ProfileScreen navigation={navigation}
                        onLogout={() => {
                          handleLogout();
                          navigation.navigate('Hồ sơ');
                        }} />
                    ) : (
                      <LoginScreen
                        setIsLoggedIn={setIsLoggedIn}
                        onLoginSuccess={() => {
                          setIsLoggedIn(true);
                          navigation.navigate('Hồ sơ');
                        }}
                      />
                    )}
                    {!isCartVisible && <Footer activeTab="Hồ sơ" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="CategoryProducts">
                {({ navigation, route }) => (
                  <>
                    <Header onPress={() => navigation.navigate('Home')} onCartPress={toggleCart} navigation={navigation} />
                    {isCartVisible ? (
                      <Cart onBack={toggleCart} />
                    ) : (
                      <CategoryProducts navigation={navigation} route={route} />
                    )}
                    {!isCartVisible && <Footer activeTab="Cửa hàng" setActiveTab={(tab) => navigation.navigate(tab)} />}
                  </>
                )}
              </Stack.Screen>
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="OrderList" component={OrderListScreen} />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
              <Stack.Screen name="FavoriteProducts" component={FavoriteProductsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Đổi mật khẩu' }} />
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="EnterAddress" component={EnterAddressScreen} />
              <Stack.Screen name="UploadProductScreen" component={UploadProductScreen} />
              <Stack.Screen name="EditProduct" component={EditProductScreen} />
              <Stack.Screen name="MyProduct" component={MyProductsScreen} />
              <Stack.Screen name="SelectProduct" component={SelectProductVariantScreen} options={{ title: 'Chọn sản phẩm' }} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="ConversationList" component={ConversationListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Shop" component={ShopScreen} />
              <Stack.Screen name="SearchResult" component={SearchResultScreen} options={{ title: 'Kết quả tìm kiếm' }} />
              <Stack.Screen name="Vouchers" component={VouchersScreen} />
              <Stack.Screen name="BannerDetail" component={BannerDetailScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Bảng điều khiển Admin' }} />
              <Stack.Screen name="SellerOrder" component={SellerOrderScreen} options={{ title: 'Quản lý đơn hàng' }} />
              <Stack.Screen
                name="Terms"
                component={TermsScreen}
                options={{
                  title: 'Điều khoản dịch vụ',
                  headerStyle: {
                    backgroundColor: COLORS.primary,
                  },
                  headerTintColor: COLORS.white,
                }}
              />
              <Stack.Screen
                name="Privacy"
                component={PrivacyScreen}
                options={{
                  title: 'Chính sách bảo mật',
                  headerStyle: {
                    backgroundColor: COLORS.primary,
                  },
                  headerTintColor: COLORS.white,
                }}
              />

            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
};

export default AppNavigator;
