import {DefaultTheme, DarkTheme, Theme} from '@react-navigation/native';

export const LightAppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    text: '#000000',
    primary: '#333',
    card: '#f2f2f2',
  },
};

export const DarkAppTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    text: '#FFFFFF',
    primary: '#FFF',
    card: '#222222',
  },
};

export const fonts = {
  InterRegular: 'Inter-Regular',
  InterMedium: 'Inter-Medium',
  InterSemiBold: 'Inter-SemiBold',
  InterBold: 'Inter-Bold',
  InterBlack: 'Inter-Black',
  InterBlackItalic: 'Inter-BlackItalic',
  InterExtraBold: 'Inter-ExtraBold',
  InterExtraBoldItalic: 'Inter-ExtraBoldItalic',
  InterExtraLight: 'Inter-ExtraLight',
  InterExtraLightItalic: 'Inter-ExtraLightItalic',
  InterItalic: 'Inter-Italic',
  InterMediumItalic: 'Inter-MediumItalic',
  InterSemiBoldItalic: 'Inter-SemiBoldItalic',
  InterThin: 'Inter-Thin',
  InterThinItalic: 'Inter-ThinItalic',
  InterLight: 'Inter-Light',
};
