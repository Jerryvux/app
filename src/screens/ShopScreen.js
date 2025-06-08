import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { productAPI } from '../data/api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthProvider';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { CartContext } from '../context/CartContext';
import globalStyles from '../styles/globalStyles';
import { productStyles } from '../styles/productStyles';
import ProductCard from '../components/common/ProductCard';

const { width } = Dimensions.get('window');
const numColumns = 2;

const ShopScreen = ({ route }) => {
  const navigation = useNavigation();
  const { sellerId, sellerName, sellerAvatar, online } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, setUser } = useAuth();
  const { addToCart } = useContext(CartContext);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [sellerInfo, setSellerInfo] = useState({
    name: sellerName || 'Tên Shop',
    avatar: sellerAvatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a1a6c5c1b3b1e9f9e6c5d7a6a5a9a1a1a.jpg',
    online: online,
    rating: 5.0,
    totalProducts: 0,
    totalOrders: 0,
    responseRate: 100,
    responseTime: '0-1h'
  });

  const loadData = async () => {
    try {
      const user = await AsyncStorage.getItem('userData');
      const parsedUser = JSON.parse(user);
      setUser(parsedUser);

      if (parsedUser?.id) {
        console.log('Current user id:', parsedUser.id);
        const response = await productAPI.getByUser(parsedUser.id);
        console.log('API response data:', response.data);
        console.log('First product:', response.data?.[0]);
        const userProducts = (response.data || []).filter(product => {
          console.log('Checking product:', product);
          console.log('Product userName:', product.userName);
          console.log('Current user name:', parsedUser.name);
          console.log('Match?', product.userName === parsedUser.name);
          return product.userName === parsedUser.name;
        });
        console.log('Filtered products:', userProducts);
        setProducts(userProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadShopData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('loadShopData fetching products for sellerId:', sellerId);
      const sellerResponse = await productAPI.getByUserId(sellerId);
      console.log('loadShopData API response data:', sellerResponse?.data);

      const sellerProducts = (sellerResponse.data || []).filter(product => {
        console.log('Checking product:', product);
        console.log('Product userName:', product.userName);
        console.log('Current sellerName:', sellerName);
        console.log('Match?', product.userName === sellerName);
        return product.userName === sellerName;
      });

      console.log('loadShopData filtered products:', sellerProducts);
      setProducts(sellerProducts);

      setSellerInfo(prevInfo => ({
        ...prevInfo,
        name: sellerName || prevInfo.name,
        avatar: sellerAvatar || prevInfo.avatar,
        online: online !== undefined ? online : prevInfo.online,
        totalProducts: sellerProducts.length,

        rating: sellerProducts.length > 0
          ? Number(
            (
              sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length
            ).toFixed(1)
          ) : prevInfo.rating,
        totalOrders: sellerProducts.length > 0
          ? sellerProducts.reduce((sum, p) => sum + p.sold, 0)
          : prevInfo.totalOrders,
        responseRate: sellerProducts.length > 0
          ? sellerProducts[0].responseRate || 100
          : prevInfo.responseRate,
      }));

    } catch (err) {
      console.error('Error loading shop data:', err);
      if (err.response?.status === 403) {
        setError('Không có quyền truy cập');
      } else {
        setError('Không thể tải thông tin cửa hàng');
      }
      setProducts([]); // Ensure products is empty on error
      setSellerInfo({ // Reset seller info or set defaults on error
        name: sellerName || 'Tên Shop',
        avatar: sellerAvatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a1a6c5c1b3b1e9f9e6c5d7a6a5a9a1a1a.jpg',
        online: online,
        rating: 5.0,
        totalProducts: 0,
        totalOrders: 0,
        responseRate: 100,
        responseTime: '0-1h'
      });
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (sellerId) {
        loadShopData();
      } else if (user?.id) {
        loadData();
      } else {
        setLoading(false);
        setError('Không có thông tin để hiển thị.');
      }
    }, [sellerId, user?.id])
  );

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCartForDetail = (product) => {
    addToCart(product);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const renderItem = ({ item, index }) => {
    const itemMargin = SPACING.small / 2;
    const totalSpacing = SPACING.medium * 2 + SPACING.small * (numColumns - 1);
    const itemWidth = (width - totalSpacing) / numColumns;

    return (
      <ProductCard
        product={item}
        onPress={openProductDetail}
        scaleAnimatedValue={null}
        showAddToCartButton={true}
        style={[productStyles.cardContainer, styles.gridProductCard, { marginHorizontal: itemMargin, marginBottom: SPACING.small }]}
      />
    );
  };

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin cửa hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.centered}>
        <Ionicons name="alert-circle-outline" size={FONT_SIZES.extraLarge * 2} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={sellerId ? loadShopData : loadData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!sellerInfo || (!sellerId && !user?.id)) {
    return (
      <View style={globalStyles.centered}>
        <Text style={styles.emptyText}>Không tìm thấy thông tin cửa hàng hoặc người dùng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Shop Info Section */}
      <View style={styles.shopContainer}>
        <View style={styles.shopInfo}>
          <Image
            source={{ uri: sellerInfo.avatar }}
            style={styles.shopAvatar}
            resizeMode="cover"
          />
          <View style={styles.shopText}>
            <View style={styles.headerRow}>
              <Text style={styles.shopName}>{sellerInfo.name}</Text>
              {user && user.id !== sellerId && (
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => {
                    navigation.navigate('Chat', {
                      sellerId: sellerId,
                      sellerName: sellerInfo.name,
                      sellerAvatar: sellerInfo.avatar
                    });
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={FONT_SIZES.extraLarge} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={FONT_SIZES.large} color={COLORS.yellow} style={{ marginRight: SPACING.small/4}} />
                <Text style={styles.statValue}>{sellerInfo.rating?.toFixed(1) || 'N/A'}</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="cube-outline" size={FONT_SIZES.large} color={COLORS.info} style={{ marginRight: SPACING.small/4}} />
                <Text style={styles.statValue}>{sellerInfo.totalProducts || 0}</Text>
                <Text style={styles.statLabel}>Sản phẩm</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="receipt-outline" size={FONT_SIZES.large} color={COLORS.success} style={{ marginRight: SPACING.small/4}} />
                <Text style={styles.statValue}>{sellerInfo.totalOrders || 0}</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
              </View>
              {sellerInfo.responseRate !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="chatbubbles-outline" size={FONT_SIZES.large} color={COLORS.warning} style={{ marginRight: SPACING.small/4}} />
                  <Text style={styles.statValue}>{sellerInfo.responseRate}%</Text>
                  <Text style={styles.statLabel}>P.hồi Chat</Text>
                </View>
              )}
              {sellerInfo.responseTime !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={FONT_SIZES.large} color={COLORS.accent} style={{ marginRight: SPACING.small/4}} />
                  <Text style={styles.statValue}>{sellerInfo.responseTime}</Text>
                  <Text style={styles.statLabel}>Tg P.hồi</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={FONT_SIZES.extraLarge * 3} color={COLORS.gray} />
            <Text style={styles.emptyText}>Cửa hàng này chưa có sản phẩm nào.</Text>
          </View>
        }
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
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.small,
    fontSize: FONT_SIZES.large,
    color: COLORS.textPrimary,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: SPACING.small,
    fontSize: FONT_SIZES.large,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.medium,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  shopContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.small,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.large,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  shopText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  shopName: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.dark,
    flexShrink: 1,
    marginRight: SPACING.small,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginTop: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.small / 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    fontWeight: '500',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  productList: {
    paddingHorizontal: SPACING.small,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridProductCard: {
    flex: 1,
    margin: SPACING.small / 2,
    maxWidth: '48%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.large * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    marginTop: SPACING.small,
  },
});

export default ShopScreen;
