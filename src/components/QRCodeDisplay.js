import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';

export default function QRCodeDisplay({
  value,
  size = 220,
  color,
  backgroundColor,
  logo,
  logoSize,
  getRef,
}) {
  const { theme } = useTheme();
  const qrColor = color || theme.text;
  const qrBg = backgroundColor || theme.card;

  if (!value || value.trim() === '') {
    return <View style={[styles.empty, { width: size, height: size, backgroundColor: qrBg }]} />;
  }

  const logoProps = logo
    ? {
        logo: { uri: logo },
        logoSize: logoSize || Math.floor(size * 0.22),
        logoBackgroundColor: qrBg,
        logoBorderRadius: 8,
        logoMargin: 4,
      }
    : {};

  return (
    <View style={[styles.container, { backgroundColor: qrBg, padding: 16, borderRadius: 16 }]}>
      <QRCode
        value={value}
        size={size}
        color={qrColor}
        backgroundColor={qrBg}
        quietZone={8}
        getRef={getRef}
        {...logoProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    borderRadius: 16,
  },
});
