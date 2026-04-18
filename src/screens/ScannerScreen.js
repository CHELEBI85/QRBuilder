import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import LoadingState from '../components/LoadingState';
import { AppButton, SectionCard } from '../components/ui';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [facing, setFacing] = useState('back');

  const scanLineY = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const frameSize = FRAME;
  const scanLineRange = frameSize - 26;

  useEffect(() => {
    if (scanned) return;
    scanLineY.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: scanLineRange, duration: 1650, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 1650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanned, scanLineRange, scanLineY]);

  const triggerSuccess = () => {
    successScale.setValue(0.85);
    successOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(successOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(successScale, { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(successOpacity, { toValue: 0, duration: 260, delay: 520, useNativeDriver: true }).start();
    });
  };

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResult(data);
    triggerSuccess();
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
        <SectionCard padding="lg" style={styles.permissionCard}>
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
          <View style={{ marginTop: theme.spacing.lg }}>
            <AppButton
              label={permanentlyDenied ? 'Ayarlara git' : 'İzin ver'}
              onPress={permanentlyDenied ? openAppSettings : requestPermission}
              variant="primary"
            />
          </View>
        </SectionCard>
      </ScreenContainer>
    );
  }

  const detected = detectType(result);
  const isURL = result && (result.startsWith('http') || result.startsWith('www'));
  const topOverlayBg = { backgroundColor: 'rgba(11,16,32,0.55)', borderBottomColor: theme.border };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      {/* Kamera arka planı: full-screen */}
      <View style={styles.cameraStage}>
        <CameraView
          style={styles.camera}
          facing={facing}
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarCodeScanned}
        />

        {/* Üst overlay header */}
        <View style={[styles.topOverlay, topOverlayBg]}>
          <View style={[styles.topRow, { paddingHorizontal: theme.spacing.xl }]}>
            <View style={styles.titleBlock}>
              <AppText variant="title3" tone="onPrimary" style={styles.overlayTitle} accessibilityRole="header">
                QR Tara
              </AppText>
              <AppText variant="caption" tone="onPrimary" style={styles.overlaySubtitle} numberOfLines={1}>
                Kamera yalnızca cihazında çalışır, veri gönderilmez.
              </AppText>
            </View>

            <View style={[styles.topActions, { gap: theme.spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: torchOn ? theme.primary : 'rgba(255,255,255,0.10)',
                    borderColor: 'rgba(255,255,255,0.14)',
                    borderRadius: theme.radius.md,
                  },
                ]}
                onPress={() => setTorchOn((v) => !v)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={torchOn ? 'Flaşı kapat' : 'Flaşı aç'}
                accessibilityState={{ selected: torchOn }}
              >
                <MaterialIcons name={torchOn ? 'flash-on' : 'flash-off'} size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    borderColor: 'rgba(255,255,255,0.14)',
                    borderRadius: theme.radius.md,
                  },
                ]}
                onPress={() => setFacing((v) => (v === 'back' ? 'front' : 'back'))}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Kamerayı değiştir"
              >
                <MaterialIcons name="cameraswitch" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tarama overlay */}
        {!scanned ? (
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: theme.primary }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: theme.primary }]} />

              <View style={[styles.frameInner, { borderColor: 'rgba(255,255,255,0.10)' }]} />

              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    backgroundColor: theme.primary,
                    transform: [{ translateY: scanLineY }],
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.scanHintPanel,
                {
                  backgroundColor: 'rgba(11,16,32,0.62)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: theme.radius.lg,
                },
              ]}
            >
              <View style={styles.hintRow}>
                <MaterialIcons name="center-focus-weak" size={18} color="#FFFFFF" />
                <AppText variant="subbody" tone="onPrimary" style={styles.hintTitle}>
                  QR kodu çerçeve içine hizalayın
                </AppText>
              </View>
              <AppText variant="caption" tone="onPrimary" style={styles.hintSub}>
                Parlamayı azaltmak için telefonu dik tutun. Gerekirse flaşı açın.
              </AppText>
            </View>
          </View>
        ) : null}

        {/* Success feedback */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.successOverlay,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View style={[styles.successBadge, { backgroundColor: 'rgba(11,16,32,0.72)' }]}>
            <MaterialIcons name="check-circle" size={34} color={theme.success} />
          </View>
        </Animated.View>
      </View>

      {/* Sonuç paneli */}
      {scanned ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.resultScroll, { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.huge, gap: theme.spacing.md }]}
        >
          <SectionCard padding="lg" style={styles.resultCard}>
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
              {isURL ? (
                <View style={{ flex: 1 }}>
                  <AppButton
                    label="Aç"
                    onPress={openLink}
                    variant="primary"
                    leftIcon={<MaterialIcons name="open-in-browser" size={18} color={theme.textOnPrimary} />}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <AppButton
                  label="Paylaş"
                  onPress={shareResult}
                  variant="outline"
                  leftIcon={<MaterialIcons name="share" size={18} color={theme.primary} />}
                />
              </View>
            </View>
          </SectionCard>

          <AppButton
            label="Tekrar tara"
            onPress={reset}
            variant="primary"
            size="lg"
            leftIcon={<MaterialIcons name="qr-code-scanner" size={22} color={theme.textOnPrimary} />}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const FRAME = 240;
const CORNER = 24;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
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
  cameraStage: { flex: 1 },
  camera: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  overlaySubtitle: {
    color: 'rgba(255,255,255,0.80)',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME,
    height: FRAME,
  },
  frameInner: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    top: 12,
    borderRadius: 2,
    opacity: 0.9,
  },
  scanHintPanel: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    width: Math.min(360, FRAME + 60),
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hintTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    flexShrink: 1,
  },
  hintSub: {
    color: 'rgba(255,255,255,0.78)',
    marginTop: 6,
    lineHeight: 18,
  },
  successOverlay: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
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
  scanAgainText: {
    textAlign: 'center',
  },
});
