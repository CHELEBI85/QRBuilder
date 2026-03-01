import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, deleteQRFromHistory, clearHistory } from '../utils/storage';
import { QR_TYPES } from '../constants/qrTypes';
import QRIcon from '../components/QRIcon';
import QRCode from 'react-native-qrcode-svg';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, [])
  );

  const handleDelete = (id) => {
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
    Alert.alert('Tümünü Sil', 'Tüm geçmişi silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Tümünü Sil',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setHistory([]);
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

  const renderItem = ({ item }) => {
    const qrTypeDef = QR_TYPES.find((t) => t.id === item.typeId);
    return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.qrThumb, { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 6 }]}>
        <QRCode
          value={item.qrValue || 'QR'}
          size={64}
          color={item.fgColor || '#000000'}
          backgroundColor={item.bgColor || '#FFFFFF'}
        />
      </View>
      <View style={styles.info}>
        <View style={styles.typeLabelRow}>
          {qrTypeDef && <QRIcon icon={qrTypeDef.icon} size={14} />}
          <Text style={[styles.typeLabel, { color: theme.accent }]}>
            {item.typeLabel}
          </Text>
        </View>
        <Text style={[styles.qrValue, { color: theme.text }]} numberOfLines={2}>
          {item.qrValue}
        </Text>
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
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Geçmiş</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {history.length} QR kodu
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.8}>
            <Text style={[styles.clearAll, { color: theme.error }]}>Tümünü Sil</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Henüz kayıtlı QR kodu yok
          </Text>
          <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
            QR oluşturup "Geçmişe Kaydet" butonuna basın
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  subtitle: { fontSize: 14, marginTop: 2 },
  clearAll: { fontSize: 14, fontWeight: '600' },
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
  qrThumb: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  typeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  typeLabel: { fontSize: 13, fontWeight: '700' },
  qrValue: { fontSize: 12, lineHeight: 16, marginBottom: 4 },
  date: { fontSize: 11 },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyHint: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
});
