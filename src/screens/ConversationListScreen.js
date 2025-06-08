import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { getUserConversations, getUserProfile } from '../data/api';
import { useAuth } from '../context/AuthProvider';
import { pickAndProcessExcelFile } from '../services/ProductUploadService';

const ConversationListScreen = ({ navigation: propNavigation }) => {
  const navigationHook = useNavigation();
  const navigation = propNavigation || navigationHook;
  const [conversations, setConversations] = useState([]);
  const [enrichedConversations, setEnrichedConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('ConversationListScreen - useEffect [isFocused, user, isLoggedIn] triggered. Is focused:', isFocused, ', User:', user?.id, ', Is Logged In:', isLoggedIn); // Log useEffect trigger
    if (isFocused && user && isLoggedIn) {
      const loadConversations = async () => {
        console.log('ConversationListScreen - loadConversations function called.');
        setLoading(true);
        try {
          console.log('ConversationListScreen - Calling getUserConversations for user ID:', user.id);
          const conversationsData = await getUserConversations(user.id);
          console.log('ConversationListScreen - getUserConversations response:', conversationsData.data);

          const fetchedConversations = conversationsData.data || [];
          setConversations(fetchedConversations);

          const enrichedList = await Promise.all(fetchedConversations.map(async (item) => {
            try {
              let otherUser = null;
              if (item.buyer && item.buyer.id !== user.id) {
                otherUser = item.buyer;
              } else if (item.seller && item.seller.id !== user.id) {
                otherUser = item.seller;
              }

              if (!otherUser) {
                const otherUserId = item.buyer_id === user.id ? item.sellerId : item.buyerId;
                if (otherUserId) {
                  try {
                    const userProfileResponse = await getUserProfile(otherUserId);
                    otherUser = userProfileResponse.data;
                  } catch (fetchError) {
                    console.error('Error fetching user profile for conversation ID:', item.id, 'User ID:', otherUserId, fetchError);
                    // If fetching fails, otherUser remains null
                  }
                } else {
                  console.warn('Conversation item missing both nested user objects and buyer/seller IDs:', item);
                }
              }

              if (!otherUser) {
                console.warn('Skipping enriching conversation item due to missing otherUser data after fetch attempt:', item);
                return null;
              }

              return {
                ...item,
                otherUser: otherUser
              };
            } catch (error) {
              console.error('Unexpected error processing conversation item:', item.id, error);
              return { ...item, otherUser: null };
            }
          }));

          setEnrichedConversations(enrichedList.filter(item => item !== null));
          console.log('ConversationListScreen - Enriched conversations state updated. Count:', enrichedList.filter(item => item !== null).length);

        } catch (error) {
          console.error('Error loading conversations:', error);
        } finally {
          setLoading(false);
          console.log('ConversationListScreen - Loading set to false.');
        }
      };
      loadConversations();
    } else if (!isLoggedIn) {
      navigation.replace('Hồ sơ');
    }
  }, [isFocused, user, isLoggedIn, navigation]);


  useEffect(() => {
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>Vui lòng đăng nhập để xem tin nhắn</Text>
      </View>
    );
  }

  const renderConversation = ({ item }) => {
    const { otherUser } = item;

    if (!otherUser) {
      console.warn('Skipping rendering conversation item due to missing otherUser data:', item);
      return null;
    }

    console.log('Rendering conversation item with last_message:', item.last_message);


    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          otherUser: otherUser,
          productId: item.product_id,
          productName: item.product?.name,
          productImage: item.product?.image,
          productPrice: item.product?.price,
          sellerId: item.sellerId,
          sellerName: otherUser?.name,
          sellerAvatar: otherUser?.avatar
        })}
      >
        <Image
          source={{ uri: otherUser.avatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />

        <View style={styles.conversationInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{otherUser.name}</Text>
            <Text style={styles.time}>
              {new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <Text
            style={[styles.lastMessage, !item.is_read && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.last_message || 'Bắt đầu cuộc trò chuyện'}
          </Text>

          {item.product_id && item.product && (
            <View style={styles.productInfo}>
              <Image
                source={{ uri: item.product.image }}
                style={styles.productImage}
              />
              <Text style={styles.productName} numberOfLines={1}>
                {item.product.name}
              </Text>
            </View>
          )}
        </View>

        {!item.is_read && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity onPress={async () => {
          try {
            const result = await pickAndProcessExcelFile(user);
            Alert.alert('Thành công', `Đã upload ${result.length} sản phẩm`);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể upload sản phẩm');
          }
        }}>
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có cuộc trò chuyện nào</Text>
        </View>
      ) : (
        <FlatList
          data={enrichedConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  list: {
    padding: 12,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  unreadMessage: {
    fontWeight: '600',
    color: COLORS.dark,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  productImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 6,
  },
  productName: {
    fontSize: 12,
    color: COLORS.dark,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default ConversationListScreen;