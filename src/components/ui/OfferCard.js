import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import SectionCard from './SectionCard';

export default function OfferCard({ title, priceText, periodText, selected = true, loading = false, style }) {
  const { theme } = useTheme();

  return (
    <SectionCard
      padding="lg"
      style={[
        styles.card,
        {
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
          backgroundColor: selected ? theme.primarySoft : theme.card,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <AppText variant="bodyMedium" tone="primary" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            İstediğin zaman iptal edebilirsin
          </AppText>
        </View>

        <View style={styles.right}>
          {loading ? (
            <View style={[styles.skeleton, { backgroundColor: `${theme.textTertiary}22` }]} />
          ) : (
            <View style={styles.priceRow}>
              <AppText variant="title3" tone="primary" style={styles.price}>
                {priceText || '—'}
              </AppText>
              {periodText ? (
                <AppText variant="caption" tone="tertiary" style={styles.period}>
                  {periodText}
                </AppText>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {selected ? (
        <View style={[styles.badge, { backgroundColor: theme.primary, borderRadius: theme.radius.pill }]}>
          <MaterialIcons name="star" size={14} color={theme.textOnPrimary} />
          <AppText variant="caption" tone="onPrimary" style={styles.badgeText}>
            Önerilen
          </AppText>
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flex: 1, minWidth: 0 },
  right: { alignItems: 'flex-end' },
  title: { fontWeight: '800' },
  priceRow: { alignItems: 'flex-end' },
  price: { fontWeight: '900' },
  period: { marginTop: 2 },
  skeleton: { width: 96, height: 18, borderRadius: 8 },
  badge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: { fontWeight: '800' },
});

