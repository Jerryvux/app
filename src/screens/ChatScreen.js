import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';
import { FONT_SIZES, SPACING } from '../styles/textStyle';
import { useAuth } from '../context/AuthProvider';
import MessageItem from '../components/common/MessageItem';
import { useChat } from '../hooks/useChat';
import globalStyles from '../styles/globalStyles';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sellerId, sellerName, sellerAvatar, productId, productName, conversationId: initialConversationId } = route.params;

  console.log('ChatScreen route params:', route.params);

  const { user, isLoggedIn } = useAuth();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const {
    messages,
    loading,
    sending,
    otherUser,
    handleSend,
    handleDeleteMessage,
  } = useChat(user?.id, sellerId, productId, initialConversationId);

  if (!isLoggedIn) {
    Alert.alert(
      'Lỗi',
      'Bạn cần đăng nhập để xem tin nhắn.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    return null;
  }

  const onSend = async () => {
    if (!inputText.trim()) return;

    try {
      await handleSend(inputText);
      setInputText('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  const productFromParams = {
    id: route.params.productId,
    name: route.params.productName,
    image: route.params.productImage || route.params.image, // dùng tùy theo route
    price: route.params.productPrice || null
  };

  const product = messages?.find(msg => msg.productId)?.productDetails || productFromParams;


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={FONT_SIZES.extraLarge} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Image
            source={{ uri: otherUser?.avatar || 'https://i.pinimg.com/originals/8a/9d/6e/8a9d6e85a93b8b3a1a6c5c1b3b1e9f9f9e.jpg' }}
            style={styles.headerAvatar}
          />
          <Text style={styles.userName}>{otherUser?.name || 'Người dùng'}</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={FONT_SIZES.extraLarge} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {product && (
        <View style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{product.name || 'Không có tên'}</Text>
            <Text style={styles.productPrice}>{product.price ? `${product.price.toLocaleString('vi-VN')}đ` : 'N/A'}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewProductButton}
            onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product: product })}
          >
            <Text style={styles.viewProductText}>Xem</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem
              message={item}
              isCurrentUser={item.senderId === user?.id}
              onDelete={handleDeleteMessage}
              otherUserAvatar={otherUser?.avatar}
            />
          )}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: SPACING.medium }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={COLORS.gray}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendingButton]}
            onPress={onSend}
            disabled={sending}
          >
            <Ionicons
              name="send"
              size={FONT_SIZES.large}
              color={sending ? COLORS.gray : COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.small,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.small,
  },
  userName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.dark,
  },
  productCard: {
    flexDirection: 'row',
    padding: SPACING.small,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: SPACING.small,
  },
  productInfo: {
    flex: 1,
    marginRight: SPACING.small,
  },
  productName: {
    fontSize: FONT_SIZES.small,
    color: COLORS.dark,
    marginBottom: SPACING.small / 4,
  },
  productPrice: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  viewProductButton: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.small / 2,
    borderRadius: 4,
  },
  viewProductText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.dark,
    fontWeight: '500',
  },
  messageList: {
    flex: 1,
    padding: SPACING.small,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.small,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginRight: SPACING.small,
    maxHeight: 100,
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendingButton: {
    opacity: 0.5,
  },
  otherAvatar: {
  },
  avatarBubbleSpacing: 8,
  myBubbleSideMargin: 8,
  otherBubbleHiddenAvatarMargin: 12,

  deleteButton: {
    display: 'none',
  },
  myDeleteButton: {
    display: 'none',
  },
  otherDeleteButton: {
    display: 'none',
  },
  senderName: {
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SPACING.small / 4,
  },
});

export default ChatScreen;