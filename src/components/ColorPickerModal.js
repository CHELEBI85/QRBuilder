import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import AppText from './AppText';

// ─── Renk dönüşüm yardımcıları ────────────────────────────────────────────────

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
  const clean = hex.replace('#', '');
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return { h: 0, s: 0, l: 0 };
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function expandHex(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 3) return '#' + clean.split('').map((c) => c + c).join('');
  return hex;
}

function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

// ─── SVG gradyan çubuğu ───────────────────────────────────────────────────────

const HUE_COLORS = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00',
  '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
  '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000',
];

function GradientBar({ colors }) {
  const gradId = useRef(`gbar_${Math.random().toString(36).slice(2, 8)}`).current;
  const [barWidth, setBarWidth] = useState(300);

  return (
    <View
      style={styles.barWrap}
      onLayout={(e) => setBarWidth(Math.floor(e.nativeEvent.layout.width))}
    >
      <Svg width={barWidth} height={20}>
        <Defs>
          <SvgGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            {colors.map((color, i) => (
              <Stop
                key={i}
                offset={i / (colors.length - 1)}
                stopColor={color}
                stopOpacity={1}
              />
            ))}
          </SvgGradient>
        </Defs>
        <Rect x={0} y={0} width={barWidth} height={20} fill={`url(#${gradId})`} rx={10} ry={10} />
      </Svg>
    </View>
  );
}

// ─── ColorPickerModal ─────────────────────────────────────────────────────────

export default function ColorPickerModal({ visible, initialColor = '#000000', onApply, onClose }) {
  const { theme } = useTheme();
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 50 });
  const [hexInput, setHexInput] = useState('#000000');
  const [hexError, setHexError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const expanded = isValidHex(initialColor) ? expandHex(initialColor) : '#000000';
    const parsed = hexToHsl(expanded);
    setHsl(parsed);
    setHexInput(expanded.toUpperCase());
    setHexError(false);
  }, [visible, initialColor]);

  const currentHex = hslToHex(hsl.h, hsl.s, hsl.l).toUpperCase();

  // Slider değişince hex alanını güncelle
  useEffect(() => {
    setHexInput(currentHex);
    setHexError(false);
  }, [currentHex]);

  const handleHexChange = (text) => {
    const val = text.startsWith('#') ? text : `#${text}`;
    setHexInput(val.toUpperCase());
    const expanded = expandHex(val);
    if (isValidHex(expanded)) {
      setHsl(hexToHsl(expanded));
      setHexError(false);
    } else {
      setHexError(true);
    }
  };

  const satColors = [hslToHex(hsl.h, 0, hsl.l), hslToHex(hsl.h, 100, hsl.l)];
  const lightColors = ['#000000', hslToHex(hsl.h, Math.max(hsl.s, 60), 50), '#FFFFFF'];
  const thumbColor = currentHex;
  const applyTextColor = hsl.l > 65 ? '#000000' : '#FFFFFF';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            },
          ]}
        >
          <AppText variant="title3" tone="primary" style={styles.title}>
            Renk Seç
          </AppText>

          {/* Büyük önizleme */}
          <View style={[styles.preview, { backgroundColor: currentHex, borderRadius: theme.radius.md }]} />

          {/* Hex input */}
          <View
            style={[
              styles.hexRow,
              {
                backgroundColor: theme.inputBackground,
                borderColor: hexError ? theme.error : theme.border,
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <TextInput
              style={[styles.hexInput, { color: theme.textPrimary }]}
              value={hexInput}
              onChangeText={handleHexChange}
              autoCapitalize="characters"
              maxLength={7}
              placeholder="#000000"
              placeholderTextColor={theme.textTertiary}
            />
            <View
              style={[
                styles.hexDot,
                { backgroundColor: hexError ? theme.surfaceSecondary : currentHex, borderRadius: 6 },
              ]}
            />
          </View>
          {hexError && (
            <AppText variant="caption" tone="error" style={styles.hexErr}>
              Geçersiz hex kodu
            </AppText>
          )}

          {/* Hue */}
          <AppText variant="caption" tone="secondary" style={styles.label}>Renk Tonu</AppText>
          <GradientBar colors={HUE_COLORS} />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={360}
            step={1}
            value={hsl.h}
            onValueChange={(v) => setHsl((p) => ({ ...p, h: v }))}
            minimumTrackTintColor={hslToHex(hsl.h, 100, 50)}
            maximumTrackTintColor={theme.border}
            thumbTintColor={hslToHex(hsl.h, 100, 50)}
          />

          {/* Saturation */}
          <AppText variant="caption" tone="secondary" style={styles.label}>Doygunluk</AppText>
          <GradientBar colors={satColors} />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={hsl.s}
            onValueChange={(v) => setHsl((p) => ({ ...p, s: v }))}
            minimumTrackTintColor={thumbColor}
            maximumTrackTintColor={theme.border}
            thumbTintColor={thumbColor}
          />

          {/* Lightness */}
          <AppText variant="caption" tone="secondary" style={styles.label}>Parlaklık</AppText>
          <GradientBar colors={lightColors} />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={hsl.l}
            onValueChange={(v) => setHsl((p) => ({ ...p, l: v }))}
            minimumTrackTintColor={thumbColor}
            maximumTrackTintColor={theme.border}
            thumbTintColor={thumbColor}
          />

          {/* Butonlar */}
          <View style={[styles.btnRow, { gap: theme.spacing.md, marginTop: theme.spacing.lg }]}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.surface, borderRadius: theme.radius.sm }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <AppText variant="bodyMedium" tone="primary">İptal</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: currentHex, borderRadius: theme.radius.sm }]}
              onPress={() => onApply(currentHex)}
              activeOpacity={0.8}
            >
              <AppText variant="button" style={{ color: applyTextColor }}>Uygula</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 24,
    paddingBottom: 44,
  },
  title: {
    fontWeight: '700',
    marginBottom: 16,
  },
  preview: {
    height: 64,
    marginBottom: 16,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  hexInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  hexDot: {
    width: 28,
    height: 28,
  },
  hexErr: {
    marginBottom: 6,
    marginLeft: 2,
  },
  label: {
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  barWrap: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: -4,
  },
  btnRow: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
