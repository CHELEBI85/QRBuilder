import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AppText from '../AppText';

/**
 * Standard ekran header'ı (title/subtitle + opsiyonel left/right slot).
 * Not: Varsayılan olarak yatay padding eklemez; ScreenContainer ile birlikte kullanımı hedefler.
 */
export default function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  style,
  contentStyle,
  align = 'left',
}) {
  const { theme } = useTheme();

  const isCentered = align === 'center';

  return (
    <View style={[styles.root, { marginBottom: theme.spacing.lg }, style]}>
      <View style={[styles.row, isCentered && styles.rowCentered]}>
        {left ? <View style={styles.side}>{left}</View> : null}
        <View style={[styles.content, isCentered && styles.contentCentered, contentStyle]}>
          {title ? (
            <AppText
              variant="title2"
              tone="primary"
              style={[styles.title, isCentered && styles.textCentered]}
              numberOfLines={1}
            >
              {title}
            </AppText>
          ) : null}
          {subtitle ? (
            <AppText
              variant="subbody"
              tone="tertiary"
              style={[styles.subtitle, isCentered && styles.textCentered]}
              numberOfLines={2}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ? <View style={styles.side}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCentered: {
    justifyContent: 'center',
  },
  side: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  contentCentered: {
    flex: 0,
    minWidth: 0,
    maxWidth: '100%',
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
  },
  textCentered: {
    textAlign: 'center',
  },
});

