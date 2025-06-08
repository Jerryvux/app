import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';

const EditProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({ name: '', email: '', phone: '', position: '' });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) setUser(JSON.parse(data));
      } catch (err) {
        console.error('Lỗi tải thông tin:', err);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
      navigation.navigate('Hồ sơ', { reload: true });
    } catch (err) {
      console.error('Lỗi lưu:', err);
      Alert.alert('Lỗi', 'Không thể lưu thông tin');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        value={user.name}
        onChangeText={(text) => setUser({ ...user, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={user.email}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={user.phone}
        onChangeText={(text) => setUser({ ...user, phone: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Vị trí / Địa chỉ"
        value={user.position}
        onChangeText={(text) => setUser({ ...user, position: text })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={FONT_SIZES.medium} color={COLORS.white} />
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    flexGrow: 1,
  },
  title: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SPACING.large,
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    fontSize: FONT_SIZES.medium,
    marginBottom: SPACING.medium,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SPACING.small,
    fontSize: FONT_SIZES.medium,
  },
});

export default EditProfileScreen;
