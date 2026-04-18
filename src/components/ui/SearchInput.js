import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import SectionCard from './SectionCard';

export default function SearchInput({
  value,
  onChangeText,
  placeholder = 'Ara…',
  onClear,
  style,
  inputStyle,
  autoFocus = false,
}) {
  const { theme } = useTheme();
  const canClear = value != null && String(value).length > 0;

  return (
    <SectionCard padding="md" style={[styles.shell, style]}>
      <MaterialIcons name="search" size={18} color={theme.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        style={[
          styles.input,
          theme.typography.body,
          { color: theme.textPrimary },
          inputStyle,
        ]}
        accessibilityLabel={placeholder}
      />
      {canClear ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Temizle"
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
        >
          <MaterialIcons name="close" size={18} color={theme.textSecondary} />
        </Pressable>
      ) : (
        <View style={styles.clearSpacer} />
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  clearSpacer: {
    width: 18,
    height: 18,
  },
});

