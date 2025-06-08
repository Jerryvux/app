import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BannerSlider from '../screens/BannerSlider';
import Header from './Header';
import { HEADER_HEIGHT } from '../styles/globalStyles';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { CartContext } from '../context/CartContext';
import { ProductsContext } from '../context/ProductsContext';
import { Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import ProductCard from './common/ProductCard';

const { width } = Dimensions.get('window');
const Maincontents = ({ navigation }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const { products, categories, banners, loading } = useContext(ProductsContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      console.log('Maincontents: Cart items on focus:', cartItems);
    }
  }, [isFocused, cartItems]);

  if (loading) return <Text> Đang tải dữ liệu ...</Text>;
  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    setModalVisible(false);
    navigation.navigate('Cart');
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryProducts', {
        categoryName: item.name
      })}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color || COLORS.lightPrimary }]}>
        <MaterialCommunityIcons name={item.icon} size={FONT_SIZES.large} color="black" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (icon, text, onPress) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <MaterialCommunityIcons name={icon} size={FONT_SIZES.large} color={COLORS.primary} />
      </View>
      <Text style={styles.quickActionText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        onPress={() => navigation.navigate('Home')}
        onCartPress={() => navigation.navigate('Cart')}
        setActiveTab={(tab) => console.log('Active tab:', tab)}
        setIsCartVisible={() => console.log('Toggle cart')}
        navigation={navigation}
        products={products}
        setSelectedProduct={setSelectedProduct}
        setModalVisible={setModalVisible}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerSlider}>
          <BannerSlider banners={banners} navigation={navigation} />
        </View>

        <View style={styles.quickActionsContainer}>
          {renderQuickAction('truck-delivery', 'Miễn phí vận chuyển', () =>
            navigation.navigate('Vouchers', { categoryId: 99, categoryName: 'Freeship Deals' })
          )}
          {renderQuickAction('shield-check', 'Bảo hành chính hãng', () =>
            Alert.alert('Thông tin', 'Tất cả sản phẩm đều có bảo hành chính hãng 12 tháng.')
          )}
          {renderQuickAction('credit-card-check', 'Thanh toán đa dạng', () =>
            Alert.alert('Phương thức thanh toán', 'Bạn có thể thanh toán bằng thẻ, Momo, ZaloPay hoặc khi nhận hàng.')
          )}
          {renderQuickAction('headset', 'Hỗ trợ 24/7', () =>
            navigation.navigate('Hộp thư')
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item, index) => item?.id?.toString?.() ?? index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTag}>
              <Text style={styles.tagText}>BÁN CHẠY</Text>
            </View>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={openProductDetail}
                style={styles.productCard}
              />
            )}
            keyExtractor={(item, index) => item?.id?.toString?.() ?? index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {Array.isArray(products) &&
              products.slice(0, 4).map((product, index) => (
                <ProductCard
                  key={`rec-${index}`}
                  product={product}
                  onPress={openProductDetail}
                  style={styles.gridItem}
                />
              ))}
          </View>
        </View>
      </ScrollView>

      <ProductDetailScreen
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
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
    paddingBottom: SPACING.large * 2,
    paddingTop: HEADER_HEIGHT,
  },
  bannerSlider: {
    height: width * 0.45,
    marginBottom: SPACING.medium,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium / 2,
    paddingVertical: SPACING.medium / 2,
    backgroundColor: COLORS.white,
    marginTop: SPACING.medium / 2,
    marginHorizontal: SPACING.medium / 2,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginTop: SPACING.large - 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.medium - 8,
    marginHorizontal: SPACING.medium - 8,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium / 2,
    marginBottom: SPACING.medium / 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.small / 2,
  },
  sectionTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.small / 2,
    paddingVertical: SPACING.small / 2,
    borderRadius: 4,
    marginRight: SPACING.small,
  },
  tagText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
  },
  categoryList: {
    paddingHorizontal: SPACING.medium - 4,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SPACING.large - 10,
    width: 80,
  },
  categoryIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
    elevation: 2,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  productList: {
    paddingHorizontal: SPACING.medium / 2,
  },
  productCard: {
    marginRight: SPACING.medium / 2,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.medium / 2,
  },
  gridItem: {
    width: '45%',
    marginBottom: SPACING.medium,
    marginRight: SPACING.medium,
  },
});

export default Maincontents;