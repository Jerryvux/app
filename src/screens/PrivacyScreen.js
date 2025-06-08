import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../styles/colors';

const PrivacyScreen = () => {
  const privacy = {
    title: 'Chính sách bảo mật (Dữ liệu mẫu)',
    content: `Đây là nội dung chính sách bảo mật mẫu. 

              1. Thông tin Thu thập:
                Chúng tôi thu thập thông tin cá nhân bạn cung cấp khi đăng ký và sử dụng ứng dụng (ví dụ: tên, email, số điện thoại).

              2. Cách Sử dụng Thông tin:
                Thông tin được sử dụng để cung cấp dịch vụ, xử lý giao dịch, cải thiện ứng dụng và liên lạc với bạn.

              3. Chia sẻ Thông tin:
                Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba trừ khi cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp luật.

              4. Bảo mật Dữ liệu:
                Chúng tôi áp dụng các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn.

              5. Quyền của Bạn:
                Bạn có quyền truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình.

              Vui lòng đọc kỹ trước khi sử dụng.`,
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{privacy.title}</Text>
        <Text style={styles.contentText}>{privacy.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});

export default PrivacyScreen; 