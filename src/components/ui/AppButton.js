import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';

const VARIANT_STYLES = {
  primary: (theme) => ({
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  }),
  secondary: (theme) => ({
    backgroundColor: theme.surfaceSecondary,
    borderColor: theme.border,
  }),
  outline: (theme) => ({
    // Dark modda "outline" çok koyu kalmasın diye bir tık daha aydınlık yüzey.
    backgroundColor: theme.surfaceSecondary,
    borderColor: theme.primary,
  }),
  ghost: (theme) => ({
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  }),
};

const VARIANT_TEXT_TONE = {
  primary: 'onPrimary',
  secondary: 'primary',
  outline: 'primary',
  ghost: 'primary',
};

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  contentStyle,
  textStyle,
  accessibilityLabel,
}) {
  const { theme } = useTheme();

  const tone = VARIANT_TEXT_TONE[variant] || 'primary';
  const containerVariant = (VARIANT_STYLES[variant] || VARIANT_STYLES.primary)(theme);
  const labelColor =
    tone === 'onPrimary' ? theme.textOnPrimary : variant === 'outline' || variant === 'ghost' ? theme.primary : undefined;

  const height = size === 'lg' ? 56 : size === 'sm' ? 44 : 52;
  const padX = size === 'lg' ? theme.spacing.xl : theme.spacing.lg;

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.md,
          borderWidth: variant === 'ghost' ? 0 : 1.5,
          minHeight: height,
          paddingHorizontal: padX,
          opacity: isDisabled ? 0.6 : pressed ? 0.92 : 1,
        },
        containerVariant,
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={tone === 'onPrimary' ? theme.textOnPrimary : theme.primary}
          />
        ) : (
          <>
            {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
            <AppText
              variant="button"
              tone={tone}
              style={[styles.label, { color: labelColor }, textStyle]}
              numberOfLines={1}
            >
              {label}
            </AppText>
            {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontWeight: '700',

  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
});

