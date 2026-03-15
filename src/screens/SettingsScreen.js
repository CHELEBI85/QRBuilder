import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getPreferences, savePreferences } from '../utils/preferences';

const COLOR_PRESETS = ['#000000', '#6C63FF', '#FF6B6B', '#2D6A4F', '#0077B6', '#FFD93D'];
const BG_PRESETS   = ['#FFFFFF', '#1A1A2E', '#F5F5F8', '#FFF8E7', '#E8F4FD', '#0F0F1A'];

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

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Ayarlar</Text>
        </View>

        {/* Premium */}
        <TouchableOpacity
          style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('CreateTab', { screen: 'Paywall' })}
          activeOpacity={0.8}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowEmoji}>👑</Text>
              <View>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Premium</Text>
                <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
                  {isPremium ? 'Aktif abonelik' : 'Tüm QR türleri için abone ol'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textMuted} />
          </View>
        </TouchableOpacity>

        {/* Tema */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>GÖRÜNÜM</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{isDark ? 'Koyu Tema' : 'Açık Tema'}</Text>
                <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
                  {isDark ? 'Karanlık mod aktif' : 'Aydınlık mod aktif'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0EC', true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Varsayılan QR Tercihleri */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>VARSAYILAN QR TERCİHLERİ</Text>
          <Text style={[styles.prefHint, { color: theme.textMuted }]}>
            Yeni QR oluştururken bu ayarlar otomatik uygulanır.
          </Text>

          {/* Varsayılan QR Rengi */}
          <Text style={[styles.prefLabel, { color: theme.textSecondary }]}>QR Rengi</Text>
          <View style={styles.colorRow}>
            {COLOR_PRESETS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderColor: theme.border },
                  prefs.defaultFgColor === c && { borderWidth: 3, borderColor: theme.accent },
                ]}
                onPress={() => updatePref('defaultFgColor', c)}
              />
            ))}
          </View>

          {/* Varsayılan Arka Plan */}
          <Text style={[styles.prefLabel, { color: theme.textSecondary }]}>Arka Plan Rengi</Text>
          <View style={styles.colorRow}>
            {BG_PRESETS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderColor: theme.border },
                  prefs.defaultBgColor === c && { borderWidth: 3, borderColor: theme.accent },
                ]}
                onPress={() => updatePref('defaultBgColor', c)}
              />
            ))}
          </View>

          {/* Varsayılan Boyut */}
          <Text style={[styles.prefLabel, { color: theme.textSecondary }]}>
            Varsayılan QR Boyutu:{' '}
            <Text style={{ color: theme.text, fontWeight: '700' }}>{prefs.defaultQrSize}px</Text>
          </Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={150}
            maximumValue={300}
            step={10}
            value={prefs.defaultQrSize}
            onValueChange={(v) => setPrefs((p) => ({ ...p, defaultQrSize: v }))}
            onSlidingComplete={(v) => updatePref('defaultQrSize', v)}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.accent}
          />

          {/* Önizleme */}
          <View style={[styles.prefPreview, { backgroundColor: prefs.defaultBgColor, borderColor: theme.border }]}>
            <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor }]} />
            <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor, opacity: 0.5 }]} />
            <View style={[styles.prefPreviewDot, { backgroundColor: prefs.defaultFgColor }]} />
            <Text style={[styles.prefPreviewText, { color: prefs.defaultFgColor }]}>
              Renk önizlemesi
            </Text>
          </View>
        </View>

        {/* Hakkında */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>HAKKINDA</Text>
          <View style={styles.aboutCard}>
            <View style={[styles.appIconWrapper, { backgroundColor: theme.accent }]}>
              <MaterialIcons name="qr-code-2" size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>QRBuilder</Text>
            <Text style={[styles.appVersion, { color: theme.textMuted }]}>Sürüm 1.0.0</Text>
            <Text style={[styles.appDesc, { color: theme.textSecondary }]}>
              Kapsamlı QR kod oluşturucu ve tarayıcı.
            </Text>
          </View>

        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowEmoji: { fontSize: 28 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowDesc: { fontSize: 12, marginTop: 2 },
  prefHint: { fontSize: 12, marginBottom: 16, marginTop: -6 },
  prefLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colorDot: { width: 36, height: 36, borderRadius: 10, borderWidth: 1 },
  prefPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 4,
  },
  prefPreviewDot: { width: 12, height: 12, borderRadius: 3 },
  prefPreviewText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  aboutCard: { alignItems: 'center', paddingVertical: 16 },
  appIconWrapper: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  appVersion: { fontSize: 13, marginBottom: 12 },
  appDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
