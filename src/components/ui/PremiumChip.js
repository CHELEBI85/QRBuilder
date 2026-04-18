import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';

/**
 * Premium/lock gibi durumlar için zarif chip.
 */
export default function PremiumChip({ kind = 'premium', label, style }) {
  const { theme } = useTheme();

  const isLocked = kind === 'locked';

  const bg = isLocked ? theme.surfaceSecondary : theme.primarySoft;
  const border = theme.border;
  const iconColor = isLocked ? theme.textSecondary : theme.primary;
  const textTone = isLocked ? 'secondary' : 'secondary';

  const iconName = isLocked ? 'lock' : 'workspace-premium';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <MaterialIcons name={iconName} size={13} color={iconColor} />
      {label ? (
        <AppText variant="caption" tone={textTone} style={styles.text} numberOfLines={1}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontWeight: '700',
  },
});

