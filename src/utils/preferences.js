import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@qrbuilder_prefs';

const DEFAULT_PREFS = {
  defaultFgColor: '#000000',
  defaultBgColor: '#FFFFFF',
  defaultQrSize: 220,
};

export async function getPreferences() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function savePreferences(prefs) {
  try {
    const current = await getPreferences();
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {}
}
