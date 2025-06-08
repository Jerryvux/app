import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthProvider';
import globalStyles from '../styles/globalStyles';

const ProfileScreen = () => {
  const { user, isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    console.log('ProfileScreen - State updated. isLoggedIn:', isLoggedIn, ', user:', user ? 'Exists' : 'Null');
    console.log('ProfileScreen - User role:', user?.role);
  }, [isLoggedIn, user]);

  useFocusEffect(
    useCallback(() => {
      console.log('ProfileScreen - Focused. Checking state.');
      const timer = setTimeout(() => {
        setShowContent(true);
        console.log('ProfileScreen - Setting showContent to true.');
      }, 50);

      return () => {
        console.log('ProfileScreen - Unfocused. Clearing timer.');
        clearTimeout(timer);
        setShowContent(false);
      };
    }, [isLoggedIn, user])
  );

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn hình!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      try {
        setLoading(true);
        const updatedUserData = { ...user, avatar: imageUri };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật (chỉ cục bộ).');
      } catch (err) {
        console.error('Lỗi khi lưu ảnh:', err);
        Alert.alert('Lỗi', 'Không thể lưu ảnh đại diện.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('Xác nhận', 'Bạn có muốn đăng xuất?', [
      { text: 'Hủy' },
      {
        text: 'Đăng xuất',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (err) {
            console.error('Lỗi khi đăng xuất:', err);
            Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (authLoading || loading || !showContent) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <View style={[globalStyles.container, globalStyles.centered]}>
        <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin tài khoản</Text>
        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.large * 2 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} disabled={loading}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a8002896da71882a3.jpg' }}
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={FONT_SIZES.large} color={COLORS.white} />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'Chưa cập nhật'}</Text>
        <Text style={styles.userId}>ID: {user?.id || 'N/A'}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={FONT_SIZES.medium} color={COLORS.white} style={{ marginRight: SPACING.small / 2 }} />
            <Text style={styles.editProfileText}>Sửa hồ sơ</Text>
          </TouchableOpacity>
          {user?.role !== 'ADMIN' && (
            <TouchableOpacity
              style={styles.uploadProductBtn}
              onPress={() => navigation.navigate('UploadProductScreen')}
            >
              <Ionicons name="add-circle-outline" size={FONT_SIZES.medium} color={COLORS.white} style={{ marginRight: SPACING.small / 2 }} />
              <Text style={styles.uploadProductText}>+ Đăng sản phẩm</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          label="Thông tin cá nhân"
          onPress={() => navigation.navigate('EditProfile')}
        />
        {user?.role !== 'ADMIN' && (
          <>
            <MenuItem
              icon="cart-outline"
              label="Đơn hàng của tôi"
              onPress={() => navigation.navigate('OrderList')}
            />
            <MenuItem
              icon="albums-outline"
              label="Sản phẩm của tôi"
              onPress={() => navigation.navigate('MyProduct')}
            />
            <MenuItem
              icon="heart-outline"
              label="Sản phẩm yêu thích"
              onPress={() => navigation.navigate('FavoriteProducts')}
            />
          </>
        )}
        <MenuItem
          icon="settings-outline"
          label="Cài đặt"
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="log-out-outline"
          label="Đăng xuất"
          onPress={handleLogout}
        />
      </View>

      {user.role === 'ADMIN' && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate('Admin')}
        >
          <Text style={styles.adminButtonText}>Bảng điều khiển Admin</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemContent}>
      <Ionicons name={icon} size={FONT_SIZES.large} color={COLORS.primary} />
      <Text style={styles.menuItemLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={FONT_SIZES.medium} color={COLORS.gray} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.medium,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: SPACING.small,
  },
  userName: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  userEmail: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
  },
  userId: {
    fontSize: FONT_SIZES.small,
    color: COLORS.gray,
    marginBottom: SPACING.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.medium,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginRight: SPACING.small,
  },
  editProfileText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
  },
  uploadProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
  },
  uploadProductText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.medium,
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.medium,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.large,
    borderRadius: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: '500',
  },
  adminButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  adminButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;