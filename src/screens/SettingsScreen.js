import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Ayarlar</Text>
      </View>

      <View style={styles.content}>
        {/* Theme Toggle */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>GÖRÜNÜM</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.rowTitle, { color: theme.text }]}>
                  {isDark ? 'Koyu Tema' : 'Açık Tema'}
                </Text>
                <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
                  {isDark ? 'Karanlık mod aktif' : 'Aydınlık mod aktif'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0EC', true: '#6C63FF' }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>HAKKINDA</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.appLogo}>⬛</Text>
            <Text style={[styles.appName, { color: theme.text }]}>QRBuilder</Text>
            <Text style={[styles.appVersion, { color: theme.textMuted }]}>Sürüm 1.0.0</Text>
            <Text style={[styles.appDesc, { color: theme.textSecondary }]}>
              Kapsamlı QR kod oluşturucu. URL, WiFi, vCard, sosyal medya ve daha fazlası için QR
              kodları oluşturun.
            </Text>
          </View>



        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  content: { padding: 16, gap: 16 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowEmoji: { fontSize: 28 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowDesc: { fontSize: 12, marginTop: 2 },
  aboutCard: { alignItems: 'center', paddingVertical: 16 },
  appLogo: { fontSize: 48, marginBottom: 8 },
  appName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  appVersion: { fontSize: 13, marginBottom: 12 },
  appDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  divider: { height: 1, marginVertical: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});
