import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

const QuantityControl = ({
  quantity = 1,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
  style
}) => {
  const handleDecrease = () => {
    if (quantity > min) {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onIncrease();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, quantity <= min && styles.disabledButton]}
        onPress={handleDecrease}
        disabled={quantity <= min}
      >
        <Feather name="minus" size={16} color={quantity <= min ? COLORS.gray : COLORS.primary} />
      </TouchableOpacity>

      <Text style={styles.quantity}>{quantity}</Text>

      <TouchableOpacity
        style={[styles.button, quantity >= max && styles.disabledButton]}
        onPress={handleIncrease}
        disabled={quantity >= max}
      >
        <Feather name="plus" size={16} color={quantity >= max ? COLORS.gray : COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    padding: 4,
  },
  button: {
    padding: 4,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.dark,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default QuantityControl; 