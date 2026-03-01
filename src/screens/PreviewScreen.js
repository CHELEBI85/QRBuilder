import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../context/ThemeContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ColorSwatchRow from '../components/ColorSwatchRow';
import QRIcon from '../components/QRIcon';
import { saveQRToHistory } from '../utils/storage';

export default function PreviewScreen({ route, navigation }) {
  const { qrType, formData, qrValue } = route.params;
  const { theme } = useTheme();
  const svgRef = useRef(null);

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [logo, setLogo] = useState(null);
  const [qrSize, setQrSize] = useState(220);

  const [customColorModal, setCustomColorModal] = useState({ visible: false, target: null });
  const [customColorInput, setCustomColorInput] = useState('');

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
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye kaydetmek için izin gerekiyor.');
      return;
    }
    try {
      svgRef.current?.toDataURL(async (data) => {
        const path = `${FileSystem.cacheDirectory}qr_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(path, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.saveToLibraryAsync(path);
        Alert.alert('Başarılı', 'QR kod galeriye kaydedildi!');
      });
    } catch (e) {
      Alert.alert('Hata', 'Kaydetme sırasında bir hata oluştu.');
    }
  };

  const shareQR = async () => {
    try {
      svgRef.current?.toDataURL(async (data) => {
        const path = `${FileSystem.cacheDirectory}qr_share_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(path, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(path, { mimeType: 'image/png' });
        } else {
          Alert.alert('Paylaşım', 'Bu cihazda paylaşım desteklenmiyor.');
        }
      });
    } catch (e) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const saveToHistory = async () => {
    await saveQRToHistory({
      typeId: qrType.id,
      typeLabel: qrType.label,
      qrValue,
      formData,
      fgColor,
      bgColor,
    });
    Alert.alert('Kaydedildi', 'QR kod geçmişe eklendi!', [
      { text: 'Tamam' },
      {
        text: 'Geçmişe Git',
        onPress: () => navigation.navigate('HistoryTab'),
      },
    ]);
  };

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
            <Text style={[styles.qrTypeLabel, { color: theme.textSecondary }]}>
              {qrType.label}
            </Text>
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

          {/* Size Slider (manual buttons) */}
          <View style={styles.sizeRow}>
            <Text style={[styles.sizeLabel, { color: theme.textSecondary }]}>
              QR Boyutu: {qrSize}px
            </Text>
            <View style={styles.sizeControls}>
              <TouchableOpacity
                style={[styles.sizeBtn, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setQrSize((s) => Math.max(150, s - 20))}
              >
                <Text style={{ color: theme.text, fontSize: 20 }}>−</Text>
              </TouchableOpacity>
              <View style={[styles.sizeTrack, { backgroundColor: theme.surface }]}>
                <View
                  style={[
                    styles.sizeIndicator,
                    {
                      backgroundColor: theme.accent,
                      width: `${((qrSize - 150) / 150) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.sizeBtn, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setQrSize((s) => Math.min(300, s + 20))}
              >
                <Text style={{ color: theme.text, fontSize: 20 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logo Picker */}
          <TouchableOpacity
            style={[styles.logoBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={pickLogo}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>🖼️</Text>
            <Text style={[styles.logoBtnText, { color: theme.text }]}>
              {logo ? 'Logo Değiştir' : 'Logo Ekle'}
            </Text>
            {logo && (
              <TouchableOpacity onPress={() => setLogo(null)} style={styles.removeLogoBtn}>
                <Text style={{ color: theme.error, fontSize: 12, fontWeight: '700' }}>✕ Kaldır</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={saveToGallery}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>📥 Galeriye Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.accent }]}
            onPress={shareQR}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionBtnText, { color: theme.accent }]}>📤 Paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.border }]}
            onPress={saveToHistory}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionBtnText, { color: theme.text }]}>🗂️ Geçmişe Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
              style={[
                styles.modalInput,
                { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text },
              ]}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  qrWrapper: { alignItems: 'center', marginBottom: 24 },
  qrTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  qrTypeLabel: { fontSize: 14 },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  panelTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  sizeRow: { marginBottom: 14 },
  sizeLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 2 },
  sizeControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sizeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  sizeIndicator: { height: '100%', borderRadius: 4 },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  removeLogoBtn: { paddingHorizontal: 8 },
  actions: { gap: 12 },
  actionBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  colorPreview: { height: 40, borderRadius: 10, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
