import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../styles/colors';

const EnterAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fromCart, cartItems, totalPrice, product, onSave } = route.params || {};
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');

  
  useEffect(() => {
    if (!product && !fromCart) {
      Alert.alert('Lỗi', 'Không có thông tin sản phẩm.');
      navigation.goBack();
    }
  
    if (fromCart && (!cartItems || cartItems.length === 0)) {
      Alert.alert('Lỗi', 'Giỏ hàng đang trống.');
      navigation.goBack();
    }
  }, [product, fromCart, onSave]);

  const handleContinue = () => {
    if (!name || !phone || !detail) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin địa chỉ');
      return;
    }

    const address = { name, phone, detail };

    if (onSave) {
      onSave(address);
      navigation.goBack();
      return;
    } else {
    navigation.navigate('Checkout', {
      fromCart,
      product: fromCart ? undefined : product,
      cartItems: fromCart ? cartItems : undefined,
      totalPrice,
      address,
      });
    }
    
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Nhập địa chỉ giao hàng</Text>

        <Text style={styles.label}>Họ tên người nhận</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="VD: Nguyễn Văn A"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="VD: 0901234567"
        />

        <Text style={styles.label}>Địa chỉ cụ thể</Text>
        <TextInput
          style={styles.input}
          value={detail}
          onChangeText={setDetail}
          placeholder="VD: 123 đường ABC, phường XYZ, Quận 1, TP.HCM"
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Tiếp tục thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EnterAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
