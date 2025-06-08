import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSubmit = () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Lỗi', 'Mật khẩu mới không trùng khớp');
      return;
    }

    Alert.alert('Thành công', 'Mật khẩu đã được cập nhật', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mật khẩu hiện tại</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={oldPass}
        onChangeText={setOldPass}
      />
      <Text style={styles.label}>Mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
      />
      <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Cập nhật mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border || COLORS.buttonDisabled,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
});
