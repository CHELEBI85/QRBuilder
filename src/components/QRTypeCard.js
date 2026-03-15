import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import QRIcon from './QRIcon';

export default function QRTypeCard({ item, onPress }) {
  const { theme } = useTheme();
  const isPremium = item.premium === true;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.surface }]}>
        <QRIcon icon={item.icon} size={28} />
        {isPremium && (
          <View style={[styles.lockBadge, { backgroundColor: theme.accent }]}>
            <MaterialIcons name="lock" size={12} color="#FFF" />
          </View>
        )}
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
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
