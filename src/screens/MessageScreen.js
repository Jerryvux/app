import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getUserConversations, getUserProfile } from '../data/api';
import { useAuth } from '../context/AuthProvider';

const MessageScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [enrichedConversations, setEnrichedConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('MessageScreen - useEffect [isFocused, user, isLoggedIn] triggered. Is focused:', isFocused, ', User:', user?.id, ', Is Logged In:', isLoggedIn);
    if (isFocused && user && isLoggedIn) {
      const loadConversations = async () => {
        console.log('MessageScreen - loadConversations function called.');
        setLoading(true);
        try {
          console.log('MessageScreen - Calling getUserConversations for user ID:', user.id);
          const conversationsData = await getUserConversations(user.id);
          console.log('MessageScreen - getUserConversations response:', conversationsData.data);

          const fetchedConversations = conversationsData.data || [];
          setConversations(fetchedConversations);

          const enrichedList = await Promise.all(fetchedConversations.map(async (item) => {
            try {
              let otherUser = null;
              let otherUserId = null;

              if (item.buyerId === user.id) {
                otherUserId = item.sellerId;
              } else if (item.sellerId === user.id) {
                otherUserId = item.buyerId;
              }

              if (otherUserId) {
                try {
                  const userProfileResponse = await getUserProfile(otherUserId);
                  otherUser = userProfileResponse.data;
                  console.log('Fetched other user profile:', otherUser);
                } catch (fetchError) {
                  console.error('Error fetching user profile for conversation ID:', item.id, 'Other User ID:', otherUserId, fetchError);
                  otherUser = {
                    id: otherUserId,
                    name: `Người dùng ${otherUserId}`,
                    avatar: 'https://via.placeholder.com/40'
                  };
                }
              }

              if (!otherUser) {
                console.warn('Could not determine other user for conversation item:', item);
                otherUser = {
                  id: 'unknown',
                  name: 'Người dùng không xác định',
                  avatar: 'https://via.placeholder.com/40'
                };
              }

              return {
                ...item,
                otherUser: otherUser,
              };
            } catch (error) {
              console.error('Unexpected error processing conversation item:', item.id, error);
              return { ...item, otherUser: null };
            }
          }));

          setEnrichedConversations(enrichedList.filter(item => item && item.otherUser !== null));
          console.log('MessageScreen - Enriched conversations state updated. Count:', enrichedList.filter(item => item && item.otherUser !== null).length);

        } catch (error) {
          console.error('Error loading conversations:', error);
          Alert.alert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện.');
        } finally {
          setLoading(false);
          console.log('MessageScreen - Loading set to false.');
        }
      };
      loadConversations();
    } else if (!isLoggedIn) {
      console.log('MessageScreen - Not logged in, not redirecting from here.');
    }
  }, [isFocused, user, isLoggedIn]);

  const [search, setSearch] = useState('');

  const renderConversation = ({ item }) => {
    const { otherUser } = item;

    if (!otherUser) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.id,
          otherUser: otherUser,
          productId: item.product_id
        })}
      >
        <Image
          source={{ uri: otherUser.avatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />

        <View style={styles.messageContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{otherUser.name}</Text>
            <Text style={styles.time}>
              {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hộp thư</Text>
        <TouchableOpacity style={styles.iconRight}>
          <Feather name="message-circle" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin nhắn..."
          placeholderTextColor={COLORS.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {enrichedConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Bạn chưa có cuộc trò chuyện nào</Text>
        </View>
      ) : (
        <FlatList
          data={enrichedConversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderConversation}
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
    padding: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  iconRight: {
    padding: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: COLORS.dark,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    resizeMode: 'cover',
    backgroundColor: COLORS.lightGray,
  },
  messageContent: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray,
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

export default MessageScreen;
