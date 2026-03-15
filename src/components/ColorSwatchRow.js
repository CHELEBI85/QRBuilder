import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PRESETS = ['#000000', '#FFFFFF', '#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D'];

export default function ColorSwatchRow({ label, selected, onSelect, onCustom }) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        {PRESETS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.swatch,
              { backgroundColor: color, borderColor: theme.border },
              selected === color && { borderWidth: 3, borderColor: theme.accent },
            ]}
            onPress={() => onSelect(color)}
            activeOpacity={0.8}
          />
        ))}
        <TouchableOpacity
          style={[styles.customBtn, { borderColor: theme.accent }]}
          onPress={onCustom}
          activeOpacity={0.8}
        >
          <Text style={{ color: theme.accent, fontSize: 18 }}>+</Text>
        </TouchableOpacity>
        <View
          style={[styles.currentSwatch, { backgroundColor: selected, borderColor: theme.border }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
  },
  customBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 4,
  },
});
