import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { useAuth } from '../context/AuthProvider';
import globalStyles from '../styles/globalStyles';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleCancelOrder = async (orderId) => {
    try {
      const json = await AsyncStorage.getItem('myOrders');
      let loadedOrders = json ? JSON.parse(json) : [];

      loadedOrders = loadedOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: 'Đã hủy' };
        }
        return order;
      });

      await AsyncStorage.setItem('myOrders', JSON.stringify(loadedOrders));
      setOrders(loadedOrders.filter(order => order.userId === user?.id));
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const json = await AsyncStorage.getItem('myOrders');
        let loadedOrders = json ? JSON.parse(json) : [];

        loadedOrders = loadedOrders.map((order) => ({
          ...order,
          cartItems: order.cartItems
            ? order.cartItems
            : order.products
              ? order.products.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image,
              }))
              : order.product
                ? [{ ...order.product, quantity: order.product.quantity || 1 }]
                : [],
          totalPrice: order.totalPrice ||
            (order.products
              ? order.products.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
              : order.product?.price * (order.product?.quantity || 1)) || 0,
        }));

        const userOrders = loadedOrders.filter(order => order.userId === user?.id);

        await AsyncStorage.setItem('myOrders', JSON.stringify(loadedOrders));
        console.log('Migrated orders:', loadedOrders);
        setOrders(userOrders);
      } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadOrders);
    return unsubscribe;
  }, [navigation, user?.id]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.orderCard, item.status === 'Đã hủy' && styles.cancelledOrderCard]}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={[styles.status, item.status === 'Đã hủy' && styles.cancelledStatus]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.date}>Ngày đặt: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.label}>Địa chỉ nhận:</Text>
      <Text style={styles.value}>{item.address?.detail}</Text>
      <Text style={styles.label}>Người nhận:</Text>
      <Text style={styles.value}>{item.address?.name} - {item.address?.phone}</Text>
      <Text style={styles.label}>Sản phẩm:</Text>
      {item.cartItems?.map((product, index) => (
        <View key={index} style={styles.itemContainer}>
          <Image source={{ uri: product.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{product.name}</Text>
            <Text style={styles.itemPrice}>
              {product.price?.toLocaleString('vi-VN') || 'N/A'}₫ x {product.quantity}
            </Text>
          </View>
        </View>
      ))}
      <Text style={styles.total}>
        Tổng tiền: {item.totalPrice?.toLocaleString('vi-VN') || 'N/A'}₫
      </Text>
      {item.status !== 'Đã hủy' && item.status !== 'Đã giao' && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.id)}>
          <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (!user || user.role === 'ADMIN') {
    return (
      <View style={globalStyles.centered}>
        <Text style={styles.accessDeniedText}>Bạn không có quyền xem trang này.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={FONT_SIZES.extraLarge} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <View style={{ width: FONT_SIZES.extraLarge }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={FONT_SIZES.extraLarge * 3} color={COLORS.gray} style={{ marginBottom: SPACING.medium }} />
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopButtonText}>Quay lại mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: SPACING.medium }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  cancelledOrderCard: {
    backgroundColor: COLORS.lightGray2,
    borderColor: COLORS.gray,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  status: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.primary,
    fontWeight: '500',
  },
  cancelledStatus: {
    color: COLORS.error,
  },
  date: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  label: {
    marginTop: SPACING.small / 2,
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  value: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small / 2,
  },
  itemContainer: {
    flexDirection: 'row',
    marginTop: SPACING.small,
    alignItems: 'center',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: SPACING.small,
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
  },
  itemPrice: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
  },
  total: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: SPACING.small,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.large,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.small,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.medium,
  },
  accessDeniedText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
  }
});

export default OrderListScreen;