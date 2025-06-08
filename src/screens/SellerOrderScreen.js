import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
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
import { useAuth } from '../context/AuthProvider';

const SellerOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const json = await AsyncStorage.getItem('myOrders');
      let loadedOrders = json ? JSON.parse(json) : [];
      
      loadedOrders = loadedOrders.filter(order => 
        order.cartItems?.some(item => item.userId === user?.id)
      );
      
      setOrders(loadedOrders);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const json = await AsyncStorage.getItem('myOrders');
      let loadedOrders = json ? JSON.parse(json) : [];
      
      loadedOrders = loadedOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });

      await AsyncStorage.setItem('myOrders', JSON.stringify(loadedOrders));
      setOrders(loadedOrders);
      Alert.alert('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã hủy':
        return '#ff4444';
      case 'Chờ xác nhận':
        return '#ffa000';
      case 'Đang xử lý':
        return '#2196f3';
      case 'Đang giao hàng':
        return '#2196f3';
      case 'Đã giao hàng':
        return '#4caf50';
      default:
        return COLORS.primary;
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.date}>
        Ngày đặt: {new Date(item.date).toLocaleDateString()}
      </Text>

      <View style={styles.customerInfo}>
        <Text style={styles.label}>Khách hàng:</Text>
        <Text style={styles.value}>{item.address?.name}</Text>
        <Text style={styles.value}>{item.address?.phone}</Text>
      </View>

      <View style={styles.productsList}>
        {item.cartItems?.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>
                {product.price.toLocaleString('vi-VN')}₫ x {product.quantity}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.total}>
        Tổng tiền: {item.totalPrice.toLocaleString('vi-VN')}₫
      </Text>

      {item.status === 'Chờ xác nhận' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleUpdateStatus(item.id, 'Đang xử lý')}
          >
            <Text style={styles.actionButtonText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleUpdateStatus(item.id, 'Đã hủy')}
          >
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'Đang xử lý' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.shipButton]}
          onPress={() => handleUpdateStatus(item.id, 'Đang giao hàng')}
        >
          <Text style={styles.actionButtonText}>Giao hàng</Text>
        </TouchableOpacity>
      )}

      {item.status === 'Đang giao hàng' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleUpdateStatus(item.id, 'Đã giao hàng')}
        >
          <Text style={styles.actionButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Chờ xác nhận' && styles.activeTab]}
          onPress={() => setActiveTab('Chờ xác nhận')}
        >
          <Text style={[styles.tabText, activeTab === 'Chờ xác nhận' && styles.activeTabText]}>
            Chờ xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Đang xử lý' && styles.activeTab]}
          onPress={() => setActiveTab('Đang xử lý')}
        >
          <Text style={[styles.tabText, activeTab === 'Đang xử lý' && styles.activeTabText]}>
            Đang xử lý
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Đang giao hàng' && styles.activeTab]}
          onPress={() => setActiveTab('Đang giao hàng')}
        >
          <Text style={[styles.tabText, activeTab === 'Đang giao hàng' && styles.activeTabText]}>
            Đang giao
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Đã giao hàng' && styles.activeTab]}
          onPress={() => setActiveTab('Đã giao hàng')}
        >
          <Text style={[styles.tabText, activeTab === 'Đã giao hàng' && styles.activeTabText]}>
            Đã giao
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Đã hủy' && styles.activeTab]}
          onPress={() => setActiveTab('Đã hủy')}
        >
          <Text style={[styles.tabText, activeTab === 'Đã hủy' && styles.activeTabText]}>
            Đã hủy
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.orderList}
        />
      )}
    </View>
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
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  productsList: {
    marginBottom: 12,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: COLORS.primary,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  rejectButton: {
    backgroundColor: '#ff4444',
  },
  shipButton: {
    backgroundColor: '#2196f3',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SellerOrderScreen; 