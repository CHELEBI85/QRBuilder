import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import QRIcon from './QRIcon';

export default function QRTypeCard({ item, onPress }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.surface }]}>
        <QRIcon icon={item.icon} size={28} />
      </View>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
        {item.label}
      </Text>
      <Text style={[styles.desc, { color: theme.textMuted }]} numberOfLines={1}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});
