import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ColorSwatchRow from '../components/ColorSwatchRow';
import QRIcon from '../components/QRIcon';
import Toast from '../components/Toast';
import { saveQRToHistory } from '../utils/storage';
import { getPreferences } from '../utils/preferences';

const COLOR_THEMES = [
  { label: 'Klasik',  fg: '#000000', bg: '#FFFFFF' },
  { label: 'Gece',    fg: '#FFFFFF', bg: '#1A1A2E' },
  { label: 'Okyanus', fg: '#FFFFFF', bg: '#0077B6' },
  { label: 'Ateş',    fg: '#FFFFFF', bg: '#D62828' },
  { label: 'Orman',   fg: '#FFFFFF', bg: '#2D6A4F' },
  { label: 'Altın',   fg: '#1A1A2E', bg: '#FFD93D' },
];

async function writeTempQR(base64data, typeId = 'qr') {
  const path = `${FileSystem.cacheDirectory}qr_${typeId}_${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(path, base64data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

async function deleteTempFile(path) {
  try { await FileSystem.deleteAsync(path, { idempotent: true }); } catch (_) {}
}

export default function PreviewScreen({ route, navigation }) {
  const { qrType, formData, qrValue } = route.params;
  const { theme } = useTheme();
  const svgRef = useRef(null);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);
  const [qrSize, setQrSize] = useState(220);
  const [loading, setLoading] = useState(null);

  // Varsayılan tercihleri yükle
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf galerisine erişim izni gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setLogo(result.assets[0].uri);
    }
  };

  const saveToGallery = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye kaydetmek için izin gerekiyor.');
      return;
    }
    if (!svgRef.current) return;
    setLoading('gallery');
    svgRef.current.toDataURL(async (data) => {
      let path;
      try {
        path = await writeTempQR(data, qrType.id);
        await MediaLibrary.saveToLibraryAsync(path);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('QR kod galeriye kaydedildi!', 'success');
      } catch (e) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast('Galeriye kaydedilemedi.', 'error');
      } finally {
        if (path) await deleteTempFile(path);
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
      showToast('Geçmişe kaydedildi!', 'success');
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
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* QR Preview */}
        <View style={styles.qrWrapper}>
          <QRCodeDisplay
            value={qrValue}
            size={qrSize}
            color={fgColor}
            backgroundColor={bgColor}
            logo={logo}
            getRef={(ref) => { svgRef.current = ref; }}
          />
          <View style={styles.qrTypeRow}>
            <QRIcon icon={qrType.icon} size={16} />
            <Text style={[styles.qrTypeLabel, { color: theme.textSecondary }]}>{qrType.label}</Text>
          </View>
        </View>

        {/* Customization Panel */}
        <View style={[styles.panel, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>Özelleştirme</Text>

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

          {/* Slider */}
          <View style={styles.sizeRow}>
            <Text style={[styles.sizeLabel, { color: theme.textSecondary }]}>
              QR Boyutu: <Text style={{ color: theme.text, fontWeight: '700' }}>{qrSize}px</Text>
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={150}
              maximumValue={300}
              step={10}
              value={qrSize}
              onValueChange={setQrSize}
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.accent}
            />
          </View>

          {/* Renk Şablonları */}
          <View style={styles.sizeRow}>
            <Text style={[styles.sizeLabel, { color: theme.textSecondary }]}>Hazır Şablonlar</Text>
            <View style={styles.themesRow}>
              {COLOR_THEMES.map((ct) => (
                <TouchableOpacity
                  key={ct.label}
                  style={[styles.themeChip, { backgroundColor: ct.bg, borderColor: theme.border }]}
                  onPress={() => { setFgColor(ct.fg); setBgColor(ct.bg); Haptics.selectionAsync(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.themeChipText, { color: ct.fg }]}>{ct.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Logo */}
          <TouchableOpacity
            style={[styles.logoBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={pickLogo}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🖼️</Text>
            <Text style={[styles.logoBtnText, { color: theme.text }]}>{logo ? 'Logo Değiştir' : 'Logo Ekle'}</Text>
            {logo && (
              <TouchableOpacity onPress={() => { setLogo(null); Haptics.selectionAsync(); }} style={styles.removeLogoBtn}>
                <Text style={{ color: theme.error, fontSize: 12, fontWeight: '700' }}>✕ Kaldır</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ActionButton label="Galeriye Kaydet" icon="📥" color={theme.accent} textColor="#FFFFFF"
            loading={loading === 'gallery'} disabled={isLoading} onPress={saveToGallery} />
          <ActionButton label="Paylaş" icon="📤" color={theme.surface} textColor={theme.accent}
            borderColor={theme.accent} loading={loading === 'share'} disabled={isLoading} onPress={shareQR} />
          <ActionButton label="Geçmişe Kaydet" icon="🗂️" color={theme.surface} textColor={theme.text}
            borderColor={theme.border} loading={loading === 'history'} disabled={isLoading} onPress={saveToHistory} />
        </View>

        {/* Yeni QR */}
        <TouchableOpacity style={styles.newQRBtn} onPress={handleNewQR} activeOpacity={0.7}>
          <Text style={[styles.newQRText, { color: theme.textMuted }]}>+ Yeni QR Kodu Oluştur</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Custom Color Modal */}
      <Modal
        visible={customColorModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomColorModal({ visible: false, target: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Özel Renk</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Hex renk kodu girin (örn. #FF6B6B)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
              value={customColorInput}
              onChangeText={setCustomColorInput}
              placeholder="#000000"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              maxLength={7}
            />
            <View style={[styles.colorPreview, { backgroundColor: customColorInput }]} />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.surface }]}
                onPress={() => setCustomColorModal({ visible: false, target: null })}
              >
                <Text style={{ color: theme.text }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.accent }]}
                onPress={applyCustomColor}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({ label, icon, color, textColor, borderColor, loading, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        { backgroundColor: color, borderWidth: borderColor ? 1.5 : 0, borderColor },
        disabled && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.actionBtnText, { color: textColor }]}>{icon}  {label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  qrWrapper: { alignItems: 'center', marginBottom: 24 },
  qrTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  qrTypeLabel: { fontSize: 14 },
  panel: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 20 },
  panelTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  sizeRow: { marginBottom: 14 },
  sizeLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  slider: { width: '100%', height: 40 },
  logoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  logoBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  removeLogoBtn: { paddingHorizontal: 8 },
  actions: { gap: 12 },
  actionBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  themeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  themeChipText: { fontSize: 12, fontWeight: '700' },
  newQRBtn: { alignItems: 'center', paddingVertical: 20 },
  newQRText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 12 },
  colorPreview: { height: 40, borderRadius: 10, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});
