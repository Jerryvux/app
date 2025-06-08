import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions
} from 'react-native';
import { COLORS } from '../styles/colors';
import { getBannerDetails } from '../data/api';

const { width } = Dimensions.get('window');

const BannerDetailScreen = ({ route, navigation }) => {
  const { bannerId } = route.params;
  const [bannerDetails, setBannerDetails] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchBannerDetails = async () => {
      try {
        const details = await getBannerDetails(bannerId);
        setBannerDetails(details.banner);
        setRelatedProducts(details.products);
      } catch (error) {
        console.error('Lỗi tải chi tiết banner:', error);
      }
    };

    fetchBannerDetails();
  }, [bannerId]);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage} 
      />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        {item.price.toLocaleString('vi-VN')}đ
      </Text>
    </TouchableOpacity>
  );

  if (!bannerDetails) {
    return <Text>Đang tải...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: bannerDetails.image }} 
        style={styles.mainBanner} 
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{bannerDetails.title}</Text>
        <Text style={styles.description}>{bannerDetails.description}</Text>

        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            Từ {bannerDetails.startDate} đến {bannerDetails.endDate}
          </Text>
        </View>

        <View style={styles.relatedProductsContainer}>
          <Text style={styles.sectionTitle}>Sản phẩm khuyến mãi</Text>
          <FlatList
            data={relatedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productListContainer}
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Chi tiết chương trình</Text>
          <Text style={styles.detailText}>
            {bannerDetails.fullDescription}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('CategoryProducts', { 
              categoryName: bannerDetails.title 
            });
          }}
        >
          <Text style={styles.actionButtonText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mainBanner: {
    width: '100%',
    height: width * 0.6,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  dateContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    color: COLORS.primary,
    textAlign: 'center',
  },
  relatedProductsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productListContainer: {
    paddingHorizontal: 8,
  },
  productCard: {
    width: width * 0.4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: width * 0.3,
    borderRadius: 8,
  },
  productName: {
    marginTop: 8,
    fontSize: 14,
  },
  productPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BannerDetailScreen;