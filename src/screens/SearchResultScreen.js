import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { COLORS } from '../styles/colors';
import { SIZES } from '../styles/textStyle';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const SearchResultScreen = ({ route, navigation }) => {
  const { searchResults } = route.params;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => {
    if (item.type === 'screen') {
      return (
        <TouchableOpacity
          style={styles.screenItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.screenName}>{item.keyword}</Text>
        </TouchableOpacity>
      );
    }

    // Render product item
    const product = item.data;
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(product)}
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            {product.price.toLocaleString()}đ
          </Text>
          {product.discount > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {product.rating}</Text>
            <Text style={styles.soldText}>Đã bán {product.sold}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả tìm kiếm</Text>
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      {selectedProduct && (
        <ProductDetailScreen
          visible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.dark,
  },
  row: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 15,
    padding: 10,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  discountContainer: {
    position: 'absolute',
    top: -140,
    right: -5,
    backgroundColor: COLORS.red,
    padding: 4,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.dark,
    marginRight: 8,
  },
  soldText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  screenItem: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 10,
    elevation: 2,
  },
  screenName: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
  },
});

export default SearchResultScreen;
