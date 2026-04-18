import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../context/ThemeContext';
import { getHistory, deleteQRFromHistory, clearHistory } from '../utils/storage';
import { ensureMediaLibrarySavePermission, savePngDataUrlToGallery } from '../utils/qrGalleryExport';
import { QR_TYPES } from '../constants/qrTypes';
import QRCode from 'react-native-qrcode-svg';
import AppCard from '../components/AppCard';
import { HistoryCard, ScreenHeader, SearchInput, EmptyState, PremiumChip } from '../components/ui';
import LoadingState from '../components/LoadingState';
import AppText from '../components/AppText';
import ScreenContainer from '../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
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
      getHistory()
        .then((data) => {
          setHistory(data);
          setLoading(false);
          firstHistoryLoad.current = false;
        })
        .catch(() => {
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
          // Logoyu da sil (documentDirectory'de saklıysa)
          const item = history.find((h) => h.id === id);
          if (item?.logo?.includes('qrlogo_')) {
            FileSystem.deleteAsync(item.logo, { idempotent: true }).catch(() => {});
          }
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
          // Tüm logo dosyalarını temizle
          history.forEach((item) => {
            if (item?.logo?.includes('qrlogo_')) {
              FileSystem.deleteAsync(item.logo, { idempotent: true }).catch(() => {});
            }
          });
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

  const goToCreate = () => {
    navigation.navigate('CreateTab');
  };

  const handleRecreate = (item) => {
    const qrType = QR_TYPES.find((t) => t.id === item.typeId);
    if (!qrType) return;
    navigation.navigate('CreateTab', { screen: 'Create', params: { qrType } });
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
        console.warn('[History saveToGallery]', e);
        const rawMsg = e?.message || '';
        let errText;
        if (rawMsg === 'EMPTY_IMAGE_DATA' || rawMsg === 'FILE_WRITE_FAILED') {
          errText = 'QR görüntüsü oluşturulamadı. Lütfen tekrar deneyin.';
        } else if (rawMsg.startsWith('SAVE_FAILED:')) {
          const detail = rawMsg.replace('SAVE_FAILED:', '').trim();
          errText = `Galeriye kayıt başarısız.\n\nHata: ${detail || 'Bilinmiyor'}\n\nCihaz ayarlarından uygulama izinlerini kontrol edin.`;
        } else {
          errText = `Galeriye kayıt başarısız.${rawMsg ? `\n\nHata: ${rawMsg}` : ''}\n\nCihaz ayarlarından uygulama izinlerini kontrol edin.`;
        }
        Alert.alert('Kaydedilemedi', errText);
      } finally {
        setSavingGallery(false);
      }
    });
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ marginBottom: theme.spacing.md }}>
        <HistoryCard
          item={{
            ...item,
            qrValue: maskWifiPassword(item.typeId, item.qrValue),
          }}
          onPressPreview={() => {
            Haptics.selectionAsync();
            setPreviewItem(item);
          }}
          onDelete={() => handleDelete(item.id)}
          onRecreate={() => handleRecreate(item)}
        />
      </View>
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
        icon="history"
        title="Henüz kayıtlı QR kodu yok"
        description="İlk QR’ını oluştur ve galeriye kaydetmeden önce burada sakla."
        actionLabel="İlk QR'ını oluştur"
        onAction={goToCreate}
      />
    );
  } else if (filtered.length === 0) {
    mainContent = (
      <EmptyState
        icon="search"
        title="Sonuç bulunamadı"
        description="Arama terimini veya filtreleri değiştirin."
      />
    );
  } else {
    mainContent = (
      <FlatList
        style={styles.flexMain}
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: theme.spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />
    );
  }

  return (
    <ScreenContainer scroll={false} edges={['top', 'left', 'right']} contentContainerStyle={styles.screenPadFix}>
      <ScreenHeader
        title="Geçmiş"
        subtitle={headerSubtitle}
        right={
          !loading && history.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.85}>
              <PremiumChip kind="locked" label="Temizle" style={styles.clearChip} />
            </TouchableOpacity>
          ) : null
        }
      />

      {!loading && history.length > 0 && (
        <SearchInput
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="QR içeriği veya tür ara..."
          style={{ marginBottom: theme.spacing.sm }}
        />
      )}

      {!loading && usedTypes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterRow,
            { paddingHorizontal: 0, paddingBottom: theme.spacing.sm + 2, gap: theme.spacing.sm },
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
                  {...(previewItem.logo ? { logo: { uri: previewItem.logo }, logoSize: 60, logoBackgroundColor: 'transparent' } : {})}
                />
              </View>
              <Text style={[styles.previewLabel, { color: theme.textPrimary }]} numberOfLines={3}>
                {maskWifiPassword(previewItem.typeId, previewItem.qrValue)}
              </Text>
              <Text style={[styles.previewDate, { color: theme.textTertiary }]}>{formatDate(previewItem.createdAt)}</Text>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexMain: { flex: 1 },
  clearAll: { fontWeight: '600' },
  screenPadFix: {
    paddingTop: 0,
  },
  clearChip: {
    backgroundColor: 'transparent',
  },
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
