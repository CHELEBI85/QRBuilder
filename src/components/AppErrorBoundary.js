import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Yayın öncesi: işlenmeyen render hatalarında boş ekran / tam çökme yerine kontrollü fallback.
 */
export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (__DEV__) {
      console.warn('[AppErrorBoundary]', error?.message, info?.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback} accessibilityRole="alert">
          <Text style={styles.title}>Bir sorun oluştu</Text>
          <Text style={styles.body}>Uygulamayı kapatıp yeniden açmayı deneyin.</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({ hasError: false })}
            accessibilityRole="button"
            accessibilityLabel="Yeniden dene"
          >
            <Text style={styles.btnText}>Yeniden dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F6F8FC',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
