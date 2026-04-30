import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ColorSwatchRow from '../components/ColorSwatchRow';
import ColorPickerModal from '../components/ColorPickerModal';
import QRIcon from '../components/QRIcon';
import Toast from '../components/Toast';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';
import { AppButton, SectionCard } from '../components/ui';
import { saveQRToHistory } from '../utils/storage';
import { getPreferences } from '../utils/preferences';
import { showInterstitialOnQrCreated } from '../utils/interstitialAds';
import {
  ensureMediaLibrarySavePermission,
  savePngDataUrlToGallery,
  stripDataUrlToBase64Payload,
} from '../utils/qrGalleryExport';

const COLOR_THEMES = [
  { label: 'Klasik', fg: '#000000', bg: '#FFFFFF' },
  { label: 'Gece', fg: '#FFFFFF', bg: '#1A1A2E' },
  { label: 'Okyanus', fg: '#FFFFFF', bg: '#0077B6' },
  { label: 'Ateş', fg: '#FFFFFF', bg: '#D62828' },
  { label: 'Orman', fg: '#FFFFFF', bg: '#2D6A4F' },
  { label: 'Altın', fg: '#1A1A2E', bg: '#FFD93D' },
];

async function writeTempQR(base64data, typeId = 'qr') {
  const payload = stripDataUrlToBase64Payload(base64data);
  const path = `${FileSystem.cacheDirectory}qr_${typeId}_${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(path, payload, {
    encoding: 'base64',
  });
  return path;
}

async function deleteTempFile(path) {
  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch (_) {}
}

export default function PreviewScreen({ route, navigation }) {
  const { qrType, formData, qrValue } = route.params;
  const { theme } = useTheme();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const svgRef = useRef(null);
  const mountedRef = useRef(true);
  const interstitialShown = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // QR oluşturulduğunda interstitial göster (abonelik yüklenince, 1.5s gecikmeyle)
  useEffect(() => {
    if (subscriptionLoading || interstitialShown.current) return;
    interstitialShown.current = true;
    const t = setTimeout(() => showInterstitialOnQrCreated({ isPremium }), 1500);
    return () => clearTimeout(t);
  }, [subscriptionLoading, isPremium]);

  const setSvgRef = useCallback((ref) => {
    svgRef.current = ref;
  }, []);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);
  const [qrSize, setQrSize] = useState(220);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    getPreferences().then((prefs) => {
      setFgColor(prefs.defaultFgColor);
      setBgColor(prefs.defaultBgColor);
      setQrSize(prefs.defaultQrSize);
    });
  }, []);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [colorPicker, setColorPicker] = useState({ visible: false, target: null });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const openColorPicker = (target) => {
    setColorPicker({ visible: true, target });
  };

  const handleColorPicked = (hex) => {
    if (colorPicker.target === 'fg') setFgColor(hex);
    else setBgColor(hex);
    setColorPicker({ visible: false, target: null });
  };

  const normalizePickedImageUri = async (uri) => {
    if (!uri || typeof uri !== 'string') return null;
    // Android'de picker çoğu zaman content:// döndürür; SVG Image bazı cihazlarda bunu render edemez.
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      try {
        const target = `${FileSystem.cacheDirectory}logo_${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: uri, to: target });
        return target;
      } catch (e) {
        if (__DEV__) console.warn('[pickLogo] copy content:// failed', e);
        // En azından orijinal URI ile dene
        return uri;
      }
    }
    return uri;
  };

  const pickLogo = async () => {
    await Haptics.selectionAsync();
    const pickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: Platform.OS === 'ios',
      quality: 0.85,
      ...(Platform.OS === 'ios' ? { aspect: [1, 1] } : {}),
    };

    if (Platform.OS === 'android') {
      // Android 13+ sistem foto seçici çoğu zaman izin diyaloğu olmadan çalışır; allowsEditing kırılgandır.
      pickerOptions.allowsEditing = false;
      // Android <13'te bazı cihazlarda izin yine de gerekli olabilir; önce kontrol et.
      const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (existing.status !== 'granted' && existing.canAskAgain) {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      }

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled) return;
      if (result.assets?.[0]?.uri) {
        const normalized = await normalizePickedImageUri(result.assets[0].uri);
        if (normalized) setLogo(normalized);
        return;
      }
      Alert.alert('Logo seçilemedi', 'Görsel seçilemedi. Tekrar deneyin.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf galerisine erişim için izin verin.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (!result.canceled && result.assets?.[0]) {
      const normalized = await normalizePickedImageUri(result.assets[0].uri);
      if (normalized) setLogo(normalized);
    }
  };

  const saveToGallery = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const perm = await ensureMediaLibrarySavePermission();
    if (!perm.ok) {
      Alert.alert(
        'İzin gerekli',
        'Galeriye kaydetmek için fotoğraf / medya erişimine izin verin. Ayarlardan uygulama izinlerini açabilirsiniz.'
      );
      return;
    }
    if (!svgRef.current) {
      Alert.alert('Bekleyin', 'QR görüntüsü henüz hazır değil. Bir an sonra tekrar deneyin.');
      return;
    }
    setLoading('gallery');
    const refSnapshot = svgRef.current;
    refSnapshot.toDataURL(async (data) => {
      try {
        await savePngDataUrlToGallery(data, qrType.id);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (mountedRef.current) showToast('QR kod galeriye kaydedildi.', 'success');
      } catch (e) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.warn('[saveToGallery]', e);
        if (!mountedRef.current) return;
        const rawMsg = e?.message || '';
        let msg;
        if (rawMsg === 'EMPTY_IMAGE_DATA' || rawMsg === 'FILE_WRITE_FAILED') {
          msg = 'QR görüntüsü oluşturulamadı. Lütfen tekrar deneyin.';
        } else if (rawMsg.startsWith('SAVE_FAILED:')) {
          const detail = rawMsg.replace('SAVE_FAILED:', '').trim();
          msg = `Galeriye kayıt başarısız.\n\nHata: ${detail || 'Bilinmiyor'}\n\nCihaz ayarlarından uygulama izinlerini kontrol edin.`;
        } else {
          const detail = rawMsg || e?.code || String(e) || '';
          msg = `Galeriye kayıt başarısız.${detail ? `\n\nHata: ${detail}` : ''}\n\nCihaz ayarlarından uygulama izinlerini kontrol edin.`;
        }
        Alert.alert('Kaydedilemedi', msg);
        showToast('Galeriye kaydedilemedi.', 'error');
      } finally {
        if (mountedRef.current) setLoading(null);
      }
    });
  };

  const shareQR = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!svgRef.current) return;
    setLoading('share');
    const refSnapshot = svgRef.current;
    refSnapshot.toDataURL(async (data) => {
      let path;
      try {
        path = await writeTempQR(data, qrType.id);
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(path, { mimeType: 'image/png', dialogTitle: 'QR Kodu Paylaş' });
        } else {
          if (mountedRef.current) showToast('Bu cihazda paylaşım desteklenmiyor.', 'error');
        }
      } catch (e) {
        if (mountedRef.current) showToast('Paylaşım sırasında bir hata oluştu.', 'error');
      } finally {
        if (path) await deleteTempFile(path);
        if (mountedRef.current) setLoading(null);
      }
    });
  };

  const saveToHistory = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading('history');
    try {
      // Logo varsa cache'den documentDirectory'ye kopyala — cache temizlenince kaybolmasın
      let persistedLogo = null;
      if (logo) {
        try {
          const ext = logo.split('.').pop()?.split('?')[0] || 'jpg';
          const dest = `${FileSystem.documentDirectory}qrlogo_${Date.now()}.${ext}`;
          await FileSystem.copyAsync({ from: logo, to: dest });
          persistedLogo = dest;
        } catch (_) {
          persistedLogo = logo; // kopyalanamadıysa orijinal URI'yi dene
        }
      }
      await saveQRToHistory({
        typeId: qrType.id,
        typeLabel: qrType.label,
        qrValue,
        formData,
        fgColor,
        bgColor,
        logo: persistedLogo,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Geçmişe kaydedildi.', 'success');
      onQrPersistedForAds();
    } catch (e) {
      showToast('Geçmişe kaydedilemedi.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleNewQR = () => {
    Haptics.selectionAsync();
    navigation.popToTop();
  };

  const isLoading = loading !== null;

  return (
    <>
      <ScreenContainer
        scroll
        edges={['bottom', 'left', 'right']}
        contentContainerStyle={{
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.huge,
        }}
      >
        {/* Önizleme */}
        <SectionCard
          padding="lg"
          style={{
            marginBottom: theme.spacing.lg,
            alignItems: 'center',
            backgroundColor: theme.previewBg,
            borderColor: theme.border,
          }}
        >
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md, alignSelf: 'stretch' }}>
            ÖNİZLEME
          </AppText>
          <QRCodeDisplay
            value={qrValue}
            size={qrSize}
            color={fgColor}
            backgroundColor={bgColor}
            logo={logo}
            getRef={setSvgRef}
          />
          <View style={[styles.qrTypeRow, { gap: theme.spacing.xs, marginTop: theme.spacing.md }]}>
            <QRIcon icon={qrType.icon} size={16} />
            <AppText variant="subbody" tone="secondary">
              {qrType.label}
            </AppText>
          </View>
        </SectionCard>

        {/* Özelleştirme */}
        <SectionCard padding="lg" style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
            ÖZELLEŞTİRME
          </AppText>

          <ColorSwatchRow
            label="QR Rengi"
            selected={fgColor}
            onSelect={setFgColor}
            onCustom={() => openColorPicker('fg')}
          />
          <ColorSwatchRow
            label="Arka Plan Rengi"
            selected={bgColor}
            onSelect={setBgColor}
            onCustom={() => openColorPicker('bg')}
          />

          <View style={{ marginBottom: theme.spacing.md }}>
            <AppText variant="subbody" tone="secondary" style={styles.sizeLabel}>
              QR Boyutu:{' '}
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{qrSize}px</Text>
            </AppText>
            <Slider
              style={styles.slider}
              minimumValue={150}
              maximumValue={300}
              step={10}
              value={qrSize}
              onValueChange={setQrSize}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
          </View>

          <View style={{ marginBottom: theme.spacing.md }}>
            <AppText variant="subbody" tone="secondary" style={styles.sizeLabel}>
              Hazır şablonlar
            </AppText>
            <View style={[styles.themesRow, { gap: theme.spacing.sm, marginTop: theme.spacing.xs }]}>
              {COLOR_THEMES.map((ct) => (
                <TouchableOpacity
                  key={ct.label}
                  style={[
                    styles.themeChip,
                    { backgroundColor: ct.bg, borderColor: theme.border, borderRadius: theme.radius.pill },
                  ]}
                  onPress={() => {
                    setFgColor(ct.fg);
                    setBgColor(ct.bg);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.themeChipText, { color: ct.fg }]}>{ct.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.logoBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                borderRadius: theme.radius.sm,
                gap: theme.spacing.sm,
                padding: theme.spacing.sm + 2,
              },
            ]}
            onPress={pickLogo}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🖼️</Text>
            <AppText variant="bodyMedium" tone="primary" style={styles.logoBtnText}>
              {logo ? 'Logo değiştir' : 'Logo ekle'}
            </AppText>
            {logo ? (
              <TouchableOpacity
                onPress={() => {
                  setLogo(null);
                  Haptics.selectionAsync();
                }}
                style={styles.removeLogoBtn}
              >
                <AppText variant="caption" tone="error" style={{ fontWeight: '700' }}>
                  Kaldır
                </AppText>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        </SectionCard>

        {/* Dışa aktar */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md, paddingHorizontal: theme.spacing.xs }}>
            KAYDET VE PAYLAŞ
          </AppText>
          <View style={[styles.actions, { gap: theme.spacing.md }]}>
            <AppButton
              label="Galeriye kaydet"
              variant="primary"
              loading={loading === 'gallery'}
              disabled={isLoading}
              onPress={saveToGallery}
            />
            <AppButton
              label="Paylaş"
              variant="outline"
              loading={loading === 'share'}
              disabled={isLoading}
              onPress={shareQR}
            />
            <AppButton
              label="Geçmişe kaydet"
              variant="secondary"
              loading={loading === 'history'}
              disabled={isLoading}
              onPress={saveToHistory}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.newQRBtn} onPress={handleNewQR} activeOpacity={0.7} hitSlop={8}>
          <AppText variant="subbody" tone="tertiary" style={styles.newQRText}>
            + Yeni QR kodu oluştur
          </AppText>
        </TouchableOpacity>
      </ScreenContainer>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ColorPickerModal
        visible={colorPicker.visible}
        initialColor={colorPicker.target === 'fg' ? fgColor : bgColor}
        onApply={handleColorPicked}
        onClose={() => setColorPicker({ visible: false, target: null })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  qrTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeLabel: {
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  slider: { width: '100%', height: 40 },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  removeLogoBtn: { paddingHorizontal: 8 },
  actions: {},
  themesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  themeChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  themeChipText: { fontSize: 12, fontWeight: '700' },
  newQRBtn: { alignItems: 'center', paddingVertical: 20 },
  newQRText: { fontWeight: '600' },
});
