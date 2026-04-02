import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';

/**
 * Etiketli metin girişi — CreateScreen ve diğer formlar için ortak davranış.
 * Validator/formatter bu bileşende yok; yalnızca sunum ve etkileşim durumları.
 */
export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  /** Sınır/etiket hatası; mesaj yokken kullanılır (ör. dışarıdan sadece bayrak) */
  hasError = false,
  /** Gösterilecek hata metni; verildiğinde alanın altında caption error ile gösterilir */
  error,
  helperText,
  required = false,
  disabled = false,
  style,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...textInputRest
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const errorMessage = typeof error === 'string' && error.trim().length > 0 ? error.trim() : null;
  const showError = Boolean(errorMessage) || hasError;

  const borderColor = showError ? theme.error : focused && !disabled ? theme.primary : theme.border;

  const labelTone = showError ? 'error' : 'secondary';

  const inputTypography = theme.typography.body;
  const multilineMinHeight = theme.spacing.huge * 2 + theme.spacing.md;

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <View style={[styles.labelRow, { marginBottom: theme.spacing.xs }]}>
          <AppText variant="subbody" tone={labelTone} style={styles.labelFlex}>
            {label}
          </AppText>
          {required ? (
            <AppText variant="subbody" tone="error" accessibilityLabel="zorunlu">
              {' *'}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <TextInput
        style={[
          styles.inputBase,
          inputTypography,
          {
            backgroundColor: theme.inputBackground,
            borderColor,
            color: theme.textPrimary,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: multiline ? theme.spacing.md : theme.spacing.sm + 2,
            opacity: disabled ? 0.65 : 1,
            minHeight: multiline ? multilineMinHeight : undefined,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setFocused(true);
          onFocusProp?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlurProp?.(e);
        }}
        accessibilityLabel={label || placeholder || 'Metin alanı'}
        accessibilityState={{ disabled, invalid: showError }}
        {...textInputRest}
      />

      {errorMessage ? (
        <AppText
          variant="caption"
          tone="error"
          accessibilityLiveRegion="polite"
          style={{ marginTop: theme.spacing.xs, marginLeft: theme.spacing.xs }}
        >
          {errorMessage}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          tone="tertiary"
          style={{ marginTop: theme.spacing.xs, marginLeft: theme.spacing.xs }}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  labelFlex: {
    flexShrink: 1,
  },
  inputBase: {
    borderWidth: 1.5,
  },
});
