import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const SelectProductVariantScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { productList = [], onSelectProduct } = route.params || {};

  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleSelectProduct(item.data || item)}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.shop}>Cửa hàng: {item.shopName || 'Chưa rõ'}</Text>
        <Text style={styles.price}>
          {typeof item.price === 'number' ? `${item.price.toLocaleString()}đ` : 'Đang cập nhật'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chọn một phiên bản sản phẩm</Text>
      <FlatList
        data={productList.map(p => p.data || p)}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
      />
      <ProductDetailScreen
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={(product) => {
          // Optional xử lý thêm vào giỏ tại đây nếu cần
          setModalVisible(false);
        }}
      />
    </View>
  );
};

export default SelectProductVariantScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 16 },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f2f2f2',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  shop: {
    fontSize: 13,
    color: '#888',
  },
  price: {
    fontSize: 15,
    color: '#e53935',
    fontWeight: 'bold',
    marginTop: 6,
  },
});
