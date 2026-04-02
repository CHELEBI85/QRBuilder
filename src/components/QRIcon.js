import React from 'react';
import { Text } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function QRIcon({ icon, size = 28 }) {
  const { theme } = useTheme();
  if (!icon) return null;
  if (icon.lib === 'MaterialIcons') {
    return <MaterialIcons name={icon.name} size={size} color={icon.color} />;
  }
  if (icon.lib === 'FontAwesome5') {
    return <FontAwesome5 name={icon.name} size={size} color={icon.color} brand={icon.brand} />;
  }
  // lib === 'text' — X (Twitter); sabit #000 koyu zeminde kaybolmasın
  return (
    <Text style={{ fontSize: size - 2, color: theme.textPrimary, fontWeight: '900' }}>
      {icon.name}
    </Text>
  );
}
