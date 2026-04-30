import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

/**
 * Güvenli alan + arka plan + yatay/üst/alt boşluk (spacing token).
 * İçerik scroll’lu veya düz View olabilir.
 */
export default function ScreenContainer({
  children,
  edges = ['top', 'left', 'right'],
  scroll = true,
  contentContainerStyle,
  ...scrollViewProps
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const usesBottomEdge = edges.includes('bottom');
  const customContentStyle = StyleSheet.flatten(contentContainerStyle) || {};

  const contentPad = {
    paddingHorizontal: customContentStyle.paddingHorizontal ?? theme.spacing.xl,
    paddingTop: customContentStyle.paddingTop ?? theme.spacing.xl,
    paddingBottom:
      (customContentStyle.paddingBottom ?? theme.spacing.xxxl) + (usesBottomEdge ? 0 : insets.bottom),
  };

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[contentContainerStyle, contentPad]}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentContainerStyle, contentPad]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
