import React from 'react';
import { Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getQRTypeById } from '../../constants/qrTypes';
import QRIcon from '../QRIcon';
import AppText from '../AppText';
import SectionCard from './SectionCard';

export default function HistoryCard({ item, onPressPreview, onDelete, onRecreate }) {
  const { theme } = useTheme();
  const qrTypeDef = getQRTypeById(item.typeId);

  const shareText = async () => {
    const msg = item?.qrValue || '';
    if (!msg) return;
    try {
      await Share.share({ message: msg });
    } catch (_) {}
  };

  return (
    <SectionCard padding="lg" style={styles.card}>
      <View style={[styles.topRow, { gap: theme.spacing.md }]}>
        <TouchableOpacity
          onPress={onPressPreview}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="QR önizle"
          style={[
            styles.thumb,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <MaterialIcons name="qr-code-2" size={28} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.main}>
          <View style={[styles.typeRow, { gap: 8 }]}>
            {qrTypeDef ? <QRIcon icon={qrTypeDef.icon} size={14} /> : null}
            <AppText variant="caption" tone="secondary" style={[styles.typeText, { color: theme.primary }]}>
              {item.typeLabel}
            </AppText>
            <View style={styles.dot} />
            <AppText variant="caption" tone="tertiary" numberOfLines={1}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </AppText>
          </View>

          <AppText variant="bodyMedium" tone="primary" style={styles.value} numberOfLines={2}>
            {item.qrValue}
          </AppText>
        </View>
      </View>

      <View style={[styles.actionsRow, { marginTop: theme.spacing.md, gap: theme.spacing.sm }]}>
        <TouchableOpacity
          onPress={onRecreate}
          activeOpacity={0.85}
          style={[
            styles.actionBtn,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
              borderRadius: theme.radius.pill,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tekrar oluştur"
        >
          <MaterialIcons name="refresh" size={16} color={theme.textSecondary} />
          <AppText variant="caption" tone="secondary" style={styles.actionText}>
            Tekrar
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={shareText}
          activeOpacity={0.85}
          style={[
            styles.actionBtn,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
              borderRadius: theme.radius.pill,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
        >
          <MaterialIcons name="share" size={16} color={theme.textSecondary} />
          <AppText variant="caption" tone="secondary" style={styles.actionText}>
            Paylaş
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.85}
          style={[
            styles.actionBtn,
            styles.actionDanger,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
              borderRadius: theme.radius.pill,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sil"
        >
          <MaterialIcons name="delete-outline" size={16} color={theme.error} />
          <AppText variant="caption" tone="error" style={styles.actionText}>
            Sil
          </AppText>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 56,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontWeight: '800',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  value: {
    marginTop: 6,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionText: {
    fontWeight: '700',
  },
  actionDanger: {},
});

