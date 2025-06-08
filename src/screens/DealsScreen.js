import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { ProductsContext } from '../context/ProductsContext';

const DealsScreen = ({ navigation }) => {
  const { products } = useContext(ProductsContext);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const deals = [
    {
      id: 1,
      title: 'Miễn phí vận chuyển',
      description: 'Áp dụng cho đơn hàng từ 300.000đ',
      icon: 'truck-delivery',
      color: COLORS.primary,
      type: 'shipping',
      condition: (product) => product.price >= 300000,
    },
    {
      id: 2,
      title: 'Giảm 50.000đ',
      description: 'Cho đơn hàng từ 500.000đ',
      icon: 'sale',
      color: COLORS.red,
      type: 'discount',
      value: 50000,
      condition: (product) => product.price >= 500000,
    },
    {
      id: 3,
      title: 'Giảm 10%',
      description: 'Tối đa 100.000đ cho đơn hàng từ 200.000đ',
      icon: 'percent',
      color: COLORS.orange,
      type: 'percent',
      value: 10,
      maxDiscount: 100000,
      condition: (product) => product.price >= 200000,
    },
  ];

  const handleDealPress = (deal) => {
    setSelectedDeal(deal);
    
    const eligibleProducts = products.filter(deal.condition);
    
    if (deal.type === 'shipping') {
      navigation.navigate('CategoryProducts', {
        categoryName: 'Freeship Deals',
        title: 'Miễn phí vận chuyển',
        products: eligibleProducts,
      });
    } else {
      Alert.alert(
        'Thành công',
        'Voucher đã được lưu. Sẽ tự động áp dụng khi thanh toán.',
        [
          {
            text: 'Mua sắm ngay',
            onPress: () => navigation.navigate('Home'),
          },
          {
            text: 'Đóng',
          },
        ]
      );
    }
  };

  const renderDeal = (deal) => (
    <TouchableOpacity
      key={deal.id}
      style={[styles.dealCard, { borderColor: deal.color }]}
      onPress={() => handleDealPress(deal)}
    >
      <View style={[styles.iconContainer, { backgroundColor: deal.color }]}>
        <MaterialCommunityIcons name={deal.icon} size={32} color="white" />
      </View>
      <View style={styles.dealInfo}>
        <Text style={styles.dealTitle}>{deal.title}</Text>
        <Text style={styles.dealDescription}>{deal.description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ưu đãi hấp dẫn</Text>
        <Text style={styles.headerSubtitle}>Chọn ưu đãi phù hợp với bạn</Text>
      </View>
      <View style={styles.dealsContainer}>
        {deals.map(renderDeal)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  dealsContainer: {
    padding: 16,
  },
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dealInfo: {
    flex: 1,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  dealDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default DealsScreen;
