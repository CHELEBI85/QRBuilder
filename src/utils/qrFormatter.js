/**
 * Formats form data into the correct QR code string for each type.
 */
export function formatQRData(typeId, data) {
  switch (typeId) {
    case 'url':
      return data.url || '';

    case 'text':
      return data.text || '';

    case 'email': {
      const params = [];
      if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
      if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
      const query = params.length ? `?${params.join('&')}` : '';
      return `mailto:${data.email || ''}${query}`;
    }

    case 'phone':
      return `tel:${data.phone || ''}`;

    case 'sms': {
      const body = data.message ? `?body=${encodeURIComponent(data.message)}` : '';
      return `sms:${data.phone || ''}${body}`;
    }

    case 'wifi': {
      const sec = data.security || 'WPA';
      const ssid = (data.ssid || '').replace(/[;,:"\\]/g, (c) => `\\${c}`);
      const pass = (data.password || '').replace(/[;,:"\\]/g, (c) => `\\${c}`);
      return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
    }

    case 'vcard': {
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

    case 'whatsapp': {
      const phone = (data.phone || '').replace(/\D/g, '');
      const msg = data.message ? `?text=${encodeURIComponent(data.message)}` : '';
      return `https://wa.me/${phone}${msg}`;
    }

    case 'instagram':
      return `https://instagram.com/${data.username || ''}`;

    case 'twitter':
      return `https://twitter.com/${data.username || ''}`;

    case 'youtube':
      return `https://youtube.com/@${data.channel || ''}`;

    case 'gps':
      return `geo:${data.latitude || '0'},${data.longitude || '0'}`;

    default:
      return '';
  }
}
