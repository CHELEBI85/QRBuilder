import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { getHistory, deleteQRFromHistory, clearHistory } from '../utils/storage';
import { QR_TYPES } from '../constants/qrTypes';
import QRIcon from '../components/QRIcon';
import QRCode from 'react-native-qrcode-svg';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState(null); // filtre: typeId veya null
  const [previewItem, setPreviewItem] = useState(null); // büyük QR modal

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  const filtered = useMemo(() => {
    return history.filter((item) => {
      const matchType = activeType ? item.typeId === activeType : true;
      const matchSearch = search.trim()
        ? item.qrValue?.toLowerCase().includes(search.toLowerCase()) ||
          item.typeLabel?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchType && matchSearch;
    });
  }, [history, search, activeType]);

  // Tarihte kaç türden kayıt var — filtre chip'leri için
  const usedTypes = useMemo(() => {
    const ids = [...new Set(history.map((h) => h.typeId))];
    return QR_TYPES.filter((t) => ids.includes(t.id));
  }, [history]);

  const handleDelete = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sil', 'Bu QR kodu geçmişten silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteQRFromHistory(id);
          setHistory(updated);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Tümünü Sil', 'Tüm geçmişi silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Tümünü Sil',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
          setActiveType(null);
          setSearch('');
        },
      },
    ]);
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  // WiFi QR değerindeki şifreyi maskele: WIFI:T:WPA;S:SSID;P:password;; → P:••••••••
  const maskWifiPassword = (typeId, qrValue) => {
    if (typeId !== 'wifi' || !qrValue) return qrValue;
    return qrValue.replace(/(;P:)([^;]+)(;)/, '$1••••••••$3');
  };

  const renderItem = ({ item }) => {
    const qrTypeDef = QR_TYPES.find((t) => t.id === item.typeId);
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Thumbnail — tıklanınca büyür */}
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setPreviewItem(item); }}
          style={[styles.qrThumb, { backgroundColor: '#FFFFFF' }]}
          activeOpacity={0.7}
        >
          <QRCode
            value={item.qrValue || 'QR'}
            size={64}
            color={item.fgColor || '#000000'}
            backgroundColor={item.bgColor || '#FFFFFF'}
          />
          <Text style={styles.thumbHint}>👆</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <View style={styles.typeLabelRow}>
            {qrTypeDef && <QRIcon icon={qrTypeDef.icon} size={14} />}
            <Text style={[styles.typeLabel, { color: theme.accent }]}>{item.typeLabel}</Text>
          </View>
          <Text style={[styles.qrValue, { color: theme.text }]} numberOfLines={2}>{maskWifiPassword(item.typeId, item.qrValue)}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>{formatDate(item.createdAt)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.surface }]}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.8}
        >
          <Text style={{ color: theme.error, fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Geçmiş</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {filtered.length} / {history.length} QR kodu
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.8}>
            <Text style={[styles.clearAll, { color: theme.error }]}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Arama Çubuğu */}
      {history.length > 0 && (
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="QR içeriği veya tür ara..."
            placeholderTextColor={theme.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tür Filtresi (Chip'ler) */}
      {usedTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: !activeType ? theme.accent : theme.card, borderColor: theme.border }]}
            onPress={() => setActiveType(null)}
          >
            <Text style={[styles.chipText, { color: !activeType ? '#FFF' : theme.textSecondary }]}>Tümü</Text>
          </TouchableOpacity>
          {usedTypes.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, { backgroundColor: activeType === t.id ? theme.accent : theme.card, borderColor: theme.border }]}
              onPress={() => setActiveType(activeType === t.id ? null : t.id)}
            >
              <QRIcon icon={t.icon} size={13} />
              <Text style={[styles.chipText, { color: activeType === t.id ? '#FFF' : theme.textSecondary }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Liste */}
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Henüz kayıtlı QR kodu yok</Text>
          <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
            QR oluşturup "Geçmişe Kaydet" butonuna basın
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sonuç bulunamadı</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* QR Büyütme Modalı */}
      <Modal
        visible={!!previewItem}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewItem(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewItem(null)}
        >
          {previewItem && (
            <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
              <View style={[styles.previewQR, { backgroundColor: previewItem.bgColor || '#FFFFFF' }]}>
                <QRCode
                  value={previewItem.qrValue || 'QR'}
                  size={240}
                  color={previewItem.fgColor || '#000000'}
                  backgroundColor={previewItem.bgColor || '#FFFFFF'}
                />
              </View>
              <Text style={[styles.previewLabel, { color: theme.text }]} numberOfLines={3}>
                {maskWifiPassword(previewItem.typeId, previewItem.qrValue)}
              </Text>
              <Text style={[styles.previewDate, { color: theme.textMuted }]}>
                {formatDate(previewItem.createdAt)}
              </Text>
              <TouchableOpacity
                style={[styles.previewClose, { backgroundColor: theme.accent }]}
                onPress={() => setPreviewItem(null)}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  clearAll: { fontSize: 14, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  qrThumb: { borderRadius: 10, padding: 6, alignItems: 'center' },
  thumbHint: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  info: { flex: 1 },
  typeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  typeLabel: { fontSize: 13, fontWeight: '700' },
  qrValue: { fontSize: 12, lineHeight: 16, marginBottom: 4 },
  date: { fontSize: 11 },
  deleteBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyHint: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    gap: 16,
  },
  previewQR: { padding: 16, borderRadius: 16 },
  previewLabel: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  previewDate: { fontSize: 12 },
  previewClose: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
