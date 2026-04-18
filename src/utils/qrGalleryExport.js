import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * react-native-svg toDataURL çıktısı bazen tam data-URL; FileSystem Base64 yazımı için ham payload gerekir.
 */
export function stripDataUrlToBase64Payload(data) {
  if (typeof data !== 'string') return '';
  const trimmed = data.trim();
  const m = trimmed.match(/^data:image\/[\w+.-]+;base64,(.+)$/i);
  return m ? m[1].replace(/\s/g, '') : trimmed.replace(/\s/g, '');
}

/**
 * Galeriye yazma izni ister.
 * iOS "limited" erişimde de yeni fotoğraf eklenebilir, bu yüzden ok:true döner.
 */
export async function ensureMediaLibrarySavePermission() {
  // writeOnly:false → tam izin ister; hem read hem write gerektiren createAssetAsync için daha güvenilir
  const result = await MediaLibrary.requestPermissionsAsync(false);
  if (result.status === 'granted') return { ok: true };
  // iOS "limited" seçimi — yeni asset eklenebilir
  if (Platform.OS === 'ios' && result.status === 'limited') return { ok: true };
  return { ok: false, status: result.status, canAskAgain: result.canAskAgain };
}

/**
 * PNG base64 (veya data-URL) → geçici dosya → galeri. Geçici dosya daima temizlenir.
 * Hata durumunda SAVE_FAILED:<detay> mesajıyla Error fırlatır.
 */
export async function savePngDataUrlToGallery(dataUrlOrBase64, filePrefix = 'qr') {
  const base64 = stripDataUrlToBase64Payload(dataUrlOrBase64);
  if (!base64) throw new Error('EMPTY_IMAGE_DATA');

  const safePrefix = String(filePrefix).replace(/[^a-zA-Z0-9_-]/g, '') || 'qr';
  const tempPath = `${FileSystem.cacheDirectory}${safePrefix}_${Date.now()}.png`;

  // 1) Geçici dosyayı yaz
  await FileSystem.writeAsStringAsync(tempPath, base64, {
    encoding: 'base64',
  });

  // 2) Dosyanın gerçekten yazıldığını doğrula
  const info = await FileSystem.getInfoAsync(tempPath);
  if (!info.exists || (info.size != null && info.size === 0)) {
    throw new Error('FILE_WRITE_FAILED');
  }

  // 3) Galeri URI'si: FileSystem.cacheDirectory Android'de zaten file:/// ile başlar
  //    createAssetAsync doğrudan dosya yolunu da kabul eder; URI'ye zorla
  const uri = tempPath.startsWith('file://') ? tempPath : `file://${tempPath}`;

  console.log('[Gallery] uri:', uri);
  console.log('[Gallery] fileInfo:', JSON.stringify(info));
  console.log('[Gallery] platform:', Platform.OS, Platform.Version);

  let saved = false;
  let err1 = null;
  let err2 = null;

  // Deneme 1: createAssetAsync
  try {
    await MediaLibrary.createAssetAsync(uri);
    saved = true;
    console.log('[Gallery] createAssetAsync → OK');
  } catch (e) {
    err1 = e;
    console.warn('[Gallery] createAssetAsync FAILED:', {
      message: e?.message,
      code: e?.code,
      nativeStackAndroid: e?.nativeStackAndroid,
      userInfo: e?.userInfo,
      str: String(e),
    });
  }

  // Deneme 2: saveToLibraryAsync
  if (!saved) {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      saved = true;
      console.log('[Gallery] saveToLibraryAsync → OK');
    } catch (e) {
      err2 = e;
      console.warn('[Gallery] saveToLibraryAsync FAILED:', {
        message: e?.message,
        code: e?.code,
        nativeStackAndroid: e?.nativeStackAndroid,
        userInfo: e?.userInfo,
        str: String(e),
      });
    }
  }

  // Geçici dosyayı her durumda temizle
  try { await FileSystem.deleteAsync(tempPath, { idempotent: true }); } catch (_) {}

  if (!saved) {
    const lastErr = err2 ?? err1;
    const detail =
      lastErr?.message ||
      lastErr?.code ||
      (lastErr != null ? String(lastErr) : 'UNKNOWN');
    throw new Error(`SAVE_FAILED:${detail}`);
  }
}
