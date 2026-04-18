import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import PremiumChip from './PremiumChip';
import SectionCard from './SectionCard';

export default function PaywallHero({ style, contextTitle, contextSubtitle }) {
  const { theme } = useTheme();

  return (
    <SectionCard padding="lg" style={[styles.card, style]}>
      <View style={styles.topRow}>
        <PremiumChip kind="premium" label="Premium" />
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft, borderRadius: theme.radius.lg }]}>
          <MaterialIcons name="workspace-premium" size={22} color={theme.primary} />
        </View>
      </View>

      <AppText variant="title2" tone="primary" style={styles.title}>
        {contextTitle || 'Tüm QR türlerinin kilidini aç'}
      </AppText>
      <AppText variant="subbody" tone="tertiary" style={styles.subtitle}>
        {contextSubtitle ||
          'Wi‑Fi, kişi kartı, konum ve sosyal medya QR’larıyla daha hızlı paylaş. Tek abonelikle sınırsız oluştur.'}
      </AppText>

      <View style={[styles.trustRow, { borderTopColor: theme.divider }]}>
        <View style={styles.trustItem}>
          <MaterialIcons name="verified" size={16} color={theme.success} />
          <AppText variant="caption" tone="tertiary">
            Güvenli ödeme (Google Play)
          </AppText>
        </View>
        <View style={styles.trustItem}>
          <MaterialIcons name="lock" size={16} color={theme.textSecondary} />
          <AppText variant="caption" tone="tertiary">
            Veriler cihazında kalır
          </AppText>
        </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 20,
  },
  trustRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

