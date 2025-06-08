import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [language, setLanguage] = useState('Tiếng Việt');

  const handleLanguageChange = () => {
    Alert.alert('Chọn ngôn ngữ', '', [
      { text: 'Tiếng Việt', onPress: () => setLanguage('Tiếng Việt') },
      { text: 'English', onPress: () => setLanguage('English') },
    ]);
  };

  const handleSupport = () => {
    Alert.alert(
      'Trung tâm hỗ trợ',
      'Zalo: 0123 456 789\nEmail: support@yourapp.vn',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Thay đổi mật khẩu */}
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
        <View style={styles.icon}>
          <Feather name="lock" size={FONT_SIZES.medium} color={COLORS.primary} />
        </View>
        <Text style={styles.optionText}>Thay đổi mật khẩu</Text>
        <Feather name="chevron-right" size={FONT_SIZES.medium} color={COLORS.gray} />
      </TouchableOpacity>

      {/* Thông báo */}
      <View style={styles.option}>
        <View style={styles.icon}>
          <Ionicons name="notifications-outline" size={FONT_SIZES.medium} color={COLORS.primary} />
        </View>
        <Text style={styles.optionText}>Thông báo</Text>
        <Switch
          value={notificationEnabled}
          onValueChange={setNotificationEnabled}
        />
      </View>

      {/* Ngôn ngữ */}
      <TouchableOpacity style={styles.option} onPress={handleLanguageChange}>
        <View style={styles.icon}>
          <MaterialIcons name="language" size={FONT_SIZES.medium} color={COLORS.primary} />
        </View>
        <Text style={styles.optionText}>Ngôn ngữ: {language}</Text>
        <Feather name="chevron-right" size={FONT_SIZES.medium} color={COLORS.gray} />
      </TouchableOpacity>

      {/* Trung tâm hỗ trợ */}
      <TouchableOpacity style={styles.option} onPress={handleSupport}>
        <View style={styles.icon}>
          <Feather name="help-circle" size={FONT_SIZES.medium} color={COLORS.primary} />
        </View>
        <Text style={styles.optionText}>Trung tâm hỗ trợ</Text>
        <Feather name="chevron-right" size={FONT_SIZES.medium} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.large,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    justifyContent: 'space-between',
  },
  icon: {
    width: 30,
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
});

export default SettingsScreen;
