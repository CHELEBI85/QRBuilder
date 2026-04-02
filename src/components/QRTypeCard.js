import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import QRIcon from './QRIcon';
import AppText from './AppText';

export default function QRTypeCard({ item, onPress, disabled = false }) {
  const { theme } = useTheme();
  const isPremium = item.premium === true;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isPremium ? theme.primarySoft : theme.border,
          borderRadius: theme.radius.md,
          margin: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.sm,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${item.label}. ${item.description}${isPremium ? '. Premium gerekir.' : ''}`}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: isPremium ? theme.primarySoft : theme.surface,
            borderRadius: theme.radius.sm + 2,
            marginBottom: theme.spacing.sm + 2,
          },
        ]}
      >
        <QRIcon icon={item.icon} size={28} />
        {isPremium && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.primary,
                borderRadius: theme.radius.pill,
                borderWidth: 2,
                borderColor: theme.card,
              },
            ]}
          >
            <MaterialIcons name="workspace-premium" size={11} color={theme.textOnPrimary} />
          </View>
        )}
      </View>
      <AppText variant="subbody" tone="primary" style={styles.label} numberOfLines={1}>
        {item.label}
      </AppText>
      <AppText variant="caption" tone="tertiary" style={styles.desc} numberOfLines={1}>
        {item.description}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  desc: {
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
});
