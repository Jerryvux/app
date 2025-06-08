import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { Feather } from '@expo/vector-icons';
import { authAPI } from '../data/api';
import { Checkbox } from 'react-native-paper';

const Register = ({ onRegisterSuccess, onBackToLogin, navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
  };

  const handleRegister = async () => {
    if (isSubmitting) {
      console.log('Registration already in progress, ignoring duplicate request');
      return;
    }

    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }
    if (!agreeToPolicy) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản và chính sách');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const userData = {
        name,
        email: email.trim(),
        password,
        phone: phone.trim(),
      };

      console.log('RegisterScreen - Attempting registration with:', userData);
      const response = await authAPI.register(userData);

      if (response.data && response.data.id) {
        Alert.alert('Thành công', 'Đăng ký thành công!');
        if (onRegisterSuccess) {
          onRegisterSuccess({
            user: response.data,
            token: response.data.token,
            email: email,
            password: password
          });
        } else {
          onBackToLogin();
        }
      } else {
        Alert.alert('Lỗi', response.data?.message || 'Đăng ký thất bại: Phản hồi từ máy chủ không hợp lệ.');
      }
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      let errorMessage = 'Không thể đăng ký. Vui lòng thử lại.';

      if (err.response?.data === "Email đã tồn tại") {
        errorMessage = "Email đã được sử dụng. Vui lòng sử dụng email khác.";
      } else if (err.response?.data === "Mật khẩu phải có ít nhất 6 ký tự") {
        errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        placeholderTextColor={COLORS.gray}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.gray}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor={COLORS.gray}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Mật khẩu"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Feather name={showPassword ? 'eye' : 'eye-off'} size={FONT_SIZES.large} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor={COLORS.gray}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
          <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={FONT_SIZES.large} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.policyContainer}>
        <Checkbox
          status={agreeToPolicy ? 'checked' : 'unchecked'}
          onPress={() => setAgreeToPolicy(!agreeToPolicy)}
          color={COLORS.primary}
        />
        <Text style={styles.policyText}>
          Tôi đồng ý với{' '}
          <Text style={styles.policyLink} onPress={() => navigation.navigate('Terms')}>
            Điều khoản dịch vụ
          </Text>
          {' '}và{' '}
          <Text style={styles.policyLink} onPress={() => navigation.navigate('Privacy')}>
            Chính sách bảo mật
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading || isSubmitting}
      >
        {loading || isSubmitting ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onBackToLogin} style={styles.loginLink}>
        <Text style={styles.loginLinkText}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.large,
    justifyContent: 'center',
  },
  header: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.medium,
    top: SPACING.medium / 2,
    zIndex: 1,
  },
  loginLink: {
    marginTop: SPACING.medium,
    alignItems: 'center',
  },
  loginLinkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  policyText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginLeft: SPACING.small,
  },
  policyLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default Register;