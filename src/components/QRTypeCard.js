import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import QRIcon from './QRIcon';
import AppText from './AppText';
import PremiumChip from './ui/PremiumChip';

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
          paddingVertical: theme.spacing.md,
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
        <QRIcon icon={item.icon} size={26} />
        {isPremium ? <PremiumChip kind="locked" style={styles.premiumChip} /> : null}
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
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  premiumChip: {
    position: 'absolute',
    bottom: -8,
    right: -10,
    paddingHorizontal: 8,
    paddingVertical: 5,
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
