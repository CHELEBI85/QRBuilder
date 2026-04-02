import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getPreferences, savePreferences } from '../utils/preferences';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';
import SectionHeader from '../components/SectionHeader';

const COLOR_PRESETS = ['#000000', '#6C63FF', '#FF6B6B', '#2D6A4F', '#0077B6', '#FFD93D'];
const BG_PRESETS = ['#FFFFFF', '#1A1A2E', '#F5F5F8', '#FFF8E7', '#E8F4FD', '#0F0F1A'];

const APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { isPremium } = useSubscription();
  const [prefs, setPrefs] = useState({ defaultFgColor: '#000000', defaultBgColor: '#FFFFFF', defaultQrSize: 220 });

  useEffect(() => {
    getPreferences().then(setPrefs);
  }, []);

  const updatePref = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await savePreferences({ [key]: value });
    Haptics.selectionAsync();
  };

  const goToPaywall = () => {
    navigation.navigate('CreateTab', { screen: 'Paywall' });
  };

  const openFeedbackMail = () => {
    const email = "mobiflextech@gmail.com";
    const subject = encodeURIComponent("QRBuilder Geri Bildirim");
    const body = encodeURIComponent("Görüşlerinizi buraya yazabilirsiniz...");
  
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
  
    Linking.openURL(url).catch(() =>
      Alert.alert(
        "E-posta açılamadı",
        "Cihazınızda bir e-posta uygulaması yapılandırın."
      )
    );
  };

  const showPrivacySummary = () => {
    Alert.alert(
      'Gizlilik özeti',
      'Tema ve QR varsayılanları yalnızca bu cihazda saklanır. Oluşturduğunuz QR içeriği yalnızca siz paylaştığınızda başkalarına iletilir; uygulama bu verileri sunucuya göndermez.',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const sectionGap = { marginBottom: theme.spacing.lg };

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: theme.spacing.huge }}>
      <SectionHeader
        title="Ayarlar"
        subtitle="Tema, varsayılanlar ve uygulama bilgisi"
        style={{ paddingHorizontal: 0, paddingTop: theme.spacing.sm, marginBottom: theme.spacing.sm }}
      />

      <AppCard onPress={goToPaywall} activeOpacity={0.85} padding="lg" style={sectionGap}>
        <View style={styles.row}>
          <View style={[styles.rowLeft, { gap: theme.spacing.md }]}>
            <View style={[styles.rowIconWrap, { backgroundColor: theme.primarySoft, borderRadius: theme.radius.sm }]}>
              <MaterialIcons name="workspace-premium" size={22} color={theme.primary} />
            </View>
            <View style={styles.rowTextBlock}>
              <View style={styles.premiumTitleRow}>
                <AppText variant="bodyMedium" tone="primary">
                  Premium
                </AppText>
                {isPremium ? (
                  <View style={[styles.premiumBadge, { backgroundColor: `${theme.success}22` }]}>
                    <MaterialIcons name="check-circle" size={14} color={theme.success} />
                    <AppText variant="caption" style={{ color: theme.success, fontWeight: '600' }}>
                      Aktif
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="caption" tone="secondary" style={styles.rowDesc}>
                {isPremium ? 'Tüm QR türlerine erişiminiz var' : 'Tüm QR türlerinin kilidini açın'}
              </AppText>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.textTertiary} accessible={false} />
        </View>
      </AppCard>

      <AppCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          GÖRÜNÜM
        </AppText>
        <View style={styles.row}>
          <View style={[styles.rowLeft, { gap: theme.spacing.md }]}>
            <View style={[styles.rowIconWrap, { backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm }]}>
              <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={22} color={theme.primary} />
            </View>
            <View style={styles.rowTextBlock}>
              <AppText variant="bodyMedium" tone="primary">
                {isDark ? 'Koyu tema' : 'Açık tema'}
              </AppText>
              <AppText variant="caption" tone="secondary" style={styles.rowDesc}>
                Sistem görünümüne uyum için anında değişir
              </AppText>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={theme.textOnPrimary}
            accessibilityLabel={isDark ? 'Koyu temayı kapat' : 'Koyu temayı aç'}
          />
        </View>
      </AppCard>

      <AppCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          VARSAYILAN QR
        </AppText>
        <AppText variant="caption" tone="tertiary" style={styles.prefHint}>
          Yeni QR oluştururken önizleme ve dışa aktarma bu renk ve boyutla başlar.
        </AppText>

        <AppText variant="subbody" tone="secondary" style={styles.prefLabel}>
          Ön plan rengi
        </AppText>
        <View style={[styles.colorRow, { gap: theme.spacing.sm, marginBottom: theme.spacing.lg }]}>
          {COLOR_PRESETS.map((c) => (
            <TouchableOpacity
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Ön plan rengi ${c}`}
              accessibilityState={{ selected: prefs.defaultFgColor === c }}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderColor: theme.border,
                  borderRadius: theme.radius.sm,
                  width: 36,
                  height: 36,
                },
                prefs.defaultFgColor === c && { borderWidth: 3, borderColor: theme.primary },
              ]}
              onPress={() => updatePref('defaultFgColor', c)}
            />
          ))}
        </View>

        <AppText variant="subbody" tone="secondary" style={styles.prefLabel}>
          Arka plan rengi
        </AppText>
        <View style={[styles.colorRow, { gap: theme.spacing.sm, marginBottom: theme.spacing.lg }]}>
          {BG_PRESETS.map((c) => (
            <TouchableOpacity
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Arka plan rengi ${c}`}
              accessibilityState={{ selected: prefs.defaultBgColor === c }}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderColor: theme.border,
                  borderRadius: theme.radius.sm,
                  width: 36,
                  height: 36,
                },
                prefs.defaultBgColor === c && { borderWidth: 3, borderColor: theme.primary },
              ]}
              onPress={() => updatePref('defaultBgColor', c)}
            />
          ))}
        </View>

        <View style={styles.sizeLabelRow}>
          <AppText variant="subbody" tone="secondary" style={styles.prefLabel}>
            Varsayılan boyut
          </AppText>
          <AppText variant="subbody" tone="primary" style={styles.sizeValue}>
            {prefs.defaultQrSize}px
          </AppText>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={150}
          maximumValue={300}
          step={10}
          value={prefs.defaultQrSize}
          onValueChange={(v) => setPrefs((p) => ({ ...p, defaultQrSize: v }))}
          onSlidingComplete={(v) => updatePref('defaultQrSize', v)}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
          accessibilityLabel="Varsayılan QR boyutu"
        />

        <View
          style={[
            styles.prefPreview,
            {
              backgroundColor: prefs.defaultBgColor,
              borderColor: theme.border,
              borderRadius: theme.radius.sm,
              padding: theme.spacing.sm + 2,
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor }]} />
          <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor, opacity: 0.5 }]} />
          <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor }]} />
          <AppText variant="caption" style={[styles.prefPreviewText, { color: prefs.defaultFgColor }]}>
            Önizleme
          </AppText>
        </View>
      </AppCard>

      <AppCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          UYGULAMA
        </AppText>

        <View style={styles.aboutHero}>
          <View
            style={[
              styles.appIconWrapper,
              {
                backgroundColor: theme.primary,
                borderRadius: theme.radius.lg,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            <MaterialIcons name="qr-code-2" size={40} color={theme.textOnPrimary} />
          </View>
          <AppText variant="title2" tone="primary" style={styles.appName}>
            QRBuilder
          </AppText>
          <AppText variant="caption" tone="tertiary" style={styles.appVersion}>
            Sürüm {APP_VERSION}
          </AppText>
          <AppText variant="subbody" tone="secondary" style={styles.appDesc}>
            QR oluşturma, özelleştirme ve tarama — tek uygulamada.
          </AppText>
          <AppText variant="caption" tone="tertiary" style={styles.trustLine}>
            Tercihleriniz yalnızca bu cihazda saklanır.
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider, marginVertical: theme.spacing.md }]} />

        <TouchableOpacity
          style={[styles.linkRow, { paddingVertical: theme.spacing.sm, marginHorizontal: -theme.spacing.xs }]}
          onPress={openFeedbackMail}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Geri bildirim e-postası gönder"
        >
          <View style={[styles.rowIconWrap, { backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm }]}>
            <MaterialIcons name="mail-outline" size={22} color={theme.primary} />
          </View>
          <View style={styles.linkRowText}>
            <AppText variant="bodyMedium" tone="primary">
              Geri bildirim
            </AppText>
            <AppText variant="caption" tone="tertiary">
              Öneri veya sorun bildirin
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={theme.textTertiary} accessible={false} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.linkRow,
            {
              marginTop: theme.spacing.xs,
              paddingVertical: theme.spacing.sm,
              marginHorizontal: -theme.spacing.xs,
            },
          ]}
          onPress={showPrivacySummary}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Gizlilik özeti"
        >
          <View style={[styles.rowIconWrap, { backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm }]}>
            <MaterialIcons name="policy" size={22} color={theme.primary} />
          </View>
          <View style={styles.linkRowText}>
            <AppText variant="bodyMedium" tone="primary">
              Gizlilik özeti
            </AppText>
            <AppText variant="caption" tone="tertiary">
              Verileriniz nasıl işlenir?
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={theme.textTertiary} accessible={false} />
        </TouchableOpacity>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  premiumTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rowDesc: {
    marginTop: 2,
  },
  sectionLabelSpacing: {
    marginBottom: 14,
  },
  prefHint: {
    marginBottom: 16,
    marginTop: -4,
  },
  prefLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  sizeLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sizeValue: {
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorDot: {},
  slider: {
    width: '100%',
    height: 40,
  },
  prefPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  prefPreviewDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  prefPreviewText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  aboutHero: {
    alignItems: 'center',
  },
  appIconWrapper: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontWeight: '800',
    marginBottom: 4,
  },
  appVersion: {
    marginBottom: 8,
  },
  appDesc: {
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  trustLine: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
  },
  linkRowText: {
    flex: 1,
    minWidth: 0,
  },
});
