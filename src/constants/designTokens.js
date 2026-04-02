/**
 * Merkezi design token'ları (QRBuilder_Master_Guide.md §9–12).
 * Renkler themes.js içinde; burada yalnızca boyut, tipografi ve gölge ölçüleri.
 */

import { Platform } from 'react-native';

/** §10 — 4 tabanlı spacing */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

/** §11 — radius */
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

/**
 * §9 — tipografi rolleri (fontSize / lineHeight / fontWeight).
 * Renk kullanıcı theme.text* üzerinden verilir.
 */
export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '600' },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '600' },
  title2: { fontSize: 24, lineHeight: 30, fontWeight: '600' },
  title3: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  headline: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  subbody: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
};

/**
 * §12 — hafif gölge; kart / CTA için. Dark’ta daha çok yüzey kontrastına güvenilir.
 */
export const shadows = {
  light: Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  dark: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
};
