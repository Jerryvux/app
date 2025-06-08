import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS } from '../styles/colors';

const { width } = Dimensions.get('window');

const BannerSlider = ({ banners }) => {
  const navigation = useNavigation();
  console.log('📸 BannerSlider received banners:', banners);
  if (!Array.isArray(banners) || banners.length === 0) {
    return (
      <View style={styles.noBanner}>
        <Text style={styles.noBannerText}>Vũ Đức Duy </Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
      {banners.map((banner) => (
        <View key={banner.id} style={styles.banner}>
          <Image
            source={{ uri: banner.image }}
            style={styles.image}
            onError={() => console.log('❌ Lỗi load ảnh banner:', banner.image)}
          />
          <View style={styles.overlay} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{banner.title}</Text>
            <Text style={styles.subtitle}>{banner.description || ''}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Vouchers', { bannerId: banner.id })}
            >
              <Text style={styles.buttonText}>Xem thêm</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  banner: {
    width,
    height: width * 0.45,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.storeOverlay || 'rgba(0,0,0,0.3)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  noBanner: {
    width,
    height: width * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  noBannerText: {
    color: COLORS.dark,
    fontSize: 14,
  },
});

export default BannerSlider;