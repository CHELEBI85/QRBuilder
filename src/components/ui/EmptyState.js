import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import AppButton from './AppButton';

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, style]}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.surfaceSecondary,
            borderColor: theme.border,
            borderRadius: theme.radius.lg,
          },
        ]}
      >
        <MaterialIcons name={icon} size={26} color={theme.textSecondary} />
      </View>

      {title ? (
        <AppText variant="headline" tone="primary" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      {description ? (
        <AppText variant="subbody" tone="tertiary" style={styles.desc}>
          {description}
        </AppText>
      ) : null}

      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.spacing.lg, width: '100%' }}>
          <AppButton label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    marginTop: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  desc: {
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 320,
  },
});

