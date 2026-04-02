import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';

/**
 * Liste / ekran içi yükleme göstergesi.
 */
export default function LoadingState({ message = 'Yükleniyor…', style }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      <ActivityIndicator size="large" color={theme.primary} />
      {message ? (
        <AppText variant="subbody" tone="secondary" style={{ marginTop: theme.spacing.md }}>
          {message}
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
    minHeight: 120,
  },
});
