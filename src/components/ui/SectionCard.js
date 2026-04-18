import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppCard from '../AppCard';

/**
 * Standard kart yüzeyi: tutarlı radius/border + hafif shadow.
 */
export default function SectionCard({ children, style, padding = 'lg', onPress, activeOpacity }) {
  const { theme } = useTheme();

  return (
    <AppCard
      padding={padding}
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.base, theme.shadowStyle, style]}
    >
      {children}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  base: {},
});

