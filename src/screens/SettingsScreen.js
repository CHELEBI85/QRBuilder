import React, { useState, useEffect } from 'react';
import { View, Switch, StyleSheet, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getPreferences, savePreferences } from '../utils/preferences';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import { ColorSwatch, PreviewCard, ScreenHeader, SectionCard, SettingRow, UpgradeCard } from '../components/ui';

const COLOR_PRESETS = ['#000000', '#6C63FF', '#FF6B6B', '#2D6A4F', '#0077B6', '#FFD93D'];
const BG_PRESETS = ['#FFFFFF', '#1A1A2E', '#F5F5F8', '#FFF8E7', '#E8F4FD', '#0F0F1A'];

const APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';
const LOGO_DARK = require('../../assets/siyahlogo.png');
const LOGO_LIGHT = require('../../assets/beyazlogo.png');

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
      <ScreenHeader title="Ayarlar" subtitle="Görünüm, varsayılanlar ve hesap" />

      {isPremium ? (
        <SettingRow
          icon="workspace-premium"
          title="Premium"
          subtitle="Tüm QR türlerine erişiminiz var"
          onPress={goToPaywall}
          style={sectionGap}
          right={
            <View style={[styles.premiumBadge, { backgroundColor: `${theme.success}22` }]}>
              <MaterialIcons name="check-circle" size={14} color={theme.success} />
              <AppText variant="caption" style={{ color: theme.success, fontWeight: '700' }}>
                Aktif
              </AppText>
            </View>
          }
        />
      ) : (
        <View style={sectionGap}>
          <UpgradeCard onPressUpgrade={goToPaywall} />
        </View>
      )}

      <SectionCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          GÖRÜNÜM
        </AppText>
        <SettingRow
          icon={isDark ? 'dark-mode' : 'light-mode'}
          title={isDark ? 'Koyu tema' : 'Açık tema'}
          subtitle="Sistem görünümüne uyum için anında değişir"
          chevron={false}
          style={styles.settingRowInner}
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.textOnPrimary}
              accessibilityLabel={isDark ? 'Koyu temayı kapat' : 'Koyu temayı aç'}
            />
          }
        />
      </SectionCard>

      <SectionCard padding="lg" style={sectionGap}>
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
            <ColorSwatch
              key={c}
              color={c}
              selected={prefs.defaultFgColor === c}
              onPress={() => updatePref('defaultFgColor', c)}
              accessibilityLabel={`Ön plan rengi ${c}`}
            />
          ))}
        </View>

        <AppText variant="subbody" tone="secondary" style={styles.prefLabel}>
          Arka plan rengi
        </AppText>
        <View style={[styles.colorRow, { gap: theme.spacing.sm, marginBottom: theme.spacing.lg }]}>
          {BG_PRESETS.map((c) => (
            <ColorSwatch
              key={c}
              color={c}
              selected={prefs.defaultBgColor === c}
              onPress={() => updatePref('defaultBgColor', c)}
              accessibilityLabel={`Arka plan rengi ${c}`}
            />
          ))}
        </View>

        <View style={styles.sizeLabelRow}>
          <AppText variant="subbody" tone="secondary" style={styles.prefLabel}>
            Varsayılan boyut
          </AppText>
          <View style={[styles.sizePill, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderRadius: theme.radius.pill }]}>
            <AppText variant="caption" tone="secondary" style={styles.sizePillText}>
              {prefs.defaultQrSize}px
            </AppText>
          </View>
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

        <View style={{ marginTop: theme.spacing.sm }}>
          <PreviewCard fgColor={prefs.defaultFgColor} bgColor={prefs.defaultBgColor} sizePx={prefs.defaultQrSize} />
        </View>
      </SectionCard>

      <SectionCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          UYGULAMA
        </AppText>

        <View style={[styles.aboutHero, { gap: theme.spacing.sm }]}>
          <Image
            source={isDark ? LOGO_DARK : LOGO_LIGHT}
            style={[
              styles.aboutLogoSmall,
              {
                borderRadius: theme.radius.lg,
              },
            ]}
            resizeMode="contain"
          />
          <View style={styles.aboutText}>
            <View style={styles.aboutTitleRow}>
              <AppText variant="headline" tone="primary" style={styles.appNameCompact}>
                QRBuilder
              </AppText>
              <AppText variant="caption" tone="tertiary">
                v{APP_VERSION}
              </AppText>
            </View>
            <AppText variant="caption" tone="tertiary" style={styles.appDescCompact}>
              QR oluşturma, özelleştirme ve tarama — tek uygulamada.
            </AppText>
          </View>
        </View>
      </SectionCard>

      <SectionCard padding="lg" style={sectionGap}>
        <AppText variant="sectionLabel" tone="secondary" style={styles.sectionLabelSpacing}>
          DESTEK & GİZLİLİK
        </AppText>
        <SettingRow
          icon="mail-outline"
          title="Geri bildirim"
          subtitle="Öneri veya sorun bildirin"
          onPress={openFeedbackMail}
          style={styles.settingRowInner}
        />
        <View style={[styles.divider, { backgroundColor: theme.divider, marginVertical: theme.spacing.md }]} />
        <SettingRow
          icon="policy"
          title="Gizlilik özeti"
          subtitle="Verileriniz nasıl işlenir?"
          onPress={showPrivacySummary}
          style={styles.settingRowInner}
        />
      </SectionCard>
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
  settingRowInner: {
    marginTop: 6,
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
  sizePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sizePillText: {
    fontWeight: '800',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  aboutHero: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutLogoSmall: {
    width: 64,
    height: 64,
  },
  aboutText: {
    flex: 1,
    minWidth: 0,
  },
  aboutTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  appNameCompact: {
    fontWeight: '900',
  },
  appDescCompact: {
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
