/**
 * Form verisini QR türüne göre stringe çıkarır.
 *
 * Tür listesi `constants/qrTypes` ile hizalıdır; handler haritası `QR_TYPE_IDS` ile doğrulanır.
 */
import { isRegisteredQRTypeId, QR_TYPE_IDS } from '../constants/qrTypes';

function formatUrl(data) {
  return data.url || '';
}

function formatText(data) {
  return data.text || '';
}

function formatEmail(data) {
  const params = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return `mailto:${data.email || ''}${query}`;
}

function formatPhone(data) {
  return `tel:${data.phone || ''}`;
}

function formatSms(data) {
  const body = data.message ? `?body=${encodeURIComponent(data.message)}` : '';
  return `sms:${data.phone || ''}${body}`;
}

function formatWifi(data) {
  const sec = data.security || 'WPA';
  const ssid = (data.ssid || '').replace(/[;,:"\\]/g, (c) => `\\${c}`);
  const pass = (data.password || '').replace(/[;,:"\\]/g, (c) => `\\${c}`);
  return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
}

function formatVcard(data) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.firstName || ''} ${data.lastName || ''}`.trim(),
    `N:${data.lastName || ''};${data.firstName || ''};;;`,
  ];
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.url) lines.push(`URL:${data.url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function formatWhatsapp(data) {
  const phone = (data.phone || '').replace(/\D/g, '');
  const msg = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
  return `https://wa.me/${phone}${msg}`;
}

function formatInstagram(data) {
  return `https://instagram.com/${data.username || ''}`;
}

function formatTwitter(data) {
  return `https://twitter.com/${data.username || ''}`;
}

function formatYoutube(data) {
  return `https://youtube.com/@${data.channel || ''}`;
}

function formatGps(data) {
  return `geo:${data.latitude || '0'},${data.longitude || '0'}`;
}

const QR_FORMATTERS = {
  url: formatUrl,
  text: formatText,
  email: formatEmail,
  phone: formatPhone,
  sms: formatSms,
  wifi: formatWifi,
  vcard: formatVcard,
  whatsapp: formatWhatsapp,
  instagram: formatInstagram,
  twitter: formatTwitter,
  youtube: formatYoutube,
  gps: formatGps,
};

if (__DEV__) {
  const handlerKeys = Object.keys(QR_FORMATTERS);
  const missing = QR_TYPE_IDS.filter((id) => !handlerKeys.includes(id));
  const extra = handlerKeys.filter((k) => !QR_TYPE_IDS.includes(k));
  if (missing.length) console.warn('[qrFormatter] QR types without handlers:', missing.join(', '));
  if (extra.length) console.warn('[qrFormatter] Formatter keys not in QR_TYPES:', extra.join(', '));
}

export function formatQRData(typeId, data) {
  if (!isRegisteredQRTypeId(typeId)) return '';
  const fn = QR_FORMATTERS[typeId];
  if (!fn) {
    if (__DEV__) console.warn('[qrFormatter] Missing handler for registered type:', typeId);
    return '';
  }
  return fn(data);
}
