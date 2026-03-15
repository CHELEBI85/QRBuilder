import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResult(data);
  };

  const reset = () => {
    setScanned(false);
    setResult(null);
  };

  const openLink = () => {
    if (!result) return;
    const url = result.startsWith('http') ? result : `https://${result}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Hata', 'Bu bağlantı açılamadı.')
    );
  };

  const shareResult = () => {
    Share.share({ message: result });
  };

  const detectType = (value) => {
    if (!value) return null;
    if (value.startsWith('https://wa.me')) return { label: 'WhatsApp', icon: '🟢' };
    if (value.startsWith('http')) return { label: 'URL', icon: '🔗' };
    if (value.startsWith('mailto:')) return { label: 'Email', icon: '✉️' };
    if (value.startsWith('tel:')) return { label: 'Telefon', icon: '📞' };
    if (value.startsWith('sms:')) return { label: 'SMS', icon: '💬' };
    if (value.startsWith('WIFI:')) return { label: 'WiFi', icon: '📶' };
    if (value.startsWith('BEGIN:VCARD')) return { label: 'Kişi', icon: '👤' };
    if (value.startsWith('geo:')) return { label: 'Konum', icon: '📍' };
    return { label: 'Metin', icon: '📝' };
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  if (!permission.granted) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionBox}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>📷</Text>
          <Text style={[styles.permTitle, { color: theme.text }]}>Kamera İzni Gerekli</Text>
          <Text style={[styles.permDesc, { color: theme.textSecondary }]}>
            QR kodları okumak için kamera izni vermeniz gerekiyor.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: theme.accent }]}
            onPress={requestPermission}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const detected = detectType(result);
  const isURL = result && (result.startsWith('http') || result.startsWith('www'));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>QR Tara</Text>
        <TouchableOpacity
          style={[styles.torchBtn, { backgroundColor: torchOn ? theme.accent : theme.card, borderColor: theme.border }]}
          onPress={() => setTorchOn((v) => !v)}
        >
          <MaterialIcons name={torchOn ? 'flash-on' : 'flash-off'} size={20} color={torchOn ? '#FFF' : theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {!scanned ? (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={torchOn}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          {/* Tarama Çerçevesi */}
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: theme.accent }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: theme.accent }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: theme.accent }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: theme.accent }]} />
            </View>
          </View>
          <Text style={styles.scanHint}>QR kodu çerçeve içine hizalayın</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Tip */}
            <View style={[styles.resultTypeBadge, { backgroundColor: theme.surface }]}>
              <Text style={{ fontSize: 22 }}>{detected?.icon}</Text>
              <Text style={[styles.resultTypeText, { color: theme.accent }]}>{detected?.label}</Text>
            </View>

            {/* İçerik */}
            <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Okunan İçerik</Text>
            <Text style={[styles.resultValue, { color: theme.text, backgroundColor: theme.surface }]}>
              {result}
            </Text>

            {/* Aksiyonlar */}
            <View style={styles.resultActions}>
              {isURL && (
                <TouchableOpacity
                  style={[styles.resultBtn, { backgroundColor: theme.accent }]}
                  onPress={openLink}
                >
                  <MaterialIcons name="open-in-browser" size={18} color="#FFF" />
                  <Text style={styles.resultBtnText}>Aç</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.resultBtn, { backgroundColor: theme.surface, borderWidth: 1.5, borderColor: theme.accent }]}
                onPress={shareResult}
              >
                <MaterialIcons name="share" size={18} color={theme.accent} />
                <Text style={[styles.resultBtnText, { color: theme.accent }]}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.scanAgainBtn, { backgroundColor: theme.accent }]}
            onPress={reset}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#FFF" />
            <Text style={styles.scanAgainText}>Tekrar Tara</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const FRAME = 240;
const CORNER = 24;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800' },
  torchBtn: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraWrapper: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME, height: FRAME,
  },
  corner: {
    position: 'absolute',
    width: CORNER, height: CORNER,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  scanHint: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    color: '#FFF', fontSize: 14, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  resultScroll: { padding: 20, gap: 16 },
  resultCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 16 },
  resultTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  resultTypeText: { fontSize: 15, fontWeight: '700' },
  resultLabel: { fontSize: 12, fontWeight: '600', marginBottom: -8 },
  resultValue: {
    fontSize: 14, lineHeight: 20, padding: 14, borderRadius: 12,
    fontFamily: 'monospace',
  },
  resultActions: { flexDirection: 'row', gap: 12 },
  resultBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 12,
  },
  resultBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  scanAgainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: 14,
  },
  scanAgainText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  permissionBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  permTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  permDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
});
