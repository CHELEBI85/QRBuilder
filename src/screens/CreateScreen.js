import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import InputField from '../components/InputField';
import QRIcon from '../components/QRIcon';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import AppText from '../components/AppText';
import AppCard from '../components/AppCard';
import { formatQRData } from '../utils/qrFormatter';
import { validateQRForm } from '../utils/validators';

export default function CreateScreen({ route, navigation }) {
  const { qrType } = route.params;
  const { theme } = useTheme();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData({});
    setErrors({});
  }, [qrType.id]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleGenerate = () => {
    const validationError = validateQRForm(qrType.id, formData);
    if (validationError) {
      setErrors({ [validationError.field]: validationError.message });
      return;
    }
    setErrors({});
    const qrValue = formatQRData(qrType.id, formData);
    navigation.navigate('Preview', { qrType, formData, qrValue });
  };

  const resolveAutoCapitalize = (field) => {
    if (field.autoCapitalize != null) return field.autoCapitalize;
    return field.multiline ? 'sentences' : 'none';
  };

  const resolveReturnKeyType = (field, index) => {
    if (field.returnKeyType != null) return field.returnKeyType;
    const isLast = index === qrType.fields.length - 1;
    return isLast ? 'done' : 'next';
  };

  const renderField = (field, index) => {
    if (field.type === 'picker') {
      const current = formData[field.key] || field.defaultValue || field.options[0];
      return (
        <View key={field.key} style={{ marginBottom: theme.spacing.lg }}>
          <View style={[styles.pickerLabelRow, { marginBottom: theme.spacing.xs }]}>
            <AppText variant="subbody" tone="secondary" style={styles.pickerLabelFlex}>
              {field.label}
            </AppText>
          </View>
          <View style={[styles.pickerRow, { gap: theme.spacing.sm }]}>
            {field.options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: current === opt ? theme.primary : theme.inputBackground,
                    borderColor: current === opt ? theme.primary : theme.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}
                onPress={() => updateField(field.key, opt)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: current === opt }}
                accessibilityLabel={`${field.label}: ${opt}`}
              >
                <AppText
                  variant="subbody"
                  tone={current === opt ? 'onPrimary' : 'primary'}
                  style={styles.pickerOptionText}
                >
                  {opt}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
          {field.helperText ? (
            <AppText variant="caption" tone="tertiary" style={styles.pickerHelper}>
              {field.helperText}
            </AppText>
          ) : null}
        </View>
      );
    }

    const returnKeyType = resolveReturnKeyType(field, index);

    return (
      <View key={field.key} style={{ marginBottom: theme.spacing.md }}>
        <InputField
          label={field.label}
          value={formData[field.key] || ''}
          onChangeText={(v) => updateField(field.key, v)}
          placeholder={field.placeholder}
          keyboardType={field.keyboardType}
          secureTextEntry={field.secureTextEntry}
          multiline={field.multiline}
          autoCapitalize={resolveAutoCapitalize(field)}
          autoCorrect={field.autoCorrect}
          autoComplete={field.autoComplete}
          textContentType={field.textContentType}
          returnKeyType={returnKeyType}
          blurOnSubmit={!field.multiline}
          helperText={field.helperText}
          error={errors[field.key] || undefined}
          required={field.required === true}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScreenContainer
        scroll
        edges={['bottom', 'left', 'right']}
        contentContainerStyle={{
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.huge,
        }}
      >
        <SectionHeader
          title={qrType.label}
          subtitle={qrType.description}
          style={{ paddingTop: theme.spacing.sm }}
        />

        <AppCard padding="lg" style={[styles.heroIconCard, { marginBottom: theme.spacing.lg }]}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.primarySoft,
                borderRadius: theme.radius.lg,
              },
            ]}
          >
            <QRIcon icon={qrType.icon} size={36} />
          </View>
        </AppCard>

        <AppCard padding="lg" style={{ marginBottom: theme.spacing.lg }}>
          <AppText variant="sectionLabel" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
            BİLGİLER
          </AppText>
          {qrType.fields.map((field, index) => renderField(field, index))}
        </AppCard>

        <TouchableOpacity
          style={[
            styles.generateBtn,
            {
              backgroundColor: theme.primary,
              borderRadius: theme.radius.sm + 2,
              paddingVertical: theme.spacing.md,
              marginHorizontal: theme.spacing.xs,
            },
          ]}
          onPress={handleGenerate}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="QR kodu oluştur ve önizlemeye git"
        >
          <AppText variant="button" tone="onPrimary" style={styles.generateBtnText}>
            QR kodu oluştur →
          </AppText>
        </TouchableOpacity>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroIconCard: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pickerLabelFlex: {
    flexShrink: 1,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerHelper: {
    marginTop: 8,
    marginLeft: 4,
  },
  generateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  generateBtnText: {
    textAlign: 'center',
  },
});
