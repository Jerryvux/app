import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductsContext } from '../context/ProductsContext';
import * as XLSX from 'xlsx';
import * as DocumentPicker from 'expo-document-picker';

const UploadProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addProduct, categories } = useContext(ProductsContext);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!name.trim() || !price || !image || !description.trim() || !selectedCategory) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tất cả các trường và chọn danh mục');
      return;
    }

    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);

      const newProduct = {
        id: uuid.v4(),
        name,
        price: parseInt(price),
        originalPrice: parseInt(price),
        image,
        description,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        userId: user.id,
        rating: 0,
        sold: 0,
        discount: 0,
        createdAt: Date.now(),
      };

      addProduct(newProduct);

      const myProducts = await AsyncStorage.getItem('MyProduct');
      const myProductsList = myProducts ? JSON.parse(myProducts) : [];
      const updatedMyProducts = [newProduct, ...myProductsList];
      await AsyncStorage.setItem('MyProduct', JSON.stringify(updatedMyProducts));

      Alert.alert('Thành công', 'Sản phẩm đã được đăng');
      setName('');
      setPrice('');
      setImage(null);
      setDescription('');
      setSelectedCategory(null);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      if (result.type !== 'success') {
        throw new Error('Không chọn được file');
      }

      const fileBlob = await fetch(result.uri);
      const fileBuffer = await fileBlob.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet);

      const uploadedProducts = [];
      const userData = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userData);

      for (const row of data) {
        const category = categories.find(cat => cat.name === row['Danh Mục']);
        if (!category) {
          console.warn(`Category not found for name: ${row['Danh Mục']}`);
          continue;
        }

        const newProduct = {
          id: uuid.v4(),
          name: row['Tên Sản Phẩm'],
          price: parseInt(row['Giá']),
          originalPrice: parseInt(row['Giá']),
          image: row['Ảnh'],
          description: row['Mô Tả'],
          categoryId: category.id,
          categoryName: category.name,
          userId: user.id,
          rating: 0,
          sold: 0,
          discount: 0,
          createdAt: Date.now(),
        };

        addProduct(newProduct);

        const myProducts = await AsyncStorage.getItem('MyProduct');
        const myProductsList = myProducts ? JSON.parse(myProducts) : [];
        const updatedMyProducts = [newProduct, ...myProductsList];
        await AsyncStorage.setItem('MyProduct', JSON.stringify(updatedMyProducts));

        uploadedProducts.push(newProduct);
      }

      Alert.alert('Thành công', `Đã upload ${uploadedProducts.length} sản phẩm`);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể upload file Excel');
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categorySelectItem}
      onPress={() => {
        setSelectedCategory(item);
        setCategoryModalVisible(false);
      }}
    >
      <Text style={styles.categorySelectItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Đăng sản phẩm mới</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Feather name="image" size={FONT_SIZES.extraLarge * 1.5} color={COLORS.gray} />
        )}
        <Text style={styles.imageText}>Chọn ảnh sản phẩm</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Tên sản phẩm"
        placeholderTextColor={COLORS.gray}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá sản phẩm"
        placeholderTextColor={COLORS.gray}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text style={selectedCategory ? styles.selectedCategoryText : styles.placeholderText}>
          {selectedCategory ? selectedCategory.name : "Chọn danh mục"}
        </Text>
      </TouchableOpacity>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Mô tả sản phẩm"
        placeholderTextColor={COLORS.gray}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang đăng...' : 'Đăng sản phẩm'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.secondary, marginTop: SPACING.small }]} onPress={handleExcelUpload}>
        <Text style={styles.buttonText}>Tải lên từ Excel</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCategoryItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.medium,
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
    color: COLORS.dark,
    textAlign: 'center',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.lightGray2,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageText: {
    marginTop: SPACING.small,
    color: COLORS.gray,
    fontSize: FONT_SIZES.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: SPACING.small,
    marginBottom: SPACING.medium,
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  selectedCategoryText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  placeholderText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.gray,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.medium,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SPACING.medium,
    color: COLORS.dark,
    textAlign: 'center',
  },
  categorySelectItem: {
    padding: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  categorySelectItemText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  closeModalButton: {
    marginTop: SPACING.medium,
    padding: SPACING.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
    fontWeight: 'bold',
  },
});

export default UploadProductScreen;