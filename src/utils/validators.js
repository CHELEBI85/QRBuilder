/**
 * Her QR türü için form verisi doğrulama.
 * Hata varsa { field, message } döner, geçerliyse null.
 *
 * Tür listesi `constants/qrTypes` ile hizalıdır; handler haritası `QR_TYPE_IDS` ile doğrulanır.
 */
import { isRegisteredQRTypeId, QR_TYPE_IDS } from '../constants/qrTypes';

function validateUrl(data) {
  if (!data.url?.trim()) return { field: 'url', message: 'URL boş bırakılamaz.' };
  if (!/^https?:\/\/.+\..+/.test(data.url.trim()))
    return { field: 'url', message: 'Geçerli bir URL girin. (https://example.com)' };
  return null;
}

function validateText(data) {
  if (!data.text?.trim()) return { field: 'text', message: 'Metin boş bırakılamaz.' };
  return null;
}

function validateEmail(data) {
  if (!data.email?.trim()) return { field: 'email', message: 'Email adresi boş bırakılamaz.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    return { field: 'email', message: 'Geçerli bir email adresi girin.' };
  return null;
}

function validatePhone(data) {
  if (!data.phone?.trim()) return { field: 'phone', message: 'Telefon numarası boş bırakılamaz.' };
  if (!/^\+?[\d\s\-().]{7,20}$/.test(data.phone.trim()))
    return { field: 'phone', message: 'Geçerli bir telefon numarası girin.' };
  return null;
}

function validateSms(data) {
  if (!data.phone?.trim()) return { field: 'phone', message: 'Telefon numarası boş bırakılamaz.' };
  if (!/^\+?[\d\s\-().]{7,20}$/.test(data.phone.trim()))
    return { field: 'phone', message: 'Geçerli bir telefon numarası girin.' };
  return null;
}

function validateWifi(data) {
  if (!data.ssid?.trim()) return { field: 'ssid', message: 'Ağ adı (SSID) boş bırakılamaz.' };
  if (data.security !== 'nopass' && !data.password?.trim())
    return { field: 'password', message: 'Şifre boş bırakılamaz.' };
  return null;
}

function validateVcard(data) {
  if (!data.firstName?.trim() && !data.lastName?.trim())
    return { field: 'firstName', message: 'En az ad veya soyad girilmelidir.' };
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    return { field: 'email', message: 'Geçerli bir email adresi girin.' };
  if (data.phone && !/^\+?[\d\s\-().]{7,20}$/.test(data.phone.trim()))
    return { field: 'phone', message: 'Geçerli bir telefon numarası girin.' };
  return null;
}

function validateWhatsapp(data) {
  if (!data.phone?.trim()) return { field: 'phone', message: 'Telefon numarası boş bırakılamaz.' };
  const digits = data.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15)
    return { field: 'phone', message: 'Ülke kodu dahil geçerli numara girin. (+905551234567)' };
  return null;
}

function validateInstagramTwitter(data) {
  if (!data.username?.trim()) return { field: 'username', message: 'Kullanıcı adı boş bırakılamaz.' };
  if (!/^[\w.]{1,30}$/.test(data.username.trim()))
    return { field: 'username', message: 'Geçerli bir kullanıcı adı girin (harf, rakam, _, .)' };
  return null;
}

function validateYoutube(data) {
  if (!data.channel?.trim()) return { field: 'channel', message: 'Kanal adı boş bırakılamaz.' };
  return null;
}

function validateGps(data) {
  const lat = parseFloat(data.latitude);
  const lng = parseFloat(data.longitude);
  if (!data.latitude?.trim()) return { field: 'latitude', message: 'Enlem boş bırakılamaz.' };
  if (!data.longitude?.trim()) return { field: 'longitude', message: 'Boylam boş bırakılamaz.' };
  if (isNaN(lat) || lat < -90 || lat > 90)
    return { field: 'latitude', message: 'Enlem -90 ile 90 arasında olmalıdır.' };
  if (isNaN(lng) || lng < -180 || lng > 180)
    return { field: 'longitude', message: 'Boylam -180 ile 180 arasında olmalıdır.' };
  return null;
}

const QR_VALIDATORS = {
  url: validateUrl,
  text: validateText,
  email: validateEmail,
  phone: validatePhone,
  sms: validateSms,
  wifi: validateWifi,
  vcard: validateVcard,
  whatsapp: validateWhatsapp,
  instagram: validateInstagramTwitter,
  twitter: validateInstagramTwitter,
  youtube: validateYoutube,
  gps: validateGps,
};

if (__DEV__) {
  const handlerKeys = Object.keys(QR_VALIDATORS);
  const missing = QR_TYPE_IDS.filter((id) => !handlerKeys.includes(id));
  const extra = handlerKeys.filter((k) => !QR_TYPE_IDS.includes(k));
  if (missing.length) console.warn('[validators] QR types without handlers:', missing.join(', '));
  if (extra.length) console.warn('[validators] Validator keys not in QR_TYPES:', extra.join(', '));
}

export function validateQRForm(typeId, data) {
  if (!isRegisteredQRTypeId(typeId)) return null;
  const fn = QR_VALIDATORS[typeId];
  if (!fn) {
    if (__DEV__) console.warn('[validators] Missing handler for registered type:', typeId);
    return null;
  }
  return fn(data);
}
