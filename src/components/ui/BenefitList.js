import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import SectionCard from './SectionCard';

const BENEFITS = [
  { icon: 'wifi', title: 'Wi‑Fi QR', desc: 'Ağ adı ve şifreyi tek taramada paylaş.' },
  { icon: 'contact-page', title: 'Kişi kartı', desc: 'vCard ile profesyonel iletişim.' },
  { icon: 'alternate-email', title: 'İletişim', desc: 'Email, telefon, SMS türleri.' },
  { icon: 'share', title: 'Sosyal medya', desc: 'WhatsApp, Instagram, X, YouTube.' },
  { icon: 'location-on', title: 'Konum', desc: 'GPS koordinatlarını hızlıca gönder.' },
  { icon: 'all-inclusive', title: 'Sınırsız', desc: 'Tek abonelikle sınırsız oluştur.' },
  { icon: 'block', title: 'Reklamsız', desc: 'Premium’da reklam gösterilmez.' },
];

export default function BenefitList({ style }) {
  const { theme } = useTheme();

  return (
    <SectionCard padding="lg" style={style}>
      <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
        NELER DAHİL
      </AppText>
      <View style={[styles.grid, { gap: theme.spacing.sm }]}>
        {BENEFITS.map((b) => (
          <View
            key={b.title}
            style={[
              styles.item,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft, borderRadius: theme.radius.sm + 2 }]}>
              <MaterialIcons name={b.icon} size={18} color={theme.primary} />
            </View>
            <View style={styles.text}>
              <AppText variant="bodyMedium" tone="primary" style={styles.itemTitle} numberOfLines={1}>
                {b.title}
              </AppText>
              <AppText variant="caption" tone="tertiary" numberOfLines={2} style={styles.itemDesc}>
                {b.desc}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '48%',
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: { fontWeight: '800' },
  itemDesc: { marginTop: 2 },
});

