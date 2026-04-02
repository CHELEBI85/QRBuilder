import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * Bordered yüzey — kart, arama çubuğu kabuğu vb.
 * @param {'sm'|'md'|'lg'} [padding='lg'] — theme.spacing
 */
export default function AppCard({ children, style, onPress, activeOpacity = 0.8, padding = 'lg' }) {
  const { theme } = useTheme();
  const pad = theme.spacing[padding] ?? theme.spacing.lg;

  const surface = [
    styles.base,
    {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: theme.radius.md,
      padding: pad,
    },
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={[surface, style]} onPress={onPress} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
