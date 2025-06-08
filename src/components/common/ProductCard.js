import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';
import { productStyles } from '../../styles/productStyles';
import { FONT_SIZES, SPACING } from '../../styles/textStyle';
import { useAuth } from '../../context/AuthProvider';
import { CartContext } from '../../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProductCard = ({
  product,
  onPress,
  scaleAnimatedValue,
  showAddToCartButton = true,
  style,
}) => {
  const formatPrice = (price) => Number(price || 0).toLocaleString('vi-VN') + 'đ';
  const { user } = useAuth();
  const { addToCart } = React.useContext(CartContext);
  const navigation = useNavigation();

  const localScaleAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = scaleAnimatedValue || localScaleAnim;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleAddToCart = () => {
    if (user?.role === 'ADMIN') {
      console.log('Admin users cannot add products to cart');
      return;
    }
    addToCart(product);
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  };

  const imagesToDisplay = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);

  if (!product || imagesToDisplay.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        productStyles.cardContainer,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(product)}
        activeOpacity={0.8}
        style={productStyles.touchable}
      >
        {product.discount > 0 && (
          <View style={productStyles.badge}>
            <Text style={productStyles.badgeText}>-{product.discount}%</Text>
          </View>
        )}

        <View style={productStyles.imageGalleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onResponderGrant={e => e.stopPropagation()}
            onStartShouldSetResponder={() => true}
            contentContainerStyle={productStyles.imageGalleryContent}
          >
            {imagesToDisplay.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={productStyles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        <View style={productStyles.productContent}>
          <View style={productStyles.priceContainer}>
            <Text style={productStyles.productPrice}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text style={productStyles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
          <Text style={productStyles.productName} numberOfLines={2}>{product.name}</Text>
          <View style={productStyles.ratingContainer}>
            <Ionicons name="star" size={FONT_SIZES.small} color={COLORS.yellow} />
            <Text style={productStyles.ratingText}>{product.rating || 4.9}</Text>
            <Text style={productStyles.soldText}> | Đã bán {product.sold || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {showAddToCartButton && user?.role !== 'ADMIN' && (
        <TouchableOpacity
          onPress={handleAddToCart}
          style={productStyles.addToCartButton}
        >
          <Feather name="shopping-cart" size={FONT_SIZES.medium} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({});

export default ProductCard; 