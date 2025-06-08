import { StyleSheet, StatusBar } from 'react-native';
import { COLORS } from './colors';

export default StyleSheet.create({
  
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineContainer: {
    backgroundColor: 'red',
    padding: 10,
  },
  offlineText: {
    color: COLORS.background,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  }
});