import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { SIZES } from '../styles/textStyle';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '../styles/globalStyles';
import Header from '../components/Header';
import { ProductsContext } from '../context/ProductsContext';
import { productAPI } from '../data/api';

const ProductManagement = ({ navigation }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(ProductsContext);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    images: [],
    description: '',
    rating: '',
    sold: '',
    colors: [],
    sizes: [],
    categoryId: '',
  });
  const [imageInput, setImageInput] = useState('');

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setNewProduct({
      ...newProduct,
      images: newProduct.images.filter((_, i) => i !== index),
    });
  };

  const handleAddProduct = async () => {
    try {
      const response = await productAPI.create(newProduct);
      addProduct(response.data);
      setNewProduct({
        name: '',
        price: '',
        originalPrice: '',
        discount: '',
        images: [],
        description: '',
        rating: '',
        sold: '',
        colors: [],
        sizes: [],
        categoryId: '',
      });
      Alert.alert('Thành công', 'Sản phẩm đã được thêm');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  const handleUpdateProduct = async (id) => {
    try {
      const response = await productAPI.update(id, newProduct);
      updateProduct(id, response.data);
      Alert.alert('Thành công', 'Sản phẩm đã được cập nhật');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productAPI.delete(id);
      deleteProduct(id);
      Alert.alert('Thành công', 'Sản phẩm đã được xóa');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
    }
  };

  const renderImageCarousel = (images) => (
    <FlatList
      horizontal
      data={images}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.carouselImage} />
      )}
      keyExtractor={(item, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      style={styles.carousel}
    />
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {renderImageCarousel(item.images || [item.image])}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()}đ</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => setNewProduct(item)}
            activeOpacity={0.7}
          >
            <Feather name="edit" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
            activeOpacity={0.7}
          >
            <Feather name="trash-2" size={18} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        onPress={() => navigation.navigate('Home')}
        onCartPress={() => navigation.navigate('Cart')}
        setActiveTab={(tab) => console.log('Active tab:', tab)}
        setIsCartVisible={() => console.log('Toggle cart')}
      />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.title}>Quản lý sản phẩm</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên sản phẩm"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Giá</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập giá"
              value={newProduct.price.toString()}
              onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Giá gốc</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập giá gốc"
              value={newProduct.originalPrice.toString()}
              onChangeText={(text) => setNewProduct({ ...newProduct, originalPrice: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Giảm giá (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập % giảm giá"
              value={newProduct.discount.toString()}
              onChangeText={(text) => setNewProduct({ ...newProduct, discount: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hình ảnh sản phẩm</Text>
            <View style={styles.imageInputWrapper}>
              <TextInput
                style={[styles.input, styles.imageInput]}
                placeholder="Nhập link ảnh"
                value={imageInput}
                onChangeText={setImageInput}
              />
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleAddImage}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            {newProduct.images.length > 0 && (
              <FlatList
                horizontal
                data={newProduct.images}
                renderItem={({ item, index }) => (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: item }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Feather name="x" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                style={styles.imageList}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập mô tả sản phẩm"
              value={newProduct.description}
              onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={() =>
              newProduct.id ? handleUpdateProduct(newProduct.id) : handleAddProduct()
            }
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {newProduct.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productList}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingTop: HEADER_HEIGHT,
    paddingBottom: FOOTER_HEIGHT,
  },
  form: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding / 2,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SIZES.padding,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SIZES.base / 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    fontSize: 14,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageInput: {
    flex: 1,
    marginRight: SIZES.base,
  },
  addImageButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageList: {
    marginTop: SIZES.base,
  },
  imagePreview: {
    position: 'relative',
    marginRight: SIZES.base,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base + 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: SIZES.padding / 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SIZES.padding,
    marginLeft: SIZES.padding / 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 0.48,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    margin: SIZES.base / 2,
    padding: SIZES.base,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  carousel: {
    marginBottom: SIZES.base,
  },
  carouselImage: {
    width: 150,
    height: 150,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base / 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: SIZES.base / 2,
  },
  productPrice: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: SIZES.base,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.base / 2,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SIZES.base / 2,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
});

export default ProductManagement;