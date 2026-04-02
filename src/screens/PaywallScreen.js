import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PREMIUM_FEATURES } from '../constants/subscription';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';

export default function PaywallScreen({ navigation, route }) {
  const { theme } = useTheme();
  const {
    products,
    purchase,
    restore,
    purchaseLoading,
    restoreLoading,
    isIAPSupported,
  } = useSubscription();
  const qrType = route.params?.qrType;

  const handleSubscribe = async () => {
    if (!isIAPSupported) {
      Alert.alert('Bilgi', 'Abonelik şu an sadece Android\'de kullanılabilir.');
      return;
    }
    const result = await purchase();
    if (result.ok) {
      if (qrType) navigation.replace('Create', { qrType });
      else navigation.goBack();
      return;
    }
    if (result.status === 'cancelled') {
      return;
    }
    if (result.status === 'not_verified') {
      Alert.alert('Abonelik doğrulanamadı', result.userMessage || 'Lütfen bir süre sonra tekrar deneyin.');
      return;
    }
    Alert.alert('Satın alma', result.userMessage || 'İşlem tamamlanamadı. Tekrar deneyin.');
  };

  const handleRestore = async () => {
    const result = await restore();
    if (result.ok) {
      if (qrType) navigation.replace('Create', { qrType });
      else navigation.goBack();
    } else {
      Alert.alert('Geri yükleme', result.userMessage || 'İşlem tamamlanamadı.');
    }
  };

  const monthlyProduct = products.find((p) => p.id?.includes('monthly')) || products[0];
  const priceText = monthlyProduct?.localizedPrice ?? '';

  const actionsDisabled = purchaseLoading || restoreLoading;

  return (
    <ScreenContainer
      scroll
      edges={['bottom', 'left', 'right']}
      contentContainerStyle={{
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.huge,
      }}
    >
      <SectionHeader
        title="Premium"
        subtitle="Wi‑Fi, vCard, konum ve sosyal türler dahil — tek abonelikle sınırsız oluşturma."
        style={{ paddingTop: theme.spacing.sm }}
      />

      <AppCard padding="lg" style={[styles.heroCard, { marginBottom: theme.spacing.lg }]}>
        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor: theme.primarySoft,
              borderRadius: theme.radius.lg,
              marginBottom: theme.spacing.md,
            },
          ]}
        >
          <MaterialIcons name="workspace-premium" size={40} color={theme.primary} />
        </View>
        {priceText ? (
          <View style={styles.priceRow}>
            <AppText variant="title2" tone="primary" style={styles.priceAmount}>
              {priceText}
            </AppText>
            <AppText variant="subbody" tone="secondary" style={styles.priceSuffix}>
              {' '}
              / ay
            </AppText>
          </View>
        ) : (
          <AppText variant="caption" tone="tertiary" style={{ marginBottom: theme.spacing.sm }}>
            Fiyat Google Play’den yükleniyor…
          </AppText>
        )}
        <AppText variant="caption" tone="tertiary" style={styles.trustLine}>
          Ödeme Google Play üzerinden güvenle işlenir. İstediğiniz zaman aboneliği yönetebilirsiniz.
        </AppText>
      </AppCard>

      <AppCard padding="lg" style={{ marginBottom: theme.spacing.lg }}>
        <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
          NELER DAHİL
        </AppText>
        {PREMIUM_FEATURES.map((f, i) => (
          <View
            key={i}
            style={[
              styles.featureRow,
              { marginBottom: i < PREMIUM_FEATURES.length - 1 ? theme.spacing.md : 0 },
            ]}
          >
            <MaterialIcons name="check-circle" size={22} color={theme.success} style={styles.featureIcon} />
            <AppText variant="body" tone="primary" style={styles.featureText}>
              {f}
            </AppText>
          </View>
        ))}
      </AppCard>

      <View style={[styles.actions, { gap: theme.spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.subscribeBtn,
            {
              backgroundColor: theme.primary,
              borderRadius: theme.radius.sm + 2,
              opacity: actionsDisabled ? 0.55 : 1,
              minHeight: 52,
              paddingHorizontal: theme.spacing.lg,
            },
          ]}
          onPress={handleSubscribe}
          disabled={actionsDisabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={priceText ? `${priceText} aylık abonelik satın al` : 'Abone ol'}
          accessibilityState={{ disabled: actionsDisabled }}
        >
          {purchaseLoading ? (
            <ActivityIndicator color={theme.textOnPrimary} size="small" />
          ) : (
            <AppText variant="button" tone="onPrimary" style={styles.subscribeBtnText}>
              {priceText ? `${priceText} / ay — Abone ol` : 'Abone ol'}
            </AppText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.restoreBtn,
            {
              borderColor: theme.border,
              borderRadius: theme.radius.sm + 2,
              backgroundColor: theme.surface,
              opacity: actionsDisabled ? 0.55 : 1,
              minHeight: 48,
              paddingHorizontal: theme.spacing.lg,
            },
          ]}
          onPress={handleRestore}
          disabled={actionsDisabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Satın alımları geri yükle"
          accessibilityState={{ disabled: actionsDisabled }}
        >
          {restoreLoading ? (
            <ActivityIndicator color={theme.textSecondary} size="small" />
          ) : (
            <AppText variant="bodyMedium" tone="secondary" style={styles.restoreBtnText}>
              Satın alımları geri yükle
            </AppText>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        disabled={actionsDisabled}
        hitSlop={12}
      >
        <AppText variant="subbody" tone="tertiary" style={styles.closeText}>
          Şimdilik geç
        </AppText>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  priceAmount: {
    fontWeight: '800',
  },
  priceSuffix: {
    fontWeight: '500',
  },
  trustLine: {
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginTop: 2,
    marginRight: 4,
  },
  featureText: {
    flex: 1,
    lineHeight: 22,
  },
  actions: {},
  subscribeBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnText: {
    textAlign: 'center',
  },
  restoreBtn: {
    paddingVertical: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreBtnText: {
    textAlign: 'center',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  closeText: {
    fontWeight: '600',
  },
});
