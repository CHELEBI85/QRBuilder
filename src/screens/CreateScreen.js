import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';
import QRIcon from '../components/QRIcon';
import { formatQRData } from '../utils/qrFormatter';
import { validateQRForm } from '../utils/validators';

export default function CreateScreen({ route, navigation }) {
  const { qrType } = route.params;
  const { theme } = useTheme();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Her ekran ziyaretinde formu sıfırla
  useEffect(() => {
    setFormData({});
    setErrors({});
  }, [qrType.id]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Alan düzeltilince hatasını temizle
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleGenerate = () => {
    const validationError = validateQRForm(qrType.id, formData);
    if (validationError) {
      setErrors({ [validationError.field]: validationError.message });
      Alert.alert('Eksik veya Hatalı Bilgi', validationError.message);
      return;
    }
    setErrors({});
    const qrValue = formatQRData(qrType.id, formData);
    navigation.navigate('Preview', { qrType, formData, qrValue });
  };

  const renderField = (field) => {
    if (field.type === 'picker') {
      const current = formData[field.key] || field.defaultValue || field.options[0];
      return (
        <View key={field.key} style={styles.pickerWrapper}>
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>{field.label}</Text>
          <View style={styles.pickerRow}>
            {field.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: current === opt ? theme.accent : theme.inputBackground,
                    borderColor: current === opt ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => updateField(field.key, opt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerOptionText, { color: current === opt ? '#FFFFFF' : theme.text }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View key={field.key}>
        <InputField
          label={field.label}
          value={formData[field.key] || ''}
          onChangeText={(v) => updateField(field.key, v)}
          placeholder={field.placeholder}
          keyboardType={field.keyboardType}
          secureTextEntry={field.secureTextEntry}
          multiline={field.multiline}
          autoCapitalize={field.multiline ? 'sentences' : 'none'}
          hasError={!!errors[field.key]}
        />
        {errors[field.key] && (
          <Text style={[styles.errorText, { color: theme.error }]}>⚠ {errors[field.key]}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.typeHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.surface }]}>
            <QRIcon icon={qrType.icon} size={30} />
          </View>
          <View>
            <Text style={[styles.typeName, { color: theme.text }]}>{qrType.label}</Text>
            <Text style={[styles.typeDesc, { color: theme.textSecondary }]}>{qrType.description}</Text>
          </View>
        </View>

        <View style={styles.form}>
          {qrType.fields.map((field) => renderField(field))}
        </View>

        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: theme.accent }]}
          onPress={handleGenerate}
          activeOpacity={0.85}
        >
          <Text style={styles.generateBtnText}>QR Kodu Oluştur →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeName: { fontSize: 18, fontWeight: '700' },
  typeDesc: { fontSize: 13, marginTop: 2 },
  form: { marginBottom: 10 },
  errorText: { fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 4 },
  pickerWrapper: { marginBottom: 14 },
  pickerLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 2 },
  pickerRow: { flexDirection: 'row', gap: 10 },
  pickerOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  pickerOptionText: { fontSize: 14, fontWeight: '600' },
  generateBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  generateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
