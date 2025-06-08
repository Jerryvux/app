import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';

const FavoriteProductsScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const json = await AsyncStorage.getItem('favorites');
        if (json) {
          setFavorites(JSON.parse(json));
        }
      } catch (err) {
        console.error('Lỗi khi load sản phẩm yêu thích:', err);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={FONT_SIZES.large} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sản phẩm yêu thích</Text>
        <View style={{ width: FONT_SIZES.large }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={FONT_SIZES.extraLarge * 2} color={COLORS.lightGray} style={{ marginBottom: SPACING.medium }} />
          <Text style={styles.emptyText}>Bạn chưa có sản phẩm yêu thích nào.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: SPACING.large }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: SPACING.small,
  },
  name: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  price: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.large * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
});

export default FavoriteProductsScreen;