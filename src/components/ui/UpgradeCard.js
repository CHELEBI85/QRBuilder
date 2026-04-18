import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import AppButton from './AppButton';
import SectionCard from './SectionCard';
import PremiumChip from './PremiumChip';

export default function UpgradeCard({ onPressUpgrade }) {
  const { theme } = useTheme();

  return (
    <SectionCard padding="lg" style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.topRow}>
        <PremiumChip kind="premium" label="Premium" />
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft, borderRadius: theme.radius.lg }]}>
          <MaterialIcons name="workspace-premium" size={22} color={theme.primary} />
        </View>
      </View>

      <AppText variant="headline" tone="primary" style={styles.title}>
        Daha fazla türün kilidini aç
      </AppText>
      <AppText variant="subbody" tone="tertiary" style={styles.desc}>
        Wi‑Fi, kişi (vCard), konum ve sosyal medya türleri dahil. Tek abonelikle sınırsız oluştur.
      </AppText>

      <View style={{ marginTop: theme.spacing.md }}>
        <AppButton label="Premium'u Gör" onPress={onPressUpgrade} variant="primary" />
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
    marginTop: 10,
    fontWeight: '900',
  },
  desc: {
    marginTop: 6,
    lineHeight: 20,
  },
});

