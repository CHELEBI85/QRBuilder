import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import AppButton from './AppButton';
import PremiumChip from './PremiumChip';
import SectionCard from './SectionCard';

/**
 * Ekran içi küçük upsell (bağırmadan).
 */
export default function InlineUpsellCard({ title, description, ctaLabel = "Premium'u Gör", onPress }) {
  const { theme } = useTheme();

  return (
    <SectionCard padding="lg" style={styles.card}>
      <View style={styles.topRow}>
        <PremiumChip kind="premium" label="Premium" />
        <MaterialIcons name="lock" size={18} color={theme.textSecondary} />
      </View>
      <AppText variant="bodyMedium" tone="primary" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" tone="tertiary" style={styles.desc}>
          {description}
        </AppText>
      ) : null}
      <View style={{ marginTop: theme.spacing.md }}>
        <AppButton label={ctaLabel} onPress={onPress} variant="outline" />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: 10,
    fontWeight: '800',
  },
  desc: {
    marginTop: 4,
    lineHeight: 18,
  },
});

