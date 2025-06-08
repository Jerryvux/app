import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { FOOTER_HEIGHT } from '../styles/globalStyles';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { CartContext } from '../context/CartContext';
import { ProductsContext } from '../context/ProductsContext';
import ProductCard from '../components/common/ProductCard';
import { productStyles } from '../styles/productStyles';

const AllProductsScreen = ({ navigation }) => {
  const { addToCart } = useContext(CartContext);
  const { products, loading } = useContext(ProductsContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(null);

  if (loading) return <Text>Loading...</Text>;

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCartForDetail = (product) => {
      addToCart(product);
      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortByPrice === 'asc') return a.price - b.price;
    if (sortByPrice === 'desc') return b.price - a.price;
    return 0;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
         <TouchableOpacity onPress={() =>
            setSortByPrice(
              prev => prev === 'asc' ? 'desc' : 'asc')}>
            <Text style={styles.sortButtonText}>Giá {sortByPrice === 'asc' ? '▲' : sortByPrice === 'desc' ? '▼' : ''}</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={sortedProducts}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={openProductDetail}
            scaleAnimatedValue={null}
            showAddToCartButton={true}
            style={[productStyles.cardContainer, styles.gridProductCard]}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
      />

      <ProductDetailScreen
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleAddToCartForDetail}
        onBuyNow={(product) => {
          handleAddToCartForDetail(product);
          setModalVisible(false);
          setTimeout(() => {
            navigation.navigate('Checkout', { product });
          }, 300);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: FOOTER_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
   sortButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
  },
  productList: {
    padding: SPACING.small,
  },
  gridProductCard: {
    flex: 1,
    margin: SPACING.small / 2,
    maxWidth: '48%',
  },
});

export default AllProductsScreen;