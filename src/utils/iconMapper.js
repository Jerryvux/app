
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const getCategoryIcon = (iconName, size = 24, color = '#333') => {
  const iconMap = {
    'cellphone': 'cellphone',
    'tshirt-crew': 'tshirt-crew',
    'baby-carriage': 'baby-carriage',
    'lipstick': 'lipstick',
    'home': 'home',
    'laptop': 'laptop',
    'power-plug': 'power-plug',
    'dots-horizontal': 'dots-horizontal'
  };

  return (
    <MaterialCommunityIcons
      name={iconMap[iconName] || 'help-circle'}
      size={size}
      color={color}
    />
  );
};