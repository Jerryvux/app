import { StyleSheet } from 'react-native';
import { COLORS } from './colors';
import { FONT_SIZES, SPACING } from './textStyle';

export const productStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  touchable: {
    flex: 1,
  },
  imageGalleryContainer: {
    width: '100%',
    height: 180,
    marginBottom: 8,
    backgroundColor: COLORS.lightGray,
  },
  galleryImage: {
    width: 300,
    height: '100%',
    resizeMode: 'cover',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 8,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: SPACING.small,
    right: SPACING.small,
    backgroundColor: COLORS.red,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.extraSmall,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small / 2,
  },
  productPrice: {
    color: COLORS.red,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.large,
    marginRight: SPACING.small / 2,
  },
  originalPrice: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.small,
    textDecorationLine: 'line-through',
  },
  productName: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.dark,
    marginBottom: SPACING.small / 2,
    height: FONT_SIZES.medium * 2 * 1.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.dark,
    marginLeft: 2,
  },
  soldText: {
    fontSize: FONT_SIZES.extraSmall,
    color: COLORS.gray,
    marginLeft: 4,
  },
  addToCartButton: {
    position: 'absolute',
    bottom: SPACING.small,
    right: SPACING.small,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productContent: {
    padding: SPACING.small,
  },
}); 