import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  headerContainer: { height: 60, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});
export const HEADER_HEIGHT = 60;
export const FOOTER_HEIGHT = 60;