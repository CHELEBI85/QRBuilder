import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import { ensureMediaLibrarySavePermission, savePngDataUrlToGallery } from '../utils/qrGalleryExport';
import { QR_TYPES } from '../constants/qrTypes';
import QRIcon from '../components/QRIcon';
import QRCode from 'react-native-qrcode-svg';
import AppCard from '../components/AppCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import AppText from '../components/AppText';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [savingGallery, setSavingGallery] = useState(false);
  const modalQrRef = useRef(null);
  const firstHistoryLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstHistoryLoad.current) setLoading(true);
      getHistory().then((data) => {
        setHistory(data);
        setLoading(false);
        firstHistoryLoad.current = false;
      });
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

  const maskWifiPassword = (typeId, qrValue) => {
    if (typeId !== 'wifi' || !qrValue) return qrValue;
    return qrValue.replace(/(;P:)([^;]+)(;)/, '$1••••••••$3');
  };

  const savePreviewToGallery = async () => {
    if (!previewItem || !modalQrRef.current) {
      Alert.alert('Hata', 'QR görüntüsü hazır değil. Modalı kapatıp tekrar açın.');
      return;
    }
    const perm = await ensureMediaLibrarySavePermission();
    if (!perm.ok) {
      Alert.alert(
        'İzin gerekli',
        'Galeriye kaydetmek için fotoğraf / medya erişimine izin verin. Gerekirse sistem ayarlarından açın.'
      );
      return;
    }
    setSavingGallery(true);
    modalQrRef.current.toDataURL(async (data) => {
      try {
        await savePngDataUrlToGallery(data, previewItem.typeId || 'qr');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Kaydedildi', 'QR kod galerinize kaydedildi.');
      } catch (e) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (__DEV__) console.warn('[History saveToGallery]', e);
        Alert.alert(
          'Kaydedilemedi',
          e?.message === 'EMPTY_IMAGE_DATA'
            ? 'QR görüntüsü oluşturulamadı.'
            : 'Galeriye kayıt başarısız. İzinleri ve depolama alanını kontrol edin.'
        );
      } finally {
        setSavingGallery(false);
      }
    });
  };

  const renderItem = ({ item }) => {
    const qrTypeDef = QR_TYPES.find((t) => t.id === item.typeId);
    return (
      <AppCard
        style={[
          styles.listCard,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.md,
            marginHorizontal: theme.spacing.lg,
          },
        ]}
        padding="md"
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setPreviewItem(item);
          }}
          style={[styles.qrThumb, { backgroundColor: theme.qrLight }]}
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
          <View style={[styles.typeLabelRow, { gap: 5 }]}>
            {qrTypeDef && <QRIcon icon={qrTypeDef.icon} size={14} />}
            <AppText variant="caption" tone="primary" style={[styles.typeLabel, { color: theme.primary }]}>
              {item.typeLabel}
            </AppText>
          </View>
          <AppText variant="caption" tone="primary" style={styles.qrValue} numberOfLines={2}>
            {maskWifiPassword(item.typeId, item.qrValue)}
          </AppText>
          <AppText variant="caption" tone="tertiary" style={styles.date}>
            {formatDate(item.createdAt)}
          </AppText>
        </View>

        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: theme.surface, borderRadius: theme.radius.sm }]}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.8}
        >
          <Text style={{ color: theme.error, fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </AppCard>
    );
  };

  const headerSubtitle =
    loading && history.length === 0 ? '…' : `${filtered.length} / ${history.length} QR kodu`;

  let mainContent = null;
  if (loading) {
    mainContent = <LoadingState />;
  } else if (history.length === 0) {
    mainContent = (
      <EmptyState
        emoji="📋"
        title="Henüz kayıtlı QR kodu yok"
        hint='QR oluşturup "Geçmişe Kaydet" butonuna basın'
      />
    );
  } else if (filtered.length === 0) {
    mainContent = <EmptyState emoji="🔍" title="Sonuç bulunamadı" />;
  } else {
    mainContent = (
      <FlatList
        style={styles.flexMain}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <SectionHeader
        title="Geçmiş"
        subtitle={headerSubtitle}
        right={
          !loading && history.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.8}>
              <AppText variant="subbody" tone="error" style={styles.clearAll}>
                Tümünü Sil
              </AppText>
            </TouchableOpacity>
          ) : null
        }
      />

      {!loading && history.length > 0 && (
        <AppCard
          padding="md"
          style={[
            styles.searchRow,
            {
              marginHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.sm + 2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            },
          ]}
        >
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary, flex: 1 }]}
            value={search}
            onChangeText={setSearch}
            placeholder="QR içeriği veya tür ara..."
            placeholderTextColor={theme.textTertiary}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Text style={{ color: theme.textTertiary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </AppCard>
      )}

      {!loading && usedTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterRow,
            { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm + 2, gap: theme.spacing.sm },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: !activeType ? theme.primary : theme.card,
                borderColor: theme.border,
                borderRadius: theme.radius.pill,
              },
            ]}
            onPress={() => setActiveType(null)}
          >
            <Text style={[styles.chipText, { color: !activeType ? '#FFF' : theme.textSecondary }]}>Tümü</Text>
          </TouchableOpacity>
          {usedTypes.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.chip,
                {
                  backgroundColor: activeType === t.id ? theme.primary : theme.card,
                  borderColor: theme.border,
                  borderRadius: theme.radius.pill,
                },
              ]}
              onPress={() => setActiveType(activeType === t.id ? null : t.id)}
            >
              <QRIcon icon={t.icon} size={13} />
              <Text style={[styles.chipText, { color: activeType === t.id ? '#FFF' : theme.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.flexMain}>{mainContent}</View>

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
            <View style={[styles.previewCard, { backgroundColor: theme.card, borderRadius: theme.radius.xl }]}>
              <View style={[styles.previewQR, { backgroundColor: previewItem.bgColor || '#FFFFFF', borderRadius: theme.radius.md }]}>
                <QRCode
                  getRef={(r) => {
                    modalQrRef.current = r;
                  }}
                  value={previewItem.qrValue || 'QR'}
                  size={240}
                  color={previewItem.fgColor || '#000000'}
                  backgroundColor={previewItem.bgColor || '#FFFFFF'}
                />
              </View>
              <Text style={[styles.previewLabel, { color: theme.text }]} numberOfLines={3}>
                {maskWifiPassword(previewItem.typeId, previewItem.qrValue)}
              </Text>
              <Text style={[styles.previewDate, { color: theme.textMuted }]}>{formatDate(previewItem.createdAt)}</Text>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[
                    styles.previewSaveBtn,
                    {
                      backgroundColor: theme.primary,
                      borderRadius: theme.radius.sm,
                      opacity: savingGallery ? 0.6 : 1,
                    },
                  ]}
                  onPress={savePreviewToGallery}
                  disabled={savingGallery}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="QR kodu galeriye kaydet"
                >
                  <AppText variant="button" tone="onPrimary">
                    {savingGallery ? 'Kaydediliyor…' : 'Galeriye kaydet'}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewClose, { backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.border }]}
                  onPress={() => setPreviewItem(null)}
                  disabled={savingGallery}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Kapat"
                >
                  <AppText variant="button" tone="primary">
                    Kapat
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexMain: { flex: 1 },
  clearAll: { fontWeight: '600' },
  searchRow: {},
  searchInput: { fontSize: 14 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 0 },
  listCard: {},
  qrThumb: { borderRadius: 10, padding: 6, alignItems: 'center' },
  thumbHint: { fontSize: 10, marginTop: 2, textAlign: 'center' },
  info: { flex: 1 },
  typeLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  typeLabel: { fontWeight: '700' },
  qrValue: { lineHeight: 16, marginBottom: 4 },
  date: {},
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    padding: 24,
    alignItems: 'center',
    width: '85%',
    gap: 16,
  },
  previewQR: { padding: 16 },
  previewLabel: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  previewDate: { fontSize: 12 },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewSaveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  previewClose: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
});
