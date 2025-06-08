import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';

const Cart = ({ onBack }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const navigation = useNavigation();

  const handleRemoveItem = (id) => {
    removeFromCart(id);
    Alert.alert('Thông báo', 'Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng của bạn đang trống.');
      return;
    }
    const totalPrice = getCartTotal();

    navigation.navigate('Checkout', {
      fromCart: true,
      cartItems,
      totalPrice,
    });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
          >
            <Feather name="minus" size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity || 1}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
          >
            <Feather name="plus" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Feather name="trash-2" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  const Footer = () => (
    <View style={styles.footer}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Tổng cộng:</Text>
        <Text style={styles.totalAmount}>
          {getCartTotal().toLocaleString('vi-VN')}đ
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          cartItems.length === 0 && styles.disabledButton
        ]}
        onPress={handleCheckout}
        disabled={cartItems.length === 0}
      >
        <Text style={styles.checkoutButtonText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (onBack) onBack();
              else navigation.goBack();
            }}
          >
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Giỏ hàng</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearCartText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Feather name="shopping-cart" size={80} color={COLORS.gray} />
            <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => {
                if (onBack) onBack();
                navigation.navigate('Cửa hàng');
              }}
            >
              <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCartItem}
            contentContainerStyle={styles.cartList}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        )}

        <Footer />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  clearCartText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '400',
  },
  cartList: {
    padding: 14,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 5,
    minWidth: 5,
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.dark,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  continueShoppingButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Cart;