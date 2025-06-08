import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllVideos } from '../data/api';
import { COLORS } from '../styles/colors';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

const VideoScreen = ({ navigation }) => {
  const videoRefs = useRef({});
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isLiked, setIsLiked] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const likeScale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('Vui lòng đăng nhập để xem video.');
          setLoading(false);
          return;
        }
        console.log('Fetching videos from API...');
        const response = await getAllVideos();
        console.log('Videos response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((video, index) => {
            console.log(`Video ${index} - URL: ${video.videoUrl}`);
          });
        } else {
          console.log('No valid video data received');
        }
        const fetchedVideos = response.data || [];
        setVideos(fetchedVideos);
        setCurrentVideoId(fetchedVideos.length > 0 ? fetchedVideos[0].id : null);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch videos:', err.message);
        setError('Không thể tải video. Vui lòng kiểm tra kết nối mạng.');
        setVideos([]);
        setCurrentVideoId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    Object.keys(videoRefs.current).forEach(videoId => {
      videoRefs.current[videoId]?.setStatusAsync({ shouldPlay: false });
    });

    if (isFocused && currentVideoId !== null) {
      videoRefs.current[currentVideoId]?.setStatusAsync({ shouldPlay: true, isMuted: isMuted });
    }

  }, [isFocused, currentVideoId, isMuted]);

  const handleLike = useCallback((id) => {
    setIsLiked((prev) => {
      const newLiked = { ...prev, [id]: !prev[id] };
      if (!prev[id]) {
        Animated.sequence([
          Animated.timing(likeScale, {
            toValue: 1.5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(likeScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
      return newLiked;
    });
  }, [likeScale]);

  const handleDoubleTap = useCallback((id) => {
    if (!isLiked[id]) {
      handleLike(id);
    }
  }, [isLiked, handleLike]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (currentVideoId !== null && videoRefs.current[currentVideoId]) {
      videoRefs.current[currentVideoId].setStatusAsync({ isMuted: !isMuted });
    }
  }, [isMuted, currentVideoId]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      setCurrentVideoId(item.id);
    }
  }).current;

  const isValidVideoUrl = (url) => {
    return url && typeof url === 'string' && (url.endsWith('.mp4') || url.endsWith('.mov'));
  };

  const renderVideo = ({ item, index }) => {
    const isCurrentVideo = currentVideoId === item.id;
    const liked = isLiked[item.id] || false;

    if (!isValidVideoUrl(item.videoUrl)) {
      console.warn(`Invalid video URL for item ${item.id}: ${item.videoUrl}`);
      return (
        <View style={styles.videoContainer}>
          <Text style={{ color: COLORS.white, textAlign: 'center' }}>
            URL video không hợp lệ
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={() => handleToggleMute()}
        onPressIn={() => {
          const now = Date.now();
          if (now - lastTap.current < 300) {
            handleDoubleTap(item.id);
          }
          lastTap.current = now;
        }}
      >
        <Video
          ref={ref => {
            if (ref) {
              videoRefs.current[item.id] = ref;
            } else {
              delete videoRefs.current[item.id];
            }
          }}
          style={styles.videoPlayer}
          source={{ uri: item.videoUrl }}
          resizeMode="cover"
          shouldPlay={isCurrentVideo && isFocused && !loading}
          isLooping={true}
          isMuted={isMuted}
          onLoadStart={() => {
            if (isCurrentVideo) setLoading(true);
          }}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              if (isCurrentVideo && loading) setLoading(false);
            } else if (status.error) {
              console.error('Video playback error:', status.error);
              if (isCurrentVideo) {
                Alert.alert('Lỗi phát video', 'Không thể phát video này.', [{ text: 'OK' }]);
                setLoading(false);
              }
            }
          }}
        />

        {isCurrentVideo && loading && (
          <ActivityIndicator
            style={styles.loadingIndicator}
            size="large"
            color={COLORS.white}
          />
        )}

        <View style={styles.videoInfo}>
          <TouchableOpacity onPress={() => Alert.alert('Mở trang người dùng!')}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: item.avatar || 'https://via.placeholder.com/40' }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.userName}>{item.user || 'Unknown'}</Text>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>Theo dõi</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <Text style={styles.videoTitle}>{item.title || 'No Title'}</Text>

          <TouchableOpacity onPress={() => Alert.alert('Mở nhạc!')}>
            <View style={styles.musicContainer}>
              <Ionicons name="musical-notes" size={16} color={COLORS.white} />
              <Text style={styles.musicText}>{item.music || 'Original Sound'}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
            {item.description || 'No description'}
          </Text>
        </View>

        <View style={styles.interactionContainer}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <TouchableOpacity
              style={styles.interactionButton}
              onPress={() => handleLike(item.id)}
            >
              <View style={[styles.iconContainer, liked && styles.likedIconContainer]}>
                <Ionicons
                  name="heart"
                  size={18}
                  color={liked ? '#ff2d55' : COLORS.white}
                />
              </View>
              <Text style={styles.interactionText}>
                {(item.likes || 0).toLocaleString()}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => Alert.alert('Mở bình luận!')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubble" size={18} color={COLORS.white} />
            </View>
            <Text style={styles.interactionText}>
              {(item.comments || 0).toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => Alert.alert('Chia sẻ video!')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="share-social" size={18} color={COLORS.white} />
            </View>
            <Text style={styles.interactionText}>
              {(item.shares || 0).toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => Alert.alert('Mở nhạc!')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="musical-note" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.muteButton} onPress={handleToggleMute}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            getAllVideos()
              .then((response) => {
                setVideos(response.data || []);
                setError(null);
              })
              .catch((err) => {
                console.error('Retry failed:', err.message);
                setError('Không thể tải video. Vui lòng thử lại.');
              })
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không có video để hiển thị.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / height);
          setCurrentVideoId(videos[index].id);
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 80,
        }}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width,
    height,
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  videoInfo: {
    position: 'absolute',
    bottom: 120,
    left: 15,
    right: 80,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  followText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  musicText: {
    color: COLORS.white,
    fontSize: 14,
    marginHorizontal: 8,
  },
  description: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  interactionContainer: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    alignItems: 'center',
  },
  interactionButton: {
    alignItems: 'center',
    marginBottom: 22,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  likedIconContainer: {
    backgroundColor: 'rgba(255,45,85,0.2)',
  },
  interactionText: {
    color: COLORS.white,
    fontSize: 12,
  },
  muteButton: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default VideoScreen;