import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
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

const CategoryProducts = ({ route, navigation, }) => {
  const { categoryName } = route.params;
  const { addToCart } = useContext(CartContext);
  const { products, loading, categories } = useContext(ProductsContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  if (loading) return <Text>Loading...</Text>;

  useEffect(() => {
    if (!loading && products && categories) {
      console.log('CategoryName:', categoryName);
      const filtered = products.filter(product => {
        return product.categoryName === categoryName || (product.categoryId && categories.find(cat => cat.id === product.categoryId)?.name === categoryName);
      });
      console.log('Filtered products:', filtered);
      setFilteredProducts(filtered);
    }
  }, [loading, products, categoryName, categories]);

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCartForDetail = (product) => {
    addToCart(product);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có sản phẩm trong danh mục này</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
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
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
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

export default CategoryProducts;