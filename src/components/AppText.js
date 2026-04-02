import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Tipografi token'ları + tema metin renkleri.
 * `sectionLabel` rehberdeki üst etiket (uppercase bölüm başlığı) için — typography'ye eklenmedi, burada sabit.
 */
const SECTION_LABEL = {
  fontSize: 11,
  lineHeight: 14,
  fontWeight: '700',
  letterSpacing: 1.2,
};

const TONE_COLOR = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  onPrimary: 'textOnPrimary',
  error: 'error',
};

/**
 * @param {'display'|'title1'|'title2'|'title3'|'headline'|'body'|'bodyMedium'|'subbody'|'caption'|'button'|'sectionLabel'} variant
 * @param {'primary'|'secondary'|'tertiary'|'onPrimary'|'error'} [tone]
 */
export default function AppText({ variant = 'body', tone = 'primary', style, children, ...rest }) {
  const { theme } = useTheme();

  const typo =
    variant === 'sectionLabel' ? SECTION_LABEL : theme.typography[variant] || theme.typography.body;

  const colorKey = TONE_COLOR[tone] || 'textPrimary';
  const color = theme[colorKey];

  return (
    <Text style={[typo, { color }, style]} {...rest}>
      {children}
    </Text>
  );
}
