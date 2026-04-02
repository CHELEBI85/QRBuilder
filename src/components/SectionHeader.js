import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';

/**
 * Ekran üst başlığı + isteğe bağlı alt satır ve sağ aksiyon.
 */
export default function SectionHeader({ title, subtitle, right, style }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.md,
        },
        style,
      ]}
    >
      <View style={styles.left}>
        <AppText variant="title1" tone="primary" style={styles.title}>
          {title}
        </AppText>
        {subtitle != null && subtitle !== '' && (
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right != null ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
  },
  left: { flex: 1 },
  right: { marginLeft: 8 },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
  },
});
