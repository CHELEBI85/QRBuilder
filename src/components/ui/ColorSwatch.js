import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function ColorSwatch({ color, selected = false, onPress, size = 34, style, accessibilityLabel }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `Renk ${color}`}
      accessibilityState={{ selected }}
      hitSlop={10}
      style={({ pressed }) => [
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: theme.radius.sm,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2.5 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            borderRadius: theme.radius.sm - 2,
          },
        ]}
      />
      {selected ? (
        <View style={[styles.check, { borderRadius: theme.radius.pill, backgroundColor: theme.primary }]}>
          <MaterialIcons name="check" size={14} color={theme.textOnPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  check: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

