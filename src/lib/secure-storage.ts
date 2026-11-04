/**
 * Almacenamiento cifrado en el móvil (iOS y Android).
 * - La clave (256 bits, aleatoria) vive en el llavero del sistema: Keychain en iOS y Keystore en Android.
 * - Los datos se cifran con XSalsa20-Poly1305 (tweetnacl secretbox) y se guardan en AsyncStorage.
 * Si alguien copia los archivos de la app sin la clave del llavero, no puede leer nada.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';

nacl.setPRNG((x, n) => x.set(Crypto.getRandomBytes(n)));

const KEY_NAME = 'brasa-storage-key';

async function getKey(): Promise<Uint8Array> {
  const saved = await SecureStore.getItemAsync(KEY_NAME);
  if (saved) return decodeBase64(saved);
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  await SecureStore.setItemAsync(KEY_NAME, encodeBase64(key), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  return key;
}

export async function saveEncrypted(name: string, value: unknown): Promise<void> {
  const key = await getKey();
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const box = nacl.secretbox(decodeUTF8(JSON.stringify(value)), nonce, key);
  await AsyncStorage.setItem(name, `v1.${encodeBase64(nonce)}.${encodeBase64(box)}`);
}

export async function loadEncrypted<T>(name: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(name);
  if (!raw?.startsWith('v1.')) return null;
  const [, n, b] = raw.split('.');
  const opened = nacl.secretbox.open(decodeBase64(b), decodeBase64(n), await getKey());
  return opened ? (JSON.parse(encodeUTF8(opened)) as T) : null;
}

export async function wipeEncrypted(name: string): Promise<void> {
  await AsyncStorage.removeItem(name);
  await SecureStore.deleteItemAsync(KEY_NAME);
}
