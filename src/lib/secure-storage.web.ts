/**
 * Almacenamiento cifrado en la web.
 * - La clave AES-GCM de 256 bits se crea con Web Crypto como NO EXTRAÍBLE: ni siquiera el código de la
 *   página puede leerla, solo usarla. Se guarda en IndexedDB.
 * - Los datos cifrados se guardan en localStorage. Copiar localStorage no sirve sin la clave.
 */
const DB = 'brasa-keys';
const STORE = 'keys';
const KEY_NAME = 'storage';

function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

async function getKey(): Promise<CryptoKey> {
  const saved = await idb<CryptoKey | undefined>('readonly', (s) => s.get(KEY_NAME));
  if (saved) return saved;
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  await idb('readwrite', (s) => s.put(key, KEY_NAME));
  return key;
}

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function saveEncrypted(name: string, value: unknown): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), data));
  localStorage.setItem(name, `w1.${b64(iv)}.${b64(ct)}`);
}

export async function loadEncrypted<T>(name: string): Promise<T | null> {
  const raw = localStorage.getItem(name);
  if (!raw?.startsWith('w1.')) return null;
  const [, iv, ct] = raw.split('.');
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await getKey(), unb64(ct));
    return JSON.parse(new TextDecoder().decode(pt)) as T;
  } catch {
    return null;
  }
}

export async function wipeEncrypted(name: string): Promise<void> {
  localStorage.removeItem(name);
  await idb('readwrite', (s) => s.delete(KEY_NAME));
}
