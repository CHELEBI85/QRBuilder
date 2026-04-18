import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';

export default function SettingRow({
  icon,
  iconColor,
  iconBackgroundColor,
  title,
  subtitle,
  right,
  chevron = true,
  onPress,
  disabled = false,
  style,
}) {
  const { theme } = useTheme();
  const isPressable = typeof onPress === 'function' && !disabled;

  const content = (
    <>
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: iconBackgroundColor || theme.surfaceSecondary,
              borderRadius: theme.radius.sm + 2,
              borderColor: theme.border,
            },
          ]}
        >
          <MaterialIcons name={icon} size={18} color={iconColor || theme.primary} />
        </View>
      ) : null}

      <View style={styles.textWrap}>
        <AppText variant="bodyMedium" tone="primary" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="tertiary" numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
      {chevron ? (
        <MaterialIcons name="chevron-right" size={22} color={theme.textTertiary} />
      ) : null}
    </>
  );

  if (!isPressable) {
    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: theme.radius.md,
            opacity: disabled ? 0.6 : 1,
          },
          theme.shadowStyle,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.9 : 1,
        },
        theme.shadowStyle,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  right: {
    marginLeft: 8,
  },
});

