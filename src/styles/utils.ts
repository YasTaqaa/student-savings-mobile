import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#007AFF',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FFD60A',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F2F2F7',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#AEAEB2',
    500: '#8E8E93',
    600: '#636366',
  }
};

export const common = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  itemsCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  
  bgWhite: {
    backgroundColor: colors.white,
  },
  bgGray50: {
    backgroundColor: colors.gray[50],
  },
  bgGray100: {
    backgroundColor: colors.gray[100],
  },
  bgPrimary: {
    backgroundColor: colors.primary,
  },
  bgSuccess: {
    backgroundColor: colors.success,
  },
  bgDanger: {
    backgroundColor: colors.danger,
  },
  bgBlue50: {
    backgroundColor: '#E8F4FD',
  },
  
  p2: {
    padding: 8,
  },
  p3: {
    padding: 12,
  },
  p4: {
    padding: 16,
  },
  p5: {
    padding: 20,
  },
  px4: {
    paddingHorizontal: 16,
  },
  py2: {
    paddingVertical: 8,
  },
  py3: {
    paddingVertical: 12,
  },
  py4: {
    paddingVertical: 16,
  },
  
  mt2: {
    marginTop: 8,
  },
  mt3: {
    marginTop: 12,
  },
  mt4: {
    marginTop: 16,
  },
  mt5: {
    marginTop: 20,
  },
  mb1: {
    marginBottom: 4,
  },
  mb2: {
    marginBottom: 8,
  },
    mb3: {
        marginBottom: 12,
    },
  mb4: {
    marginBottom: 16,
  },
  mr2: {
    marginRight: 8,
  },
  
  textWhite: {
    color: colors.white,
  },
  textBlack: {
    color: colors.black,
  },
  textGray500: {
    color: colors.gray[500],
  },
  textPrimary: {
    color: colors.primary,
  },
  textSuccess: {
    color: colors.success,
  },
  textDanger: {
    color: colors.danger,
  },
  
  // Text Alignment
  textCenter: {
    textAlign: 'center',
  },
  
  // Text Sizes
  textXs: {
    fontSize: 12,
  },
  textSm: {
    fontSize: 14,
  },
  textBase: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textXl: {
    fontSize: 20,
  },
  text2xl: {
    fontSize: 24,
  },
  text3xl: {
    fontSize: 28,
  },
  
  // Font Weight
  fontBold: {
    fontWeight: 'bold' as TextStyle['fontWeight'],
  },
  fontSemibold: {
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  fontMedium: {
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  // Border Radius
  rounded: {
    borderRadius: 8,
  },
  roundedLg: {
    borderRadius: 12,
  },
  roundedXl: {
    borderRadius: 16,
  },
  rounded2xl: {
    borderRadius: 20,
  },
  roundedFull: {
    borderRadius: 999,
  },
  
  // Border
  border: {
    borderWidth: 1,
  },
  borderB: {
    borderBottomWidth: 1,
  },
  borderL: {
    borderLeftWidth: 1,
  },
  borderGray100: {
    borderColor: colors.gray[100],
  },
  borderPrimary: {
    borderColor: colors.primary,
  },
  
  // Shadow
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  
  // Size
  w14: {
    width: 56,
  },
  h14: {
    height: 56,
  },
  w15: {
    width: 60,
  },
  h15: {
    height: 60,
  },
  
  // Position
  absolute: {
    position: 'absolute' as ViewStyle['position'],
  },
  
  // Overflow
  overflowHidden: {
    overflow: 'hidden' as ViewStyle['overflow'],
  },
});

// Container styles
export const container = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%' as any,
  },
});

// Card styles
export const card = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

// Button styles
export const button = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: colors.gray[50],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  danger: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  textWhite: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
});

// Input styles
export const input = StyleSheet.create({
  base: {
    backgroundColor: colors.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: colors.black,
    marginBottom: 6,
    marginTop: 12,
  },
});

// FAB styles
export const fab = StyleSheet.create({
  base: {
    position: 'absolute' as ViewStyle['position'],
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  text: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300' as TextStyle['fontWeight'],
  },
});