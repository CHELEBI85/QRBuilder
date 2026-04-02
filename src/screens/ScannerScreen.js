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
import ScreenContainer from '../components/ScreenContainer';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';

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
    setTorchOn(false);
  };

  const openLink = async () => {
    if (!result) return;
    const raw = result.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Bağlantı açılamıyor', 'Bu adres cihazınızda açılamıyor.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Hata', 'Bu bağlantı açılamadı.');
    }
  };

  const shareResult = () => {
    if (!result) return;
    Share.share({ message: result });
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() =>
      Alert.alert('Ayarlara gidilemedi', 'Lütfen uygulama izinlerini sistem ayarlarından açın.')
    );
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

  if (permission === null) {
    return (
      <ScreenContainer scroll={false} edges={['top', 'left', 'right']} contentContainerStyle={styles.permissionLoading}>
        <LoadingState message="Kamera izni kontrol ediliyor…" style={styles.loadingFill} />
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    const permanentlyDenied = permission.canAskAgain === false;

    return (
      <ScreenContainer scroll={false} edges={['top', 'left', 'right']} contentContainerStyle={styles.permissionLoading}>
        <AppCard padding="lg" style={styles.permissionCard}>
          <Text style={styles.permissionEmoji} accessible={false}>
            {permanentlyDenied ? '🔒' : '📷'}
          </Text>
          <AppText variant="title3" tone="primary" style={styles.permissionTitle}>
            {permanentlyDenied ? 'Kamera erişimi kapalı' : 'Kamera izni gerekli'}
          </AppText>
          <AppText variant="subbody" tone="secondary" style={styles.permissionBody}>
            {permanentlyDenied
              ? 'QR kodu tarayabilmek için sistem ayarlarından bu uygulama için kamera iznini açın.'
              : 'QR kodları okumak için kamera erişimine izin vermeniz gerekiyor. Verileriniz yalnızca cihazınızda işlenir.'}
          </AppText>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: theme.primary,
                borderRadius: theme.radius.sm + 2,
                paddingVertical: theme.spacing.md,
                marginTop: theme.spacing.lg,
              },
            ]}
            onPress={permanentlyDenied ? openAppSettings : requestPermission}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={permanentlyDenied ? 'Sistem ayarlarını aç' : 'Kamera izni iste'}
          >
            <AppText variant="button" tone="onPrimary" style={styles.primaryBtnLabel}>
              {permanentlyDenied ? 'Ayarlara git' : 'İzin ver'}
            </AppText>
          </TouchableOpacity>
        </AppCard>
      </ScreenContainer>
    );
  }

  const detected = detectType(result);
  const isURL = result && (result.startsWith('http') || result.startsWith('www'));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md }]}>
        <AppText variant="title2" tone="primary" accessibilityRole="header">
          QR Tara
        </AppText>
        <TouchableOpacity
          style={[
            styles.torchBtn,
            {
              backgroundColor: torchOn ? theme.primary : theme.card,
              borderColor: theme.border,
              borderRadius: theme.radius.sm,
            },
          ]}
          onPress={() => setTorchOn((v) => !v)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={torchOn ? 'Flaşı kapat' : 'Flaşı aç'}
          accessibilityState={{ selected: torchOn }}
        >
          <MaterialIcons name={torchOn ? 'flash-on' : 'flash-off'} size={22} color={torchOn ? theme.textOnPrimary : theme.textSecondary} />
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
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: theme.primary }]} />
            </View>
          </View>
          <View style={[styles.scanHintPill, { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: theme.radius.pill }]}>
            <AppText variant="subbody" tone="onPrimary" style={styles.scanHintText}>
              QR kodu çerçeve içine hizalayın
            </AppText>
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.resultScroll, { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.huge, gap: theme.spacing.md }]}
        >
          <AppCard padding="lg" style={styles.resultCard}>
            <View style={[styles.resultTypeBadge, { backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm }]}>
              <Text style={styles.resultEmoji} accessible={false}>
                {detected?.icon}
              </Text>
              <AppText variant="subbody" tone="primary" style={[styles.resultTypeLabel, { color: theme.primary }]}>
                {detected?.label}
              </AppText>
            </View>

            <AppText variant="caption" tone="secondary" style={styles.resultFieldLabel}>
              Okunan içerik
            </AppText>
            <View style={{ backgroundColor: theme.surfaceSecondary, borderRadius: theme.radius.sm, padding: theme.spacing.md }}>
              <Text style={[styles.resultValue, { color: theme.textPrimary }]} selectable>
                {result}
              </Text>
            </View>

            <AppText variant="caption" tone="tertiary" style={styles.resultSafetyHint}>
              {isURL ? 'Bağlantıyı yalnızca güvendiğiniz kaynaklarda açın.' : 'İçeriği paylaşmadan önce kontrol edin.'}
            </AppText>

            <View style={[styles.resultActions, { gap: theme.spacing.sm }]}>
              {isURL && (
                <TouchableOpacity
                  style={[
                    styles.resultBtn,
                    {
                      backgroundColor: theme.primary,
                      borderRadius: theme.radius.sm,
                      paddingVertical: theme.spacing.md,
                    },
                  ]}
                  onPress={openLink}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Bağlantıyı tarayıcıda aç"
                >
                  <MaterialIcons name="open-in-browser" size={18} color={theme.textOnPrimary} />
                  <AppText variant="button" tone="onPrimary">
                    Aç
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.resultBtn,
                  styles.resultBtnOutline,
                  {
                    borderColor: theme.primary,
                    borderRadius: theme.radius.sm,
                    paddingVertical: theme.spacing.md,
                    backgroundColor: theme.surface,
                  },
                ]}
                onPress={shareResult}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Metni paylaş"
              >
                <MaterialIcons name="share" size={18} color={theme.primary} />
                <AppText variant="button" tone="primary" style={{ color: theme.primary }}>
                  Paylaş
                </AppText>
              </TouchableOpacity>
            </View>
          </AppCard>

          <TouchableOpacity
            style={[
              styles.scanAgainBtn,
              {
                backgroundColor: theme.primary,
                borderRadius: theme.radius.sm + 2,
                paddingVertical: theme.spacing.md,
              },
            ]}
            onPress={reset}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Yeni QR kod tara"
          >
            <MaterialIcons name="qr-code-scanner" size={22} color={theme.textOnPrimary} />
            <AppText variant="button" tone="onPrimary" style={styles.scanAgainText}>
              Tekrar tara
            </AppText>
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
  permissionLoading: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingFill: {
    flex: 1,
    minHeight: 200,
  },
  permissionCard: {
    alignSelf: 'center',
    maxWidth: 400,
    width: '100%',
  },
  permissionEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionBody: {
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnLabel: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  torchBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraWrapper: { flex: 1, position: 'relative' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME,
    height: FRAME,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  scanHintPill: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scanHintText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultScroll: { flexGrow: 1 },
  resultCard: {
    gap: 12,
  },
  resultTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  resultEmoji: {
    fontSize: 22,
  },
  resultTypeLabel: {
    fontWeight: '700',
  },
  resultFieldLabel: {
    marginBottom: -4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  resultSafetyHint: {
    lineHeight: 18,
  },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap' },
  resultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 120,
  },
  resultBtnOutline: {
    borderWidth: 1.5,
  },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
  },
  scanAgainText: {
    textAlign: 'center',
  },
});
