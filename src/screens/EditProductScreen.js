import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../styles/colors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { productAPI } from '../data/api';

const EditProductScreen = ({ route, navigation }) => {
  const { product: initialProduct } = route.params;
  const [productData, setProductData] = useState(initialProduct || {});
  const [images, setImages] = useState(initialProduct?.images || (initialProduct?.image ? [initialProduct.image] : []));

  useEffect(() => {
    if (initialProduct) {
      setProductData(initialProduct);
      if (initialProduct.images) {
          setImages(initialProduct.images);
      } else if (initialProduct.image) {
          setImages([initialProduct.image]);
      } else {
          setImages([]);
      }
    }
  }, [initialProduct]);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Bạn cần cấp quyền truy cập ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const newImageUris = result.assets.map(asset => asset.uri);
      setImages(prevImages => [...prevImages, ...newImageUris]);
    }
  };

   const handleRemoveImage = (index) => {
        Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa ảnh này?', [
            { text: 'Hủy' },
            { text: 'Xóa', onPress: () => {
                setImages(prevImages => prevImages.filter((_, i) => i !== index));
            }}
        ]);
    };


  const handleUpdate = async () => {
    if (!productData.name || !productData.price || images.length === 0) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin (Tên, Giá) và chọn ít nhất một ảnh');
      return;
    }

    const updatedProduct = { ...productData, images };

    try {
      if (updatedProduct.id && !updatedProduct.userId) {
        await productAPI.update(updatedProduct.id, updatedProduct);
        Alert.alert('Cập nhật thành công', 'Sản phẩm đã được cập nhật qua API.');

      } else {
        const data = await AsyncStorage.getItem('MyProduct');
        const localProducts = JSON.parse(data) || [];
        const existingIndex = localProducts.findIndex(p => p.id === updatedProduct.id);

        let newLocalProducts;
        if (existingIndex > -1) {
          newLocalProducts = localProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
          );
        } else {
          newLocalProducts = [...localProducts, { ...updatedProduct, id: Date.now().toString() }];
        }

        await AsyncStorage.setItem('MyProduct', JSON.stringify(newLocalProducts));
        Alert.alert('Cập nhật thành công', 'Sản phẩm đã được cập nhật cục bộ.');
      }

      navigation.goBack();

    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm.');
    }
  };

   const handleInputChange = (field, value) => {
    setProductData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa sản phẩm</Text>

      <View style={styles.imagePickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                     <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}
                    >
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            ))}
             <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
                <Feather name="plus" size={36} color={COLORS.gray} />
                <Text style={styles.imageText}>Thêm ảnh</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên sản phẩm"
        value={productData.name || ''}
        onChangeText={(text) => handleInputChange('name', text)}
      />
       <TextInput
        style={styles.input}
        placeholder="Mô tả sản phẩm"
        value={productData.description || ''}
        onChangeText={(text) => handleInputChange('description', text)}
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá sản phẩm"
        value={productData.price?.toString() || ''}
        onChangeText={(text) => handleInputChange('price', parseInt(text) || 0)}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.dark
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
   imagePreviewContainer: {
        position: 'relative',
        marginRight: 10,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.white,
        borderRadius: 12,
    },
   addImageButton: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
   },

  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.dark,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default EditProductScreen;
