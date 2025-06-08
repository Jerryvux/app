import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import ForgotPasswordModal from './ForgotPasswordModal';
import Register from './Register';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthProvider';


const LoginScreen = ({ onLoginSuccess }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, setUser, setIsLoggedIn } = useAuth();


  const handleLogin = async () => {
    console.log('LoginScreen - handleLogin called with:', { email, password });
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      console.log('LoginScreen - handleLogin aborted: missing email or password.');
      return;
    }

    setLoading(true);
    console.log('LoginScreen - Calling AuthProvider login.');
    try {
      const authResult = await login(email, password);
      console.log('LoginScreen - AuthProvider login returned:', authResult);

      if (authResult.success && authResult.user) {
        // AsyncStorage saving is handled in AuthProvider now, so no need here
        // await AsyncStorage.setItem('userToken', authResult.token);
        // await AsyncStorage.setItem('userData', JSON.stringify(authResult.user));
        console.log('LoginScreen - Login Successful, navigating to Home.');
        onLoginSuccess?.();
        navigation.replace('Home');
      } else {
        console.log('LoginScreen - Login failed. Showing alert.', authResult.error);
        Alert.alert(
          'Đăng nhập thất bại',
          authResult.error || 'Sai tài khoản hoặc mật khẩu'
        );
      }
    } catch (error) {
      console.error('LoginScreen - Error during login process:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
      console.log('LoginScreen - Loading set to false.');
    }
  };


  const handleForgotPasswordSubmit = (email) => {
    Alert.alert(
      'Thành công',
      `Hướng dẫn reset mật khẩu đã được gửi đến ${email}`,
      [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
    );
  };

  const handleRegister = () => setShowRegister(true);
  const handleBackToLogin = () => setShowRegister(false);
  const handleRegisterSuccess = async (registrationData) => {
    console.log('LoginScreen - handleRegisterSuccess called with data:', registrationData);
    setShowRegister(false);
    setLoading(true);

    const registeredEmail = registrationData?.email;
    const registeredPassword = registrationData?.password;

    if (!registeredEmail || !registeredPassword) {
       console.error('LoginScreen - Cannot automatically login: Missing email or password after registration.', { email: registeredEmail ? 'Exists' : 'Missing', password: registeredPassword ? 'Exists' : 'Missing' });
       Alert.alert('Thông báo', 'Đăng ký thành công nhưng không thể tự động đăng nhập. Vui lòng đăng nhập thủ công.');
       setLoading(false);
       return;
    }

    console.log('LoginScreen - Attempting automatic login after registration.', { email: registeredEmail });
    try {
        const authResult = await login(registeredEmail, registeredPassword);
        console.log('LoginScreen - AuthProvider login returned after registration:', authResult);

        if (authResult.success && authResult.user) {
            console.log('LoginScreen - Automatic login successful after registration. Navigating to Home.');
            onLoginSuccess?.();
            navigation.replace('Home');
        } else {
            console.log('LoginScreen - Automatic login failed after registration. Showing alert.', authResult.error);
            Alert.alert(
                'Thông báo',
                authResult.error || 'Đăng ký thành công nhưng không thể tự động đăng nhập.'
            );
        }
    } catch (error) {
        console.error('LoginScreen - Error during automatic login after registration:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi tự động đăng nhập sau đăng ký.');
    } finally {
        setLoading(false);
        console.log('LoginScreen - Loading set to false after automatic login attempt.');
    }
  };

  const handleSocialLogin = (platform) => {
    Alert.alert('Thông báo', `Đăng nhập bằng ${platform} đang được phát triển`);
  };

  if (showRegister) {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
        navigation={navigation}
      />
    );
  }

  return (
    <View style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={SPACING.large}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoSection}>
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png" }}

              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Chào mừng đến với AppCho!</Text>
            <Text style={styles.subText}>Đăng nhập để tiếp tục</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={FONT_SIZES.extraLarge} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={FONT_SIZES.extraLarge} color={COLORS.gray} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={FONT_SIZES.extraLarge}
                  color={COLORS.gray}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              {['logo-google', 'logo-facebook', 'logo-apple'].map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin(icon.replace('logo-', ''))}
                >
                  <Ionicons
                    name={icon}
                    size={FONT_SIZES.extraLarge * 1.2}
                    color={
                      icon === 'logo-google' ? COLORS.googleRed :
                        icon === 'logo-facebook' ? COLORS.facebookBlue : COLORS.dark
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPasswordSubmit}
      />
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.extraLarge,
  },
  logo: {
    borderRadius: 75,
    width: 150,
    height: 150,
    marginBottom: SPACING.medium,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  welcomeText: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.small / 2,
  },
  subText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.medium,
    height: 50,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: SPACING.small,
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.medium,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.small,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.large,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGray2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.small,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
  registerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
  },
});

export default LoginScreen;