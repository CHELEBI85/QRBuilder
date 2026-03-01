import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@qrbuilder_history';

export async function saveQRToHistory(entry) {
  try {
    const existing = await getHistory();
    const updated = [{ ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...existing];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('saveQRToHistory error:', e);
    return [];
  }
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('getHistory error:', e);
    return [];
  }
}

export async function deleteQRFromHistory(id) {
  try {
    const existing = await getHistory();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('deleteQRFromHistory error:', e);
    return [];
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('clearHistory error:', e);
  }
}
