import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { productAPI } from '../data/api';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { Ionicons } from '@expo/vector-icons';

const MyProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await AsyncStorage.getItem('userData');
      const parsedUser = JSON.parse(user);
      setCurrentUser(parsedUser);

      if (!parsedUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const myProducts = await AsyncStorage.getItem('MyProduct');
      const localProducts = myProducts ? JSON.parse(myProducts) : [];

      let apiProducts = [];
      try {
        const apiResponse = await productAPI.getByUserId(parsedUser.id);
        apiProducts = apiResponse.data || [];
      } catch (apiError) {
        console.warn('Không thể lấy sản phẩm từ API:', apiError);
      }


      const allProducts = [...localProducts, ...apiProducts];
      const userProducts = allProducts
        .filter(product => {
          const isUserProduct = product.userName === parsedUser.name ||
            product.userId === parsedUser.id;
          return isUserProduct;
        })
        .filter((product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
        );

      setProducts(userProducts);

      if (userProducts.length === 0) {
        setError('Bạn chưa có sản phẩm nào. Hãy thêm sản phẩm mới!');
      }

    } catch (error) {
      console.error('Error loading products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const deleteProduct = async (id) => {
    Alert.alert('Xác nhận', 'Xóa sản phẩm này?', [
      { text: 'Hủy' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            await productAPI.delete(id);
            setProducts(products.filter(p => p.id !== id));
            Alert.alert('Thành công', 'Đã xóa sản phẩm');
          } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
          }
        },
      },
    ]);
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';

  const renderItem = ({ item }) => (
    <View style={styles.productRow}>
      <View style={styles.imageColumn}>
        <Image
          source={{ uri: item.images && item.images.length > 0 ? item.images[0] : item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoColumn}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.productStats}>
          <Text style={styles.statText}>Đã bán: {item.sold || 0}</Text>
          <Text style={styles.statText}>Đánh giá: {item.rating || 0}/5</Text>
        </View>
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditProduct', { product: item })}
        >
          <Ionicons name="create-outline" size={FONT_SIZES.large} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={FONT_SIZES.large} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm của tôi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UploadProductScreen')}
        >
          <Ionicons name="add-circle-outline" size={FONT_SIZES.large} color={COLORS.white} />
          <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color={COLORS.gray} />
            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('UploadProductScreen')}
            >
              <Ionicons name="add-circle-outline" size={FONT_SIZES.large} color={COLORS.white} />
              <Text style={styles.addButtonText}>Thêm sản phẩm mới</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.small,
    fontSize: FONT_SIZES.large,
    color: COLORS.textPrimary,
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
  listContainer: {
    padding: SPACING.small,
  },
  productRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: SPACING.small,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    height: 100,
  },
  imageColumn: {
    width: 100,
    height: '100%',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoColumn: {
    flex: 1,
    padding: SPACING.small,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: SPACING.small / 2,
  },
  productPrice: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.small / 2,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
  },
  actionColumn: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: SPACING.small,
    backgroundColor: COLORS.lightGray,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
    marginTop: SPACING.large * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.gray,
    marginTop: SPACING.small,
    marginBottom: SPACING.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 5,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    marginLeft: SPACING.small / 2,
  },
});

export default MyProductsScreen;
