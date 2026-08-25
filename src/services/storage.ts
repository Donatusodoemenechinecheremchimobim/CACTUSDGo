// High-capacity local storage helper leveraging IndexedDB and safe LocalStorage guards
// Prevents QuotaExceededError when storing product catalogs, high-res previews, and logs.

const IDB_NAME = "cactus_bear_db";
const IDB_VERSION = 1;
const IDB_STORE = "keyval";

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });

  return dbPromise;
}

export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Could not set key "${key}":`, err);
  }
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Could not get key "${key}":`, err);
    return null;
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IndexedDB] Could not delete key "${key}":`, err);
  }
}

/**
 * Safely writes to localStorage without ever crashing the application on quota exhaustion.
 * Automatically cleans up non-critical cache and strips large data-URLs if needed.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[safeLocalStorageSet] Quota exceeded for "${key}". Initiating recovery.`);
    
    // 1. Purge non-essential logs and temporary analytics buffers
    try {
      localStorage.removeItem("cactus_bear_autom_logs");
      localStorage.removeItem("cactus_bear_last_checkout_email");
    } catch {}

    // 2. Retry set after basic cleanup
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err2) {
      // 3. If saving products, create a slim lightweight cache (truncate huge base64 strings)
      if (key === "cactus_bear_dynamic_products") {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const slim = parsed.map((item: any) => ({
              ...item,
              // If image is a massive inline base64 string (>20KB), keep placeholder in localStorage
              imageUrl: item.imageUrl && item.imageUrl.startsWith("data:") && item.imageUrl.length > 20000 
                ? "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23111'/></svg>"
                : item.imageUrl,
              images: item.images 
                ? item.images.map((img: string) => img && img.startsWith("data:") && img.length > 20000 
                    ? "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23111'/></svg>"
                    : img)
                : undefined
            }));
            localStorage.setItem(key, JSON.stringify(slim));
            return true;
          }
        } catch {}
      }
      return false;
    }
  }
}

/**
 * Safely reads from localStorage without throwing exceptions.
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
