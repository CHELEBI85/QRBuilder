import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import { AppButton, BenefitList, OfferCard, PaywallHero } from '../components/ui';

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
  const contextTitle = qrType?.label ? `${qrType.label} türünün kilidini aç` : undefined;
  const contextSubtitle = qrType?.label
    ? `${qrType.label} ve diğer premium türlerle daha fazla senaryoyu saniyeler içinde paylaş.`
    : undefined;

  return (
    <ScreenContainer
      scroll
      edges={['bottom', 'left', 'right']}
      contentContainerStyle={{
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.huge,
      }}
    >
      <PaywallHero
        style={{ marginBottom: theme.spacing.lg }}
        contextTitle={contextTitle}
        contextSubtitle={contextSubtitle}
      />

      <OfferCard
        title="Aylık abonelik"
        priceText={priceText}
        periodText="/ ay"
        loading={!priceText}
        selected
        style={{ marginBottom: theme.spacing.lg }}
      />

      <BenefitList style={{ marginBottom: theme.spacing.lg }} />

      <View style={[styles.actions, { gap: theme.spacing.md }]}>
        <AppButton
          label={priceText ? `${priceText} / ay — Abone ol` : 'Abone ol'}
          onPress={handleSubscribe}
          variant="primary"
          size="lg"
          loading={purchaseLoading}
          disabled={actionsDisabled}
          accessibilityLabel={priceText ? `${priceText} aylık abonelik satın al` : 'Abone ol'}
        />

        <AppText variant="caption" tone="tertiary" style={styles.ctaHint}>
          İstediğin zaman Google Play’den iptal edebilirsin.
        </AppText>

        <AppButton
          label="Satın alımları geri yükle"
          onPress={handleRestore}
          variant="outline"
          loading={restoreLoading}
          disabled={actionsDisabled}
          accessibilityLabel="Satın alımları geri yükle"
        />
      </View>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        disabled={actionsDisabled}
        hitSlop={12}
      >
        <AppText variant="caption" tone="tertiary" style={styles.closeText}>
          Şimdilik geç
        </AppText>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {},
  ctaHint: {
    textAlign: 'center',
    marginTop: -6,
  },
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
    textDecorationLine: 'underline',
  },
});
