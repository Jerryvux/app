import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,

  Alert,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '../styles/globalStyles';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { ProductsContext } from '../context/ProductsContext';
import ProductCard from '../components/common/ProductCard';
import { productStyles } from '../styles/productStyles';

const StoreScreen = ({ navigation }) => {
  const { products, categories, loading } = useContext(ProductsContext);
  const { addToCart } = useContext(CartContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnimations = React.useRef({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortByPrice, setSortByPrice] = useState(null);

  if (loading) return <Text> loading... </Text>

  React.useEffect(() => {
    products.forEach(product => {
      if (!scaleAnimations.current[product.id]) {
        scaleAnimations.current[product.id] = new Animated.Value(1);
      }
    });
  }, [products]);

  const handlePressIn = (productId) => {
    if (scaleAnimations.current[productId]) {
      Animated.spring(scaleAnimations.current[productId], {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = (productId) => {
    if (scaleAnimations.current[productId]) {
      Animated.spring(scaleAnimations.current[productId], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const openProductDetail = (product) => {
    console.log('Attempting to open product detail for:', product);
    if (product) {
      setSelectedProduct(product);
      setModalVisible(true);
    } else {
      console.warn('openProductDetail received undefined or null product.');
      Alert.alert('Lỗi', 'Không thể hiển thị chi tiết sản phẩm.');
    }
  };

  const handleAddToCartForDetail = (product) => {
    addToCart(product);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };


  const filteredAndSortedProducts = [...products]
    .filter(p => !selectedCategory || p.categoryId === selectedCategory)
    .sort((a, b) => {
      if (sortByPrice === 'asc') return a.price - b.price;
      if (sortByPrice === 'desc') return b.price - a.price;
      return 0;
    });

  console.log('Filtered and sorted products in StoreScreen:', filteredAndSortedProducts);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate('CategoryProducts', {
        categoryId: item.id,
        categoryName: item.name
      })}
    >
      <View style={styles.categoryIcon}>
        <MaterialCommunityIcons name={item.icon} size={FONT_SIZES.extraLarge} color={COLORS.primary} />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={categories}//data
            renderItem={renderCategory}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        <View style={styles.flashSaleContainer}>
          <View style={styles.flashSaleHeader}>
            <View style={styles.flashSaleTag}>
              <Text style={styles.flashSaleTagText}>FLASH SALE</Text>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>Kết thúc trong 12:34:56</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products.slice(0, 4)}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={openProductDetail}
                scaleAnimatedValue={null}
                showAddToCartButton={true}
                style={[productStyles.cardContainer, styles.flashSaleProductCard]}
              />
            )}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashSaleList}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bộ lọc / Sắp xếp</Text>
          <TouchableOpacity onPress={() =>
            setSortByPrice(
              prev => prev === 'asc' ? 'desc' : 'asc')}>
            <Text style={styles.seeAll}>Giá {sortByPrice === 'asc' ? '▲' : sortByPrice === 'desc' ? '▼' : ''}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {filteredAndSortedProducts.slice(0, 4).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={openProductDetail}
                showAddToCartButton={true}
                style={[productStyles.cardContainer, styles.gridProductCard]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

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
  },
  scrollContent: {
    paddingBottom: FOOTER_HEIGHT,
    paddingTop: HEADER_HEIGHT,
  },
  cartButton: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 8,
    marginHorizontal: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
  },
  categoryList: {
    paddingRight: SPACING.medium,
  },
  categoryItem: {
    width: 70,
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small / 2,
  },
  categoryName: {
    fontSize: FONT_SIZES.small,
    textAlign: 'center',
    color: COLORS.dark,
  },
  flashSaleContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 8,
    marginHorizontal: SPACING.small,
  },
  flashSaleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  flashSaleTag: {
    backgroundColor: COLORS.red,
    borderRadius: 4,
    paddingHorizontal: SPACING.small / 2,
    paddingVertical: SPACING.small / 4,
    marginRight: SPACING.small,
  },
  flashSaleTagText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
  },
  timerContainer: {
    flex: 1,
  },
  timerText: {
    color: COLORS.red,
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
  },
  flashSaleList: {
    paddingRight: SPACING.medium,
  },
  flashSaleProductCard: {
    width: 140,
    marginRight: SPACING.small,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%',
    marginBottom: SPACING.small,
  },
});

export default StoreScreen;