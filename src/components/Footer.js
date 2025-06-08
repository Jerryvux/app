import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
import { TABS } from '../utils/constants';

const ICONS = {
  Home: 'home',
  'Cửa hàng': 'shopping-bag',
  Video: 'play-circle',
  'Hộp thư': 'message-circle',
  'Hồ sơ': 'user',
  
};

const Footer = ({ activeTab, setActiveTab }) => {
  const scaleAnimations = useRef(
    Object.fromEntries(
      TABS.map((tab) => [tab, new Animated.Value(activeTab === tab ? 1.1 : 1)])
    )
  ).current;

  useEffect(() => {
    TABS.forEach((tab) => {
      Animated.spring(scaleAnimations[tab], {
        toValue: activeTab === tab ? 1.2 : 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
    });
  }, [activeTab]);

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={styles.tabButton}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnimations[tab] }] }}>
              <Feather
                name={ICONS[tab]}
                size={24}
                color={isActive ? COLORS.primary : COLORS.gray}
              />
            </Animated.View>
            <Text
              style={[
                styles.tabText,
                { color: isActive ? COLORS.primary : COLORS.gray },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default Footer;
