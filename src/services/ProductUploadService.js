import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

/**
 * Chọn file Excel và xử lý để lấy danh sách sản phẩm
 * @param {Object} user - Thông tin người dùng đang đăng nhập (phải chứa user.id)
 * @returns {Promise<Array>} Danh sách sản phẩm đã upload
 */
export const pickAndProcessExcelFile = async (user) => {
    try {
        if (!user || !user.id) {
            throw new Error('Người dùng không hợp lệ');
        }

        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        if (result.type !== 'success') {
            throw new Error('Không chọn được file Excel');
        }

        const fileBlob = await fetch(result.uri);
        const fileBuffer = await fileBlob.arrayBuffer();
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const categoriesData = await AsyncStorage.getItem('Categories');
        const categories = categoriesData ? JSON.parse(categoriesData) : [];

        const uploadedProducts = [];

        for (const row of data) {
            const category = categories.find(cat => cat.name === row['Danh Mục']);
            if (!category) {
                console.warn(`Không tìm thấy danh mục: ${row['Danh Mục']}`);
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

            // Thêm vào AsyncStorage
            const existingProducts = await AsyncStorage.getItem('MyProduct');
            const productList = existingProducts ? JSON.parse(existingProducts) : [];
            const updatedList = [newProduct, ...productList];
            await AsyncStorage.setItem('MyProduct', JSON.stringify(updatedList));

            uploadedProducts.push(newProduct);
        }

        return uploadedProducts;

    } catch (error) {
        console.error('Lỗi xử lý file Excel:', error);
        throw error;
    }
};
