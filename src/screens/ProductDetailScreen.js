import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productAPI } from '../data/api';
import { useAuth } from '../context/AuthProvider';

import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ visible, product, onClose, onAddToCart, onBuyNow }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalAnim] = useState(new Animated.Value(height));
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    console.log('Product received in ProductDetailScreen:', product);
    if (visible && product) {
      setSeller({
        id: product.userId || product.id,
        name: product.userName,
        avatar: product.sellerAvatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a1a6c5c1b3b1e9f9e6c5d7a6a5a9a1a1a.jpg',
        online: product.sellerOnline || false
      });

      productAPI.getColors(product.id)
        .then(response => {
          setColors(response.data);
        })
        .catch(error => {
          console.error('Error fetching colors:', error);
          setColors([]);
        });

      productAPI.getSizes(product.id)
        .then(response => {
          setSizes(response.data);
        })
        .catch(error => {
          console.error('Error fetching sizes:', error);
          setSizes([]);
        });
    }
  }, [visible, product]);

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = await AsyncStorage.getItem('favorites');
      const list = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(list.some(p => p.id === product?.id));
    };
    if (product) checkFavorite();
  }, [product]);

  const toggleFavorite = async () => {
    const favorites = await AsyncStorage.getItem('favorites');
    let list = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      list = list.filter(p => p.id !== product.id);
    } else {
      list.push(product);
    }

    await AsyncStorage.setItem('favorites', JSON.stringify(list));
    setIsFavorite(!isFavorite);
  };

  const slideIn = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(modalAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  useEffect(() => {
    if (visible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);

  if (!product) return null;

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity, color: selectedColor, size: selectedSize });
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
    slideOut();
  };

  const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';

  const sellerIdForNavigation = product.userId || product.id;
  const sellerNameForNavigation = product.userName;
  const sellerAvatarForNavigation = product.sellerAvatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a1a6c5c1b3b1e9f9e6c5d7a6a5a9a1a1a.jpg';
  const onlineForNavigation = product.sellerOnline || false;

  const isMyOwnProduct = user && user.id === sellerIdForNavigation;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={slideOut}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={slideOut}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: modalAnim }] }
          ]}
        >
          <View style={styles.productImageContainer}>
            <Image
              source={{ uri: (product.images && product.images.length > 0) ? product.images[0] : product.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={slideOut}
            >
              <Feather name="x" size={FONT_SIZES.extraLarge} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceTextGroup}>
                  <Text style={styles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
                  <Text style={styles.originalPrice}>{product.originalPrice.toLocaleString('vi-VN')}đ</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{product.discount}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={COLORS.yellow} />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.soldText}> | Đã bán {product.sold}</Text>
                <TouchableOpacity onPress={toggleFavorite} style={styles.heartButton}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? 'red' : COLORS.gray}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.description}>{product.description}</Text>

              <TouchableOpacity
                style={styles.sellerRow}
                onPress={() => {
                  console.log('Navigating to Shop with sellerId:', sellerIdForNavigation);
                  navigation.navigate('Shop', {
                    sellerId: sellerIdForNavigation,
                    sellerName: sellerNameForNavigation,
                    sellerAvatar: sellerAvatarForNavigation,
                    online: onlineForNavigation
                  });
                  onClose();
                }}
              >
                <View style={styles.sellerInfo}>
                  <Image
                    source={{ uri: sellerAvatarForNavigation }}
                    style={styles.sellerAvatar}
                  />
                  <Text style={styles.sellerName}>{sellerNameForNavigation}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {colors.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={styles.optionTitle}>Màu sắc</Text>
                <View style={styles.optionContainer}>
                  {colors.map(color => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      style={selectedColor === color ? styles.selectedOption : styles.option}
                    >
                      <Text style={selectedColor === color ? styles.selectedOptionText : styles.optionText}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {sizes.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={styles.optionTitle}>Kích thước</Text>
                <View style={styles.optionContainer}>
                  {sizes.map(size => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setSelectedSize(size)}
                      style={selectedSize === size ? styles.selectedOption : styles.option}
                    >
                      <Text style={selectedSize === size ? styles.selectedOptionText : styles.optionText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>Số lượng</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Feather name="minus" size={16} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Feather name="plus" size={16} color={COLORS.dark} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionButtons}>
            {!isMyOwnProduct && (
              <TouchableOpacity
                style={[styles.button, styles.chatButton]}
                onPress={() => {
                  navigation.navigate('Chat', {
                    sellerId: product.userId,
                    sellerName: product.userName,
                    sellerAvatar: product.sellerAvatar,
                    productId: product.id,
                    productName: product.name,
                    productImage: (product.images && product.images.length > 0) ? product.images[0] : product.image, // Truyền URL ảnh
                    productPrice: product.price,
                  });
                  onClose();
                }}
              >
                <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
                <Text style={[styles.buttonText, { color: COLORS.primary }]}>Chat</Text>
              </TouchableOpacity>
            )}

            {!isMyOwnProduct && user?.role !== 'ADMIN' && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.addToCartButton]}
                  onPress={handleAddToCart}
                >
                  <Feather name="shopping-cart" size={20} color={COLORS.primary} />
                  <Text style={[styles.buttonText, { color: COLORS.primary }]}>Thêm vào giỏ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buyNowButton]}
                  onPress={() => {
                    if (colors.length > 0 && !selectedColor) {
                      Alert.alert('Thông báo', 'Vui lòng chọn màu sắc');
                      return;
                    }

                    if (sizes.length > 0 && !selectedSize) {
                      Alert.alert('Thông báo', 'Vui lòng chọn kích thước');
                      return;
                    }
                    navigation.navigate('Checkout', {
                      product: {
                        ...product,
                        quantity,
                        color: selectedColor,
                        size: selectedSize,
                      },
                    });
                    slideOut();
                  }}
                >
                  <Text style={[styles.buttonText, { color: COLORS.white }]}>Mua ngay</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.storeOverlay,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  productImageContainer: {
    height: height * 0.3,
    width: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productInfo: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.red,
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.gray,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.dark,
    marginLeft: 4,
  },
  soldText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  heartButton: {
    marginLeft: 'auto',
  },
  description: {
    fontSize: 14,
    color: COLORS.dark,
    lineHeight: 20,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginTop: 15,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  sellerName: {
    fontSize: 14,
    color: COLORS.dark,
  },
  chatButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    width: 60,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderRadius: 20,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    width: 60,
    height: 30,
    marginRight: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'bold',
    marginLeft: 5,
    color: COLORS.dark,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.dark,
  },
  selectedOptionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;