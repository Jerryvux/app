import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';

const TermsScreen = () => {
  const terms = {
    title: 'Điều khoản dịch vụ (Dữ liệu mẫu)',
    content: `Đây là nội dung điều khoản dịch vụ mẫu. 

              1. Chấp nhận Điều khoản:
                Bằng việc truy cập hoặc sử dụng ứng dụng Shopee (Phiên bản mẫu), bạn đồng ý tuân thủ các điều khoản và điều kiện này.

              2. Thay đổi Điều khoản:
                Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải.

              3. Quyền và Nghĩa vụ:
                Người dùng có quyền truy cập và sử dụng các tính năng của ứng dụng theo quy định. Người dùng có nghĩa vụ cung cấp thông tin chính xác và không thực hiện các hành vi vi phạm pháp luật hoặc gây hại đến hệ thống.

              4. Giới hạn Trách nhiệm:
                Ứng dụng được cung cấp "nguyên trạng" và không đảm bảo về tính liên tục, an toàn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng ứng dụng.

              5. Bảo mật:
                Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo Chính sách bảo mật của chúng tôi.

              6. Luật áp dụng:
                Các điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp Việt Nam.`,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{terms.title}</Text>
        <Text style={styles.content}>{terms.content}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  content: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.medium * 1.5,
    marginBottom: SPACING.large,
  },
});

export default TermsScreen; 