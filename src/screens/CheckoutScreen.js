import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';
import { COLORS } from '../styles/colors';
import { getVouchers } from '../data/api';
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from '../context/AuthProvider';

const FALLBACK_VOUCHERS = [
  {
    id: 'SHOPEE_VOUCHER',
    code: 'SHOPEE_VOUCHER',
    discountValue: 10000,
    isPercent: false,
    description: 'Giảm giá cho lần đầu'
  }
];

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, address: initialAddress, fromCart, cartItems, totalPrice } = route.params;
  const { cartItems: contextCartItems, clearCart, removeFromCart } = useContext(CartContext);
  const [address, setAddress] = useState(initialAddress);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVouchersData = async () => {
      try {
        setLoading(true);
        const fetchedVouchers = await getVouchers();

        const processedVouchers = fetchedVouchers.map(voucher => ({
          id: voucher.id || `generated_${Math.random().toString(36).substr(2, 9)}`,
          code: voucher.code || `SHOPEE_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          discountValue: Math.max(0, Math.min(voucher.discountValue || 0, 500000)),
          isPercent: !!voucher.isPercent,
          description: voucher.description || 'Khuyến mãi Shopeeline',
          expirationDate: voucher.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }));

        const sortedVouchers = processedVouchers.sort((a, b) => {
          if (a.isPercent && !b.isPercent) return -1;
          if (!a.isPercent && b.isPercent) return 1;
          return b.discountValue - a.discountValue;
        });

        const finalVouchers = sortedVouchers.length > 0
          ? sortedVouchers
          : FALLBACK_VOUCHERS;

        setVouchers(finalVouchers);

        await AsyncStorage.setItem('cachedVouchers', JSON.stringify(finalVouchers));
        console.log('CheckoutScreen: Vouchers state after setting:', finalVouchers);
      } catch (error) {
        console.error('Voucher Fetch Error:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setVouchers([]);
        setLoading(false);
      }
    };

    fetchVouchersData();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && vouchers.length === 0) {
        fetchVouchersData();
      }
    });

    return () => unsubscribe();
  }, []);

  const calculatedTotal = fromCart
    ? contextCartItems?.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
    : product?.price * (product?.quantity || 1);

  const finalTotalPrice = Math.max((totalPrice || calculatedTotal) - discountAmount, 0);


  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.updatedAddress) {
        setAddress(route.params.updatedAddress);
      }
      if (route.params?.selectedVoucher) {
        setSelectedVoucher(route.params.selectedVoucher);
      }
      if (route.params?.discountAmount !== undefined) {
        setDiscountAmount(route.params.discountAmount);
      }
    }, [route.params?.updatedAddress, route.params?.selectedVoucher, route.params?.discountAmount])
  );

  const applyVoucher = (voucher) => {
    if (!voucher) {
      Alert.alert('Lỗi', 'Voucher không hợp lệ');
      return;
    }

    if (selectedVoucher?.id === voucher.id && discountAmount > 0) {
      Alert.alert('Thông báo', 'Voucher này đã được áp dụng');
      return;
    }

    setDiscountAmount(0);
    setSelectedVoucher(null);

    let discount = 0;
    const currentTotal = fromCart
      ? contextCartItems?.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
      : product?.price * (product?.quantity || 1);
    if (voucher.isPercent) {
      const safePercentage = Math.min(Math.max(voucher.discountValue, 0), 100);
      discount = currentTotal * (safePercentage / 100);

      const MAX_PERCENT_DISCOUNT = 50;
      discount = Math.min(discount, currentTotal * (MAX_PERCENT_DISCOUNT / 100));
    }
    else {
      discount = Math.min(voucher.discountValue, currentTotal);

      const MIN_PURCHASE = 100000;
      if (currentTotal < MIN_PURCHASE) {
        Alert.alert(
          'Điều Kiện Áp Dụng',
          `Voucher chỉ áp dụng cho đơn hàng từ ${MIN_PURCHASE.toLocaleString()}đ trở lên`
        );
        return;
      }
    }

    if (discount < 1000) {
      Alert.alert('Thông báo', 'Voucher không đủ giá trị để áp dụng');
      return;
    }
    setSelectedVoucher(voucher);
    setDiscountAmount(Math.round(discount));

    Alert.alert(
      'Áp Dụng Voucher',
      `Bạn đã được giảm ${Math.round(discount).toLocaleString()}đ`,
      [{ text: 'OK' }]
    );
  };

  const handlePlaceOrder = async () => {
    if (!address || !address.detail) {
      Alert.alert('Vui lòng nhập địa chỉ trước khi đặt hàng!');
      return;
    }

    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng');
      return;
    }

    const products = fromCart ? cartItems : [product];

    const newOrder = {
      id: Date.now(),
      userId: user.id,
      products,
      address,
      totalPrice: finalTotalPrice,
      date: new Date().toISOString(),
      status: 'Chờ xử lý',
    };

    try {
      const existingOrders = await AsyncStorage.getItem('myOrders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];

      orders.push(newOrder);
      await AsyncStorage.setItem('myOrders', JSON.stringify(orders));

      if (fromCart) {
        clearCart();
      }

      Alert.alert('🎉 Đặt hàng thành công!', 'Cảm ơn bạn đã mua sắm tại Shopee 😍', [
        {
          text: 'Tiếp tục mua sắm',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu đơn hàng.');
      console.error('Lưu đơn hàng lỗi:', error);
    }
  };

  const handleEditAddress = () => {
    navigation.navigate('EnterAddress', {
      fromCart,
      cartItems,
      product,
      totalPrice,
      address,
      fromCheckout: true,
      selectedVoucher,
      discountAmount,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.section} onPress={handleEditAddress}>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
        </View>
        {address && address.detail ? (
          <>
            <Text style={styles.addressName}>
              {address.name || 'Nguyễn Văn A'} | {address.phone || '0901234567'}
            </Text>
            <Text style={styles.addressDetail}>{address.detail}</Text>
          </>
        ) : (
          <Text style={{ color: '#888' }}>Chạm để nhập địa chỉ giao hàng</Text>
        )}
      </TouchableOpacity>

      <View style={styles.section}>
        {(fromCart ? cartItems : [product]).map((item, index) => (
          <View style={styles.productRow} key={index}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>
                Màu: {item.color || 'Không chọn'}, Size: {item.size || 'Không chọn'}
              </Text>
              <Text style={styles.info}>Số lượng: {item.quantity || 1}</Text>
              <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Feather name="credit-card" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        </View>
        <Text style={styles.info}>Thanh toán khi nhận hàng (COD)</Text>
      </View>
      {vouchers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.row}>
            <Ionicons name="ticket-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Voucher</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.voucherScrollContainer}
          >
            {vouchers.map((voucher) => {
              const potentialDiscount = voucher.isPercent
                ? `Giảm ${voucher.discountValue}%`
                : `Giảm ${voucher.discountValue.toLocaleString()}đ`;

              return (
                <TouchableOpacity
                  key={voucher.id}
                  style={[
                    styles.voucherCard,
                    selectedVoucher?.id === voucher.id && styles.selectedVoucherCard
                  ]}
                  onPress={() => applyVoucher(voucher)}
                >
                  <View style={styles.voucherHeader}>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    {typeof voucher.id === 'string' && voucher.id.startsWith('fallback_') && (
                      <Text style={styles.fallbackBadge}>Offline</Text>
                    )}
                  </View>
                  <Text style={styles.voucherDesc}>{potentialDiscount}</Text>
                  <Text style={styles.voucherDescription} numberOfLines={2}>
                    {voucher.description}
                  </Text>
                  {selectedVoucher?.id === voucher.id && (
                    <View style={styles.selectedOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.totalBox}>
        <View>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.originalPrice}>
            {(totalPrice || calculatedTotal).toLocaleString('vi-VN')}đ
          </Text>
        </View>
        {selectedVoucher && (
          <View>
            <Text style={styles.discountLabel}>Giảm giá:</Text>
            <Text style={styles.discountAmount}>
              -{discountAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        )}
        <View>
          <Text style={styles.totalLabel}>Thanh toán:</Text>
          <Text style={styles.totalAmount}>
            {finalTotalPrice.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
        <Text style={styles.orderText}>ĐẶT HÀNG</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  section: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.searchBackground,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressDetail: {
    fontSize: 14,
    color: '#555',
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  totalBox: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.black,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.red,
  },
  orderButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  voucherScrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  voucherCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    width: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedVoucherCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f6ff',
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  voucherCode: {
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 16,
  },
  voucherDesc: {
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  voucherDescription: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  discountLabel: {
    color: 'green',
    fontSize: 14,
  },
  discountAmount: {
    color: 'green',
    fontWeight: 'bold',
  },
  fallbackBadge: {
    backgroundColor: '#ff0000',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
});
