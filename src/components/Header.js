import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, FlatList, StyleSheet, Image } from 'react-native';
import { CartContext } from '../context/CartContext';
import { COLORS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';
import { HEADER_HEIGHT } from '../styles/globalStyles';
import { ProductsContext } from '../context/ProductsContext';

const Header = ({
  onPress,
  onCartPress,
  setActiveTab,
  setIsCartVisible,
  navigation,
  setSelectedProduct,
  setModalVisible }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const { cartCount } = useContext(CartContext);

  const { products, setProducts, addProduct } = useContext(ProductsContext);


  const quickSearchData = [
    ...products.map(p => ({ keyword: p.name, type: 'product', data: p })),
    { keyword: 'đơn hàng', type: 'screen', screen: 'OrderList' },
    { keyword: 'hồ sơ', type: 'screen', screen: 'Hồ sơ' },
    { keyword: 'tin nhắn', type: 'screen', screen: 'Hộp thư' },
    { keyword: 'cửa hàng', type: 'screen', screen: 'Cửa hàng' },
  ];

  const handleSearch = () => {
    if (searchText.trim() === '') {
      return;
    }

    const matched = quickSearchData.filter(item =>
      item.keyword.toLowerCase().includes(searchText.toLowerCase())
    );

    if (matched.length > 0) {
      navigation.navigate('SearchResult', { searchResults: matched });
      setSearchText('');
    } else {
      Alert.alert('Không tìm thấy', 'Không có kết quả phù hợp.');
    }
  };

  const handleLogoPress = () => {
    onCartPress();
    navigation.navigate('Home')
  };

  const handleMessagePress = () => {
    onCartPress();
    navigation.navigate('Hộp thư')
  };
  const handleCartPress = () => {
    onCartPress();
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogoPress}>
        <Image
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png" }}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchiconContainer}>
          <Feather name="search" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleCartPress} style={styles.CartIconContainer}>
        <Feather name="shopping-cart" size={20} color={COLORS.textPrimary} />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleMessagePress} style={styles.messageIconContainer}>
        <Feather name="message-circle" size={20} color={COLORS.textPrimary} />
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flex: 1,
    width: '100%',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: COLORS.header,
    paddingHorizontal: 10,
    zIndex: 1000,
    elevation: 5,
  },
  logo: {
    width: 50,
    height: 35,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.border,
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
    paddingRight: 0,
  },
  searchiconContainer: {
    padding: 5,
  },
  CartIconContainer: {
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  messageIconContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchResultList: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    maxHeight: 250,
    zIndex: 999,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
  },

  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },

  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },

  resultPrice: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 4,
  },
});

export default Header;