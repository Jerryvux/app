import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClearStorageScreen = () => {
  const handleClearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared successfully.');
      Alert.alert('Thành công', 'Đã xóa toàn bộ dữ liệu AsyncStorage.');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      Alert.alert('Lỗi', 'Không thể xóa AsyncStorage.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xóa dữ liệu ứng dụng</Text>
      <Text style={styles.description}>Nhấn nút bên dưới để xóa toàn bộ dữ liệu được lưu trữ cục bộ trong ứng dụng (bao gồm cả token đăng nhập, dữ liệu người dùng, v.v.). Điều này hữu ích để reset trạng thái ứng dụng.</Text>
      <Button
        title="Xóa toàn bộ AsyncStorage"
        onPress={handleClearAsyncStorage}
        color="red"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
});

export default ClearStorageScreen; 