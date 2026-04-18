import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';
import SectionCard from './SectionCard';

export default function PreviewCard({ fgColor, bgColor, sizePx }) {
  const { theme } = useTheme();

  return (
    <SectionCard padding="md" style={styles.card}>
      <View style={[styles.row, { gap: theme.spacing.md }]}>
        <View
          style={[
            styles.previewBox,
            {
              backgroundColor: bgColor,
              borderColor: theme.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <MaterialIcons name="qr-code-2" size={26} color={fgColor} />
        </View>
        <View style={styles.meta}>
          <AppText variant="caption" tone="tertiary">
            Önizleme
          </AppText>
          <AppText variant="subbody" tone="primary" style={styles.metaLine} numberOfLines={1}>
            {fgColor} / {bgColor}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            Boyut: {sizePx}px
          </AppText>
        </View>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBox: {
    width: 56,
    height: 56,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  metaLine: {
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
});

