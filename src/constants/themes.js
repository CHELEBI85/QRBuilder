/**
 * Tema renkleri — QRBuilder_Master_Guide.md §8.
 *
 * Geriye dönük uyumluluk (eski kod kırılmasın):
 * - `text` → `textPrimary` ile aynı
 * - `textMuted` → `textTertiary` ile aynı (eski "muted" kullanımı)
 * - `accent` → `primary` ile aynı (eski ekranlar CTA için theme.accent kullanıyordu)
 * - `accentLight` → `primarySoft` ile aynı
 *
 * Rehberdeki ikincil mint/teal vurgusu: `accentSecondary` + `accentSecondarySoft`
 * (eski `accent` anahtarı primary’ye bağlı olduğu için teal için ayrı isim verildi.)
 *
 * Rehber §8’deki mint/teal çifti: `accentSecondary` + `accentSoft` (ikisi de aynı soft ton;
 * `accentSoft` doğrudan rehber ismiyle erişim içindir.)
 */

import { spacing, radius, typography, shadows } from './designTokens';

/** Light — §8.2 */
const lightPalette = {
  mode: 'light',
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF2FF',
  card: '#FFFFFF',
  border: '#E5EAF3',
  divider: '#D9E1EE',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textOnPrimary: '#FFFFFF',
  primary: '#4F46E5',
  primaryPressed: '#4338CA',
  primarySoft: '#EEF2FF',
  accentSecondary: '#14B8A6',
  accentSecondarySoft: '#E6FFFB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  qrDark: '#111827',
  qrLight: '#FFFFFF',
  previewBg: '#F8FAFC',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5EAF3',
  inputBackground: '#F0F4FC',
  /** Eski API: rgba dizesi (nerede kullanılırsa) */
  shadow: 'rgba(79, 70, 229, 0.12)',
};

/** Dark — §8.3 */
const darkPalette = {
  mode: 'dark',
  background: '#0B1020',
  surface: '#121A2B',
  surfaceSecondary: '#182238',
  card: '#121A2B',
  border: '#24324B',
  divider: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  primary: '#7C78FF',
  primaryPressed: '#6A63F6',
  primarySoft: '#23285A',
  accentSecondary: '#2DD4BF',
  accentSecondarySoft: '#0F2E2C',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',
  qrDark: '#F8FAFC',
  qrLight: '#0F172A',
  previewBg: '#0F172A',
  tabBar: '#121A2B',
  tabBarBorder: '#24324B',
  inputBackground: '#121A2B',
  shadow: 'rgba(124, 120, 255, 0.18)',
};

function buildTheme(palette, shadowPresetKey) {
  const { mode, ...rest } = palette;
  return {
    mode,
    ...rest,
    /** @deprecated — `textPrimary` kullanın */
    text: palette.textPrimary,
    /** @deprecated — `textTertiary` kullanın */
    textMuted: palette.textTertiary,
    /**
     * @deprecated — `primary` kullanın. Eski kod theme.accent ile CTA boyuyordu;
     * rehberdeki ana CTA rengi primary ile aynı tutuldu.
     */
    accent: palette.primary,
    /** @deprecated — `primarySoft` kullanın */
    accentLight: palette.primarySoft,
    /** Rehber §8 mint yumuşak — `accentSecondarySoft` ile aynı */
    accentSoft: palette.accentSecondarySoft,
    spacing,
    radius,
    typography,
    shadowStyle: shadows[shadowPresetKey],
  };
}

export const lightTheme = buildTheme(lightPalette, 'light');
export const darkTheme = buildTheme(darkPalette, 'dark');
