import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../styles/colors';
import { Ionicons } from '@expo/vector-icons';

const MessageItem = ({ 
  message, 
  isCurrentUser, 
  onDelete,
  otherUserAvatar 
}) => {
  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      {!isCurrentUser && (
        <Image
          source={{ uri: otherUserAvatar }}
          style={styles.avatar}
        />
      )}
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </Text>
        {isCurrentUser && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(message.id)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 15,
    position: 'relative',
  },
  currentUserBubble: {
    backgroundColor: COLORS.primary,
  },
  otherUserBubble: {
    backgroundColor: COLORS.lightGray,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  deleteButton: {
    position: 'absolute',
    right: -20,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
});

export default MessageItem; 