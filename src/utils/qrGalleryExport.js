import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

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
 * Galeriye yazma izni.
 * Android: önce writeOnly — okuma izni olmadan yazma (expo-media-library önerisi).
 */
export async function ensureMediaLibrarySavePermission() {
  const write = await MediaLibrary.requestPermissionsAsync(true);
  if (write.status === 'granted') {
    return { ok: true };
  }
  if (Platform.OS === 'android') {
    const read = await MediaLibrary.requestPermissionsAsync(false);
    if (read.status === 'granted') {
      return { ok: true };
    }
    return { ok: false, status: read.status, canAskAgain: read.canAskAgain };
  }
  return { ok: false, status: write.status, canAskAgain: write.canAskAgain };
}

/**
 * PNG base64 (veya data-URL) → geçici dosya → galeri. Geçici dosya silinir.
 */
export async function savePngDataUrlToGallery(dataUrlOrBase64, filePrefix = 'qr') {
  const base64 = stripDataUrlToBase64Payload(dataUrlOrBase64);
  if (!base64) {
    throw new Error('EMPTY_IMAGE_DATA');
  }
  const safePrefix = String(filePrefix).replace(/[^a-zA-Z0-9_-]/g, '') || 'qr';
  const path = `${FileSystem.cacheDirectory}${safePrefix}_${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  let uriForMedia = path.startsWith('file://') ? path : `file://${path}`;
  // Android createAssetAsync: yerel URI file:/// ile başlamalı
  if (Platform.OS === 'android' && uriForMedia.startsWith('file://') && !uriForMedia.startsWith('file:///')) {
    uriForMedia = `file:///${uriForMedia.replace(/^file:\/\//, '')}`;
  }

  try {
    await MediaLibrary.createAssetAsync(uriForMedia);
  } catch (firstErr) {
    try {
      await MediaLibrary.saveToLibraryAsync(uriForMedia);
    } catch (secondErr) {
      try {
        await FileSystem.deleteAsync(path, { idempotent: true });
      } catch (_) {}
      throw secondErr || firstErr;
    }
  }

  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch (_) {}
}
