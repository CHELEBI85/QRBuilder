import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { PREMIUM_FEATURES } from '../constants/subscription';

export default function PaywallScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { isPremium, products, purchase, restore, purchaseLoading, isIAPSupported } = useSubscription();
  const [restoreLoading, setRestoreLoading] = useState(false);
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
    } else if (result.error && result.error !== 'cancelled') {
      Alert.alert('Hata', result.error);
    }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    const ok = await restore();
    setRestoreLoading(false);
    if (ok) {
      if (qrType) navigation.replace('Create', { qrType });
      else navigation.goBack();
    } else {
      Alert.alert('Bilgi', 'Geri yüklenecek satın alım bulunamadı.');
    }
  };

  const monthlyProduct = products.find((p) => p.id?.includes('monthly')) || products[0];
  const priceText = monthlyProduct?.localizedPrice ?? '';

  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.accent }]}>
            <MaterialIcons name="workspace-premium" size={48} color="#FFF" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Premium</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tüm QR türlerini kullanmak için abone olun
          </Text>
        </View>

        <View style={[styles.features, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.featuresTitle, { color: theme.textSecondary }]}>Özellikler</Text>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <MaterialIcons name="check-circle" size={20} color={theme.success || theme.accent} />
              <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.subscribeBtn, { backgroundColor: theme.accent }]}
            onPress={handleSubscribe}
            disabled={purchaseLoading}
            activeOpacity={0.85}
          >
            {purchaseLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {priceText ? `${priceText} / ay — Abone Ol` : 'Abone Ol'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.restoreBtn, { borderColor: theme.border }]}
            onPress={handleRestore}
            disabled={restoreLoading}
            activeOpacity={0.8}
          >
            {restoreLoading ? (
              <ActivityIndicator color={theme.textSecondary} size="small" />
            ) : (
              <Text style={[styles.restoreBtnText, { color: theme.textSecondary }]}>
                Satın alımları geri yükle
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={[styles.closeText, { color: theme.textMuted }]}>Şimdilik geç</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  features: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  featuresTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { fontSize: 15, flex: 1 },
  actions: { gap: 12 },
  subscribeBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  subscribeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  restoreBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  restoreBtnText: { fontSize: 14, fontWeight: '600' },
  closeBtn: { alignItems: 'center', paddingVertical: 20 },
  closeText: { fontSize: 14, fontWeight: '600' },
});
