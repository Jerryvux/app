import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailScreen = ({ route }) => {
  const { order } = route.params || {};
  const navigation = useNavigation();

  const handleCancelOrder = async () => {
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          onPress: async () => {
            try {
              const json = await AsyncStorage.getItem('myOrders');
              let loadedOrders = json ? JSON.parse(json) : [];
              loadedOrders = loadedOrders.map(o => {
                if (o.id === order.id) {
                  return { ...o, status: 'Đã hủy' };
                }
                return o;
              });
              await AsyncStorage.setItem('myOrders', JSON.stringify(loadedOrders));
              navigation.goBack();
            } catch (error) {
              console.error('Lỗi khi hủy đơn hàng:', error);
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  const handleTrackOrder = () => {
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Thông báo',
      'Tính năng đang được phát triển',
      [{ text: 'OK' }]
    );
  };

  const handleBuyAgain = () => {
    Alert.alert(
      'Thông báo',
      'Tính năng đang được phát triển',
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã hủy':
        return '#ff4444';
      case 'Đang xử lý':
        return '#ffa000';
      case 'Đang giao hàng':
        return '#2196f3';
      case 'Đã giao hàng':
        return '#4caf50';
      default:
        return COLORS.primary;
    }
  };

  console.log('Order details:', order);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Chi tiết đơn hàng #{order.id || 'N/A'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.orderCard}>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
            {order.status || 'Không xác định'}
          </Text>
          <Text style={styles.date}>
            Ngày đặt: {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.deliveryInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{order.address?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{order.address?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{order.address?.detail || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {order.cartItems?.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>
                  {item.price.toLocaleString('vi-VN')}₫ x {item.quantity}
                </Text>
                <Text style={styles.productTotal}>
                  Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tạm tính:</Text>
              <Text style={styles.paymentValue}>
                {order.totalPrice.toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
              <Text style={styles.paymentValue}>
                {(order.shippingFee || 0).toLocaleString('vi-VN')}₫
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>
                {((order.totalPrice || 0) + (order.shippingFee || 0)).toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {order.status === 'Đã hủy' ? (
            <TouchableOpacity style={styles.buyAgainButton} onPress={handleBuyAgain}>
              <Text style={styles.buyAgainButtonText}>Mua lại</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
            <Text style={styles.trackButtonText}>Theo dõi đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCard: {
    padding: 16,
  },
  statusContainer: {
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deliveryInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: COLORS.primary,
  },
  productTotal: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  paymentDetails: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ffeaea',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  trackButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 20,
  },
  noItemsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  buyAgainButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyAgainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;