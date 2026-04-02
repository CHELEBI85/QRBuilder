import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ColorSwatchRow from '../components/ColorSwatchRow';
import QRIcon from '../components/QRIcon';
import Toast from '../components/Toast';
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';
import { saveQRToHistory } from '../utils/storage';
import { getPreferences } from '../utils/preferences';
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
    encoding: FileSystem.EncodingType.Base64,
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
  const svgRef = useRef(null);

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
  const [customColorModal, setCustomColorModal] = useState({ visible: false, target: null });
  const [customColorInput, setCustomColorInput] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const openCustomColor = (target) => {
    setCustomColorInput(target === 'fg' ? fgColor : bgColor);
    setCustomColorModal({ visible: true, target });
  };

  const applyCustomColor = () => {
    const hex = customColorInput.trim();
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
      if (customColorModal.target === 'fg') setFgColor(hex);
      else setBgColor(hex);
      setCustomColorModal({ visible: false, target: null });
    } else {
      Alert.alert('Geçersiz Renk', 'Lütfen geçerli bir hex renk kodu girin (örn. #FF6B6B)');
    }
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
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled) return;
      if (result.assets?.[0]?.uri) {
        setLogo(result.assets[0].uri);
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
      setLogo(result.assets[0].uri);
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
    svgRef.current.toDataURL(async (data) => {
      try {
        await savePngDataUrlToGallery(data, qrType.id);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('QR kod galeriye kaydedildi.', 'success');
      } catch (e) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        if (__DEV__) console.warn('[saveToGallery]', e);
        const detail = e?.message || e?.code || '';
        const msg =
          e?.message === 'EMPTY_IMAGE_DATA'
            ? 'QR görüntüsü oluşturulamadı.'
            : `Galeriye kayıt başarısız. İzinleri kontrol edin.${detail ? `\n(${String(detail)})` : ''}`;
        Alert.alert('Kaydedilemedi', msg);
        showToast('Galeriye kaydedilemedi.', 'error');
      } finally {
        setLoading(null);
      }
    });
  };

  const shareQR = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!svgRef.current) return;
    setLoading('share');
    svgRef.current.toDataURL(async (data) => {
      let path;
      try {
        path = await writeTempQR(data, qrType.id);
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(path, { mimeType: 'image/png', dialogTitle: 'QR Kodu Paylaş' });
        } else {
          showToast('Bu cihazda paylaşım desteklenmiyor.', 'error');
        }
      } catch (e) {
        showToast('Paylaşım sırasında bir hata oluştu.', 'error');
      } finally {
        if (path) await deleteTempFile(path);
        setLoading(null);
      }
    });
  };

  const saveToHistory = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading('history');
    try {
      await saveQRToHistory({
        typeId: qrType.id,
        typeLabel: qrType.label,
        qrValue,
        formData,
        fgColor,
        bgColor,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Geçmişe kaydedildi.', 'success');
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
        <AppCard
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
        </AppCard>

        {/* Özelleştirme */}
        <AppCard padding="lg" style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
            ÖZELLEŞTİRME
          </AppText>

          <ColorSwatchRow
            label="QR Rengi"
            selected={fgColor}
            onSelect={setFgColor}
            onCustom={() => openCustomColor('fg')}
          />
          <ColorSwatchRow
            label="Arka Plan Rengi"
            selected={bgColor}
            onSelect={setBgColor}
            onCustom={() => openCustomColor('bg')}
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
        </AppCard>

        {/* Dışa aktar */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md, paddingHorizontal: theme.spacing.xs }}>
            KAYDET VE PAYLAŞ
          </AppText>
          <View style={[styles.actions, { gap: theme.spacing.md }]}>
            <ActionButton
              label="Galeriye kaydet"
              icon="📥"
              color={theme.primary}
              textColor={theme.textOnPrimary}
              loading={loading === 'gallery'}
              disabled={isLoading}
              onPress={saveToGallery}
            />
            <ActionButton
              label="Paylaş"
              icon="📤"
              color={theme.surface}
              textColor={theme.primary}
              borderColor={theme.primary}
              loading={loading === 'share'}
              disabled={isLoading}
              onPress={shareQR}
            />
            <ActionButton
              label="Geçmişe kaydet"
              icon="🗂️"
              color={theme.surface}
              textColor={theme.textPrimary}
              borderColor={theme.border}
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

      <Modal
        visible={customColorModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomColorModal({ visible: false, target: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }]}>
            <AppText variant="title3" tone="primary" style={{ marginBottom: theme.spacing.sm }}>
              Özel renk
            </AppText>
            <AppText variant="caption" tone="secondary" style={{ marginBottom: theme.spacing.lg }}>
              Hex renk kodu girin (örn. #FF6B6B)
            </AppText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  borderRadius: theme.radius.sm,
                },
              ]}
              value={customColorInput}
              onChangeText={setCustomColorInput}
              placeholder="#000000"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="characters"
              maxLength={7}
            />
            <View style={[styles.colorPreview, { backgroundColor: customColorInput, borderRadius: theme.radius.sm }]} />
            <View style={[styles.modalButtons, { gap: theme.spacing.md }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.surface, borderRadius: theme.radius.sm }]}
                onPress={() => setCustomColorModal({ visible: false, target: null })}
              >
                <AppText variant="bodyMedium" tone="primary">İptal</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary, borderRadius: theme.radius.sm }]}
                onPress={applyCustomColor}
              >
                <AppText variant="button" tone="onPrimary">Uygula</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ActionButton({ label, icon, color, textColor, borderColor, loading, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        {
          backgroundColor: color,
          borderWidth: borderColor ? 1.5 : 0,
          borderColor: borderColor || 'transparent',
          borderRadius: 14,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.actionBtnText, { color: textColor }]}>
          {icon}  {label}
        </Text>
      )}
    </TouchableOpacity>
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
  actionBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  themeChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  themeChipText: { fontSize: 12, fontWeight: '700' },
  newQRBtn: { alignItems: 'center', paddingVertical: 20 },
  newQRText: { fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { padding: 24, paddingBottom: 40 },
  modalInput: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12 },
  colorPreview: { height: 40, marginBottom: 16 },
  modalButtons: { flexDirection: 'row' },
  modalBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
});
