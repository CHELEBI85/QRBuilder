import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';

/**
 * Ortalanmış boş / sonuç yok durumu.
 */
export default function EmptyState({ emoji = '📋', title, hint, style }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.huge,
        },
        style,
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <AppText variant="title3" tone="secondary" style={styles.title}>
        {title}
      </AppText>
      {hint ? (
        <AppText variant="subbody" tone="tertiary" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
