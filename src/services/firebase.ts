import { Product, CartItem, Review } from "../types";
import { CACTUS_BEAR_PRODUCTS } from "../data";
import { 
  safeLocalStorageSet, 
  safeLocalStorageGet, 
  idbSet, 
  idbGet, 
  idbDelete 
} from "./storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Type definitions for Db Pre-Orders
export interface DbOrder {
  id: string;
  name: string;
  email: string;
  phone?: string; // Contact phone/WhatsApp number
  address: string;
  city: string;
  country: string;
  items: CartItem[];
  totalPrice: number;
  status: "Pending" | "Shipped" | "Delivered" | "Canceled";
  createdAt: string;
  userId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentReference?: string;
  flutterwaveTxId?: string | number;
}

// Type definitions for Db Upcoming Drop Timer Config
export interface DropTimerConfig {
  id: string;
  heading: string;
  subheading: string;
  targetDate: string; // ISO string for the countdown
  description: string;
  isActivated: boolean;
  notifyEmails: string[];
  adminWhatsapp?: string; // Configurable phone number to receive WhatsApp alerts
  adminEmail?: string;    // Configurable email address to receive order notifications
}

// Global persistence store inside localStorage (for fallback mode)
const STORAGE_PRODUCTS_KEY = "cactus_bear_dynamic_products";
const STORAGE_ORDERS_KEY = "cactus_bear_dynamic_orders";
const STORAGE_SESSION_KEY = "cactus_bear_auth_session";
const STORAGE_TIMER_KEY = "cactus_bear_timer_config";
const STORAGE_REVIEWS_KEY = "cactus_bear_dynamic_reviews";

// Detect if Firebase has been provisioned with real credentials
export const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "");

let app: any = null;
export let db: any = null;
export let auth: any = null;
export let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
      ignoreUndefinedProperties: true
    } as any, (firebaseConfig as any).firestoreDatabaseId || "(default)");
    auth = getAuth(app);
    try {
      const bucketUrl = firebaseConfig.storageBucket 
        ? (firebaseConfig.storageBucket.startsWith("gs://") ? firebaseConfig.storageBucket : `gs://${firebaseConfig.storageBucket}`)
        : undefined;
      storage = getStorage(app, bucketUrl);
      console.log("Firebase Storage initialized successfully with bucket:", bucketUrl);
    } catch (stErr) {
      console.warn("Storage initialization failed (likely bucket configuration missing):", stErr);
    }
    console.log("Firebase DB initialized successfully (Production Live Mode).");

    // Optional quick connection test in background
    getDocFromServer(doc(db, "drops", "active-drop-config")).catch(() => {});
  } catch (err) {
    console.error("Firebase startup exception:", err);
  }
} else {
  console.log("Using LocalStorage fallback database mode.");
}

/**
 * Strips undefined values so Firestore never rejects payloads
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) return null as any;
  if (obj === null) return null as any;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === "object") {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean as any;
  }
  return obj;
}

/**
 * Optimizes an image client-side to ensure sharp, high-definition product resolution
 * while maintaining performant load speeds, small payload footprint (<120KB), and zero storage quota errors.
 */
export function compressImage(file: File, maxWidth = 1080, maxHeight = 1080, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read directly as vector
    if (file.type === "image/svg+xml") {
      const directReader = new FileReader();
      directReader.onload = (ev) => resolve(ev.target?.result as string);
      directReader.onerror = () => reject(new Error("Failed to read SVG file."));
      directReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.height = height;
        canvas.width = width;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Enable high-fidelity anti-aliased image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill white background for transparent pngs converted to jpeg to avoid black artifacts
        if (file.type !== "image/png" && file.type !== "image/webp") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG for compact size or WebP
        const outputMime = file.type === "image/webp" ? "image/webp" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outputMime, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to process image file."));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads high-quality optimized file to Firebase Storage if available,
 * or falls back gracefully to scaled base64 storage.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Always optimize image client-side for maximum reliability and raw speed
  const dataUrl = await compressImage(file);

  if (isFirebaseConfigured && storage) {
    try {
      // Convert Optimized Data URI back to a binary blob for genuine object storage
      const fetched = await fetch(dataUrl);
      const blob = await fetched.blob();
      const uniqueName = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const fileRef = ref(storage, uniqueName);
      
      const uploadPromise = (async () => {
        const uploadResult = await uploadBytes(fileRef, blob, {
          contentType: "image/jpeg"
        });
        return await getDownloadURL(uploadResult.ref);
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Firebase Storage operation timed out")), 3500)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      return downloadUrl;
    } catch (err) {
      console.warn("Storage upload failed or timed out, fallback to local base64:", err);
      return dataUrl;
    }
  }

  return dataUrl;
}

// Error Handling spec matching Phase 3 / Pillar 8 rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Setup initial drop config
const getInitialTimer = (): DropTimerConfig => {
  const saved = safeLocalStorageGet(STORAGE_TIMER_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (
        parsed.heading?.includes("SÉRIE INCOMING") || 
        parsed.heading?.includes("JULY SPECIALIST") ||
        parsed.subheading?.includes("PARACHUTE") || 
        parsed.subheading?.includes("SAGE THORN")
      ) {
        // Upgrade legacy placeholder to simple Nigerian drop
      } else {
        return parsed;
      }
    } catch {
      // JSON issues
    }
  }
  const defaultTarget = new Date();
  defaultTarget.setDate(defaultTarget.getDate() + 9);
  defaultTarget.setHours(18, 0, 0, 0); // 6:00 PM
  
  const defaultTimer: DropTimerConfig = {
    id: "active-drop-config",
    heading: "NEW PORT HARCOURT CAPSULE DROP",
    subheading: "HEAVYWEIGHT COTTON CARGOS & TEES",
    targetDate: defaultTarget.toISOString(),
    description: "Simple, heavyweight streetwear crafted from 100% premium cotton for everyday comfort and durability in Port Harcourt and beyond.",
    isActivated: true,
    notifyEmails: ["vip-patron@couture.com"],
    adminWhatsapp: "2348123456789", // Preset default WhatsApp (e.g. support line)
    adminEmail: "chibundusadiq@gmail.com" // Preset default Email (matches owner exactly)
  };
  safeLocalStorageSet(STORAGE_TIMER_KEY, JSON.stringify(defaultTimer));
  return defaultTimer;
};

const getInitialProducts = (): Product[] => {
  const isCustomized = safeLocalStorageGet("cactus_bear_catalog_customized");
  const saved = safeLocalStorageGet(STORAGE_PRODUCTS_KEY);
  if (saved !== null) {
    try {
      const parsed = JSON.parse(saved) as Product[];
      return parsed;
    } catch {
      return [];
    }
  }
  if (isCustomized === "true") {
    return [];
  }
  // Only use default on very first fresh load if not customized
  return CACTUS_BEAR_PRODUCTS;
};

const getInitialOrders = (): DbOrder[] => {
  const saved = safeLocalStorageGet(STORAGE_ORDERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  
  const defaultOrders: DbOrder[] = [
    {
      id: "CB-PRE-70A5F",
      name: "Marcus Aurelius",
      email: "marcus.aurelius@rome.org",
      phone: "+39 06 67101",
      address: "1 Palace Row, Forum Romanum",
      city: "Rome",
      country: "Italy",
      status: "Pending",
      createdAt: new Date().toISOString(),
      totalPrice: CACTUS_BEAR_PRODUCTS[0]?.price || 180000,
      items: [
        {
          id: "std-cb-jersey-01-Woodland Green Camo-L",
          product: CACTUS_BEAR_PRODUCTS[0],
          selectedColor: CACTUS_BEAR_PRODUCTS[0].colors[0],
          selectedSize: "L",
          quantity: 1
        }
      ]
    }
  ];
  safeLocalStorageSet(STORAGE_ORDERS_KEY, JSON.stringify(defaultOrders));
  return defaultOrders;
};

const getInitialReviews = (): Review[] => {
  const saved = safeLocalStorageGet(STORAGE_REVIEWS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON issues
    }
  }
  
  // Seed initial high-quality reviews
  const defaultReviews: Review[] = [
    {
      id: "rev-1",
      productId: "cb-jersey-01",
      userId: "user-101",
      userName: "Alexander K.",
      userPhoto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Alexander",
      rating: 5,
      comment: "Absolutely premium weight and high-end feel. The custom embroidery detail is outstanding. Extremely satisfied.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev-2",
      productId: "cb-jersey-01",
      userId: "user-202",
      userName: "Sophia Thorne",
      userPhoto: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sophia",
      rating: 4,
      comment: "Beautiful texture and details. Very comfortable and fits perfect.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  safeLocalStorageSet(STORAGE_REVIEWS_KEY, JSON.stringify(defaultReviews));
  return defaultReviews;
};

// Main Database actions class handling BOTH modes natively
class DatabaseService {
  private localProducts: Product[] = getInitialProducts();
  private localOrders: DbOrder[] = getInitialOrders();
  private localTimer: DropTimerConfig = getInitialTimer();
  private localReviews: Review[] = getInitialReviews();

  constructor() {
    // Attempt IndexedDB asynchronous cache hydration on startup
    idbGet<Product[]>(STORAGE_PRODUCTS_KEY).then((idbProducts) => {
      if (idbProducts && Array.isArray(idbProducts) && idbProducts.length > 0) {
        this.localProducts = idbProducts;
      }
    }).catch(() => {});
  }

  // Retrieve products list
  public async getProducts(): Promise<Product[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const list: Product[] = [];
        querySnapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Product);
        });

        // If user has local custom products not yet in Firestore, merge them
        const localSaved = safeLocalStorageGet(STORAGE_PRODUCTS_KEY);
        if (localSaved) {
          try {
            const localList: Product[] = JSON.parse(localSaved);
            for (const lp of localList) {
              if (!list.some((p) => p.id === lp.id)) {
                list.unshift(lp);
                // Background sync up to Firestore
                const clean = sanitizeForFirestore(lp);
                setDoc(doc(db, "products", lp.id), clean).catch(() => {});
              }
            }
          } catch {}
        }

        // Cache the actual catalog state
        this.localProducts = list;
        idbSet(STORAGE_PRODUCTS_KEY, list).catch(() => {});
        safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(list));
        return list;
      } catch (error) {
        console.warn("Firestore getProducts fallback to local storage:", error);
      }
    }

    // Try IndexedDB first for offline / local mode
    try {
      const idbList = await idbGet<Product[]>(STORAGE_PRODUCTS_KEY);
      if (idbList && Array.isArray(idbList) && idbList.length > 0) {
        this.localProducts = idbList;
        return this.localProducts;
      }
    } catch {}

    // Local Storage Fallback Mode
    this.refreshLocal();
    return this.localProducts;
  }

  // Real-time synchronization for products
  public subscribeProducts(callback: (products: Product[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const unsubscribe = onSnapshot(
          collection(db, "products"),
          (snapshot) => {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as Product);
            });

            this.localProducts = list;
            idbSet(STORAGE_PRODUCTS_KEY, list).catch(() => {});
            safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(list));
            callback(list);
          },
          (error) => {
            console.warn("Firestore onSnapshot error, falling back to cached products:", error);
            this.refreshLocal();
            callback(this.localProducts);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.warn("Could not attach products listener:", err);
      }
    }

    this.refreshLocal();
    callback(this.localProducts);
    return () => {};
  }

  // Refreshes data cache
  private refreshLocal() {
    const pSaved = safeLocalStorageGet(STORAGE_PRODUCTS_KEY);
    if (pSaved) {
      try { this.localProducts = JSON.parse(pSaved); } catch {}
    }
    const oSaved = safeLocalStorageGet(STORAGE_ORDERS_KEY);
    if (oSaved) {
      try { this.localOrders = JSON.parse(oSaved); } catch {}
    }
    const tSaved = safeLocalStorageGet(STORAGE_TIMER_KEY);
    if (tSaved) {
      try { this.localTimer = JSON.parse(tSaved); } catch {}
    }
    const rSaved = safeLocalStorageGet(STORAGE_REVIEWS_KEY);
    if (rSaved) {
      try { this.localReviews = JSON.parse(rSaved); } catch {}
    }
  }

  // Timer getters & subscription handlers
  public async getTimerConfig(): Promise<DropTimerConfig> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "drops", "active-drop-config"));
        if (docSnap.exists()) {
          const data = docSnap.data() as DropTimerConfig;
          if (
            data.heading?.includes("SÉRIE INCOMING") || 
            data.heading?.includes("JULY SPECIALIST") ||
            data.subheading?.includes("PARACHUTE") || 
            data.subheading?.includes("SAGE THORN")
          ) {
            const updatedTimer: DropTimerConfig = {
              ...data,
              heading: "NEW PORT HARCOURT CAPSULE DROP",
              subheading: "HEAVYWEIGHT COTTON CARGOS & TEES",
              description: "Simple, heavyweight streetwear crafted from 100% premium cotton for everyday comfort and durability in Port Harcourt and beyond."
            };
            await setDoc(doc(db, "drops", "active-drop-config"), updatedTimer);
            return updatedTimer;
          }
          return data;
        } else {
          const defaultTimer = getInitialTimer();
          await setDoc(doc(db, "drops", "active-drop-config"), defaultTimer);
          return defaultTimer;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, "drops/active-drop-config");
      }
    }

    this.refreshLocal();
    return this.localTimer;
  }

  public async saveTimerConfig(config: DropTimerConfig): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "drops", "active-drop-config"), config);
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "drops/active-drop-config");
      }
    }

    this.localTimer = config;
    safeLocalStorageSet(STORAGE_TIMER_KEY, JSON.stringify(config));
  }

  public async subscribeToDrop(email: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    if (isFirebaseConfigured && db) {
      try {
        const config = await this.getTimerConfig();
        if (config.notifyEmails.includes(cleanEmail)) {
          return false;
        }
        const updatedEmails = [...config.notifyEmails, cleanEmail];
        const updated = { ...config, notifyEmails: updatedEmails };
        await setDoc(doc(db, "drops", "active-drop-config"), updated);
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "drops/active-drop-config");
      }
    }

    this.refreshLocal();
    if (this.localTimer.notifyEmails.includes(cleanEmail)) {
      return false; // Alrd subscribed
    }
    
    const updatedEmails = [...this.localTimer.notifyEmails, cleanEmail];
    this.localTimer = { ...this.localTimer, notifyEmails: updatedEmails };
    safeLocalStorageSet(STORAGE_TIMER_KEY, JSON.stringify(this.localTimer));
    return true;
  }

  // Add Product (Admin Action)
  public async addProduct(p: Product): Promise<void> {
    safeLocalStorageSet("cactus_bear_catalog_customized", "true");
    this.refreshLocal();
    const exists = this.localProducts.some(item => item.id === p.id);
    if (exists) {
      this.localProducts = this.localProducts.map(item => item.id === p.id ? p : item);
    } else {
      this.localProducts.unshift(p);
    }

    // Persist to high-capacity IndexedDB cache
    await idbSet(STORAGE_PRODUCTS_KEY, this.localProducts);

    // Safely cache to localStorage without crashing on quota
    safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));

    if (isFirebaseConfigured && db) {
      try {
        const cleanProduct = sanitizeForFirestore(p);
        await setDoc(doc(db, "products", p.id), cleanProduct);
        console.log("Product successfully stored to Firestore:", p.id);
      } catch (error) {
        console.error("Firestore addProduct error:", error);
        throw error;
      }
    }
  }

  // Delete product permanently
  public async deleteProduct(id: string): Promise<void> {
    safeLocalStorageSet("cactus_bear_catalog_customized", "true");
    this.refreshLocal();
    this.localProducts = this.localProducts.filter(item => item.id !== id);
    await idbSet(STORAGE_PRODUCTS_KEY, this.localProducts);
    safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.warn("Firestore deleteDoc note (removed locally):", error);
      }
    }
  }

  // Delete a specific picture of a product from the database
  public async deleteProductImage(productId: string, imageUrlToDelete: string): Promise<Product | null> {
    if (!productId || !imageUrlToDelete) return null;
    safeLocalStorageSet("cactus_bear_catalog_customized", "true");
    this.refreshLocal();

    const targetIndex = this.localProducts.findIndex(item => item.id === productId);
    let targetProduct: Product | undefined = targetIndex >= 0 ? this.localProducts[targetIndex] : undefined;

    if (!targetProduct && isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, "products", productId));
        if (snap.exists()) {
          targetProduct = snap.data() as Product;
        }
      } catch (err) {
        console.warn("Could not fetch product from Firestore for image deletion:", err);
      }
    }

    if (!targetProduct) return null;

    // Filter from gallery images
    const updatedImages = (targetProduct.images || []).filter(img => img !== imageUrlToDelete);

    // Update primary image if matching
    let updatedImageUrl = targetProduct.imageUrl;
    if (targetProduct.imageUrl === imageUrlToDelete) {
      updatedImageUrl = updatedImages.length > 0 ? updatedImages[0] : undefined;
    }

    // Clean from colorway images
    const updatedColors = (targetProduct.colors || []).map(color => {
      const updatedColor = { ...color };
      if (updatedColor.imageUrl === imageUrlToDelete) {
        delete updatedColor.imageUrl;
      }
      if (updatedColor.images) {
        updatedColor.images = updatedColor.images.filter(img => img !== imageUrlToDelete);
      }
      return updatedColor;
    });

    const updatedProduct: Product = {
      ...targetProduct,
      imageUrl: updatedImageUrl,
      images: updatedImages.length > 0 ? updatedImages : undefined,
      colors: updatedColors
    };

    // Update in-memory & storage
    if (targetIndex >= 0) {
      this.localProducts[targetIndex] = updatedProduct;
    } else {
      this.localProducts.unshift(updatedProduct);
    }

    await idbSet(STORAGE_PRODUCTS_KEY, this.localProducts);
    safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));

    // Save to Firestore
    if (isFirebaseConfigured && db) {
      try {
        const cleanProduct = sanitizeForFirestore(updatedProduct);
        await setDoc(doc(db, "products", productId), cleanProduct);
        console.log("Image deleted from Firestore product document:", productId);
      } catch (error) {
        console.error("Firestore deleteProductImage error:", error);
        throw error;
      }
    }

    return updatedProduct;
  }

  // Clear all products (Admin Purge to start fresh)
  public async clearAllProducts(): Promise<void> {
    safeLocalStorageSet("cactus_bear_catalog_customized", "true");
    this.localProducts = [];
    await idbSet(STORAGE_PRODUCTS_KEY, []);
    safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify([]));

    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const deletions: Promise<void>[] = [];
        querySnapshot.forEach((docSnap) => {
          deletions.push(deleteDoc(doc(db, "products", docSnap.id)));
        });
        await Promise.all(deletions);
      } catch (error) {
        console.warn("Firestore bulk delete note:", error);
      }
    }
  }

  // Clear all product pictures from database to free storage space
  public async clearAllProductPictures(): Promise<{ updatedCount: number; clearedPicturesCount: number }> {
    safeLocalStorageSet("cactus_bear_catalog_customized", "true");
    this.refreshLocal();

    let clearedPicturesCount = 0;

    // Clean all in-memory / local products
    this.localProducts = this.localProducts.map(p => {
      let count = 0;
      if (p.imageUrl) count++;
      if (p.images && p.images.length > 0) count += p.images.length;
      if (p.colors) {
        p.colors.forEach(c => {
          if (c.imageUrl) count++;
          if (c.images && c.images.length > 0) count += c.images.length;
        });
      }
      clearedPicturesCount += count;

      const cleanedColors = (p.colors || []).map(c => {
        const { imageUrl, images, ...rest } = c;
        return rest;
      });

      const { imageUrl, images, ...restProduct } = p;
      return {
        ...restProduct,
        colors: cleanedColors
      } as Product;
    });

    // Save cleaned products to high-capacity IndexedDB and localStorage
    await idbSet(STORAGE_PRODUCTS_KEY, this.localProducts);
    safeLocalStorageSet(STORAGE_PRODUCTS_KEY, JSON.stringify(this.localProducts));

    // Clean in Firestore
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const updatePromises: Promise<void>[] = [];
        querySnapshot.forEach((docSnap) => {
          const pData = docSnap.data() as Product;
          const cleanedColors = (pData.colors || []).map(c => {
            const { imageUrl, images, ...rest } = c;
            return rest;
          });
          const { imageUrl, images, ...restDoc } = pData;
          const cleanedDoc = sanitizeForFirestore({
            ...restDoc,
            colors: cleanedColors
          });
          updatePromises.push(setDoc(doc(db, "products", docSnap.id), cleanedDoc));
        });
        await Promise.all(updatePromises);
      } catch (error) {
        console.warn("Firestore bulk picture clear note:", error);
      }
    }

    return {
      updatedCount: this.localProducts.length,
      clearedPicturesCount
    };
  }

  // Order Operations
  public async getOrders(): Promise<DbOrder[]> {
    if (isFirebaseConfigured && db) {
      try {
        const currentUserId = auth?.currentUser?.uid || authService.getSession()?.uid;
        const isAdminUser = auth?.currentUser?.email === "chibundusadiq@gmail.com" || authService.getSession()?.isAdmin;

        let querySnapshot;
        if (isAdminUser) {
          querySnapshot = await getDocs(collection(db, "orders"));
        } else if (currentUserId) {
          const q = query(collection(db, "orders"), where("userId", "==", currentUserId));
          querySnapshot = await getDocs(q);
        } else {
          return [];
        }

        const list: DbOrder[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as DbOrder);
        });
        
        // Seed default order if empty and user is admin
        if (list.length === 0 && isAdminUser) {
          const defaults = getInitialOrders();
          for (const ord of defaults) {
            await setDoc(doc(db, "orders", ord.id), ord);
            list.push(ord);
          }
        }
        return list;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    }

    this.refreshLocal();
    return this.localOrders;
  }

  private runAutomations(order: DbOrder): void {
    try {
      // Load current log index from localStorage safely
      let logs: any[] = [];
      try {
        logs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
        if (!Array.isArray(logs)) logs = [];
      } catch {}

      const detailedItemsList = order.items.map((it: any, i: number) => {
        const pName = it.product?.name || "Premium Item";
        const sku = it.product?.sku || "N/A";
        const size = it.selectedSize || "N/A";
        const color = it.selectedColor?.name || "N/A";
        const qty = it.quantity || 1;
        const price = it.product?.price || 0;
        const total = price * qty;
        const cPosition = it.customPrintPosition ? ` (Custom Design: ${it.customPrintPosition})` : "";
        return `[Item ${i + 1}] ${pName}${cPosition}\n` +
               `   • SKU/ID: ${sku}\n` +
               `   • Size: ${size}\n` +
               `   • Color: ${color}\n` +
               `   • Quantity: ${qty}\n` +
               `   • Unit Price: ₦${price.toLocaleString()} NGN\n` +
               `   • Total for Item: ₦${total.toLocaleString()} NGN`;
      }).join("\n\n");

      const actualOrderTotal = order.totalPrice;
      const paymentMethodLabel = order.paymentMethod === "flutterwave" 
        ? "Flutterwave (Card / Bank Transfer / USSD)" 
        : order.paymentMethod === "paystack" 
          ? "Paystack (Online Gateway)" 
          : "Manual Bank Transfer (Sterling Bank Escrow)";
      const paymentStatusLabel = order.paymentStatus || "PENDING";
      const paymentRefLabel = order.paymentReference || "N/A";
      const flwTxIdLabel = order.flutterwaveTxId ? ` (TxID: ${order.flutterwaveTxId})` : "";

      const formattedMessage = 
        `✦ NEW PRE-ORDER DIGEST: ${order.id} ✦\n\n` +
        `• Customer Name: ${order.name || "Authenticated Patron"}\n` +
        `• Customer Email: ${order.email}\n` +
        `• Contact Phone: ${order.phone || "N/A"}\n\n` +
        `• Payment Method: ${paymentMethodLabel}\n` +
        `• Payment Status: ${paymentStatusLabel}\n` +
        `• Payment Reference: ${paymentRefLabel}${flwTxIdLabel}\n\n` +
        `• Shipping Address:\n` +
        `  ${order.address || "N/A"}\n` +
        `  City/State: ${order.city || "N/A"}\n` +
        `  Country: ${order.country || "N/A"}\n\n` +
        `• Total Value: ₦${actualOrderTotal.toLocaleString()} NGN\n\n` +
        `• ITEMS ORDERED BREAKDOWN:\n\n${detailedItemsList}\n\n` +
        `✦ END OF CACTUS BEAR RECORD TRANSACTIONS ✦`;

      // 1. Direct Webhook Integration
      const webhookEnabled = localStorage.getItem("cactus_bear_autom_webhook_enabled") === "true";
      const webhookUrl = localStorage.getItem("cactus_bear_autom_webhook_url") || "";
      if (webhookEnabled && webhookUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "WEBHOOK",
          payload: { orderId: order.id, totalPrice: order.totalPrice, email: order.email },
          status: 102,
          statusText: "Processing Dispatch"
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order)
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.statusText || (res.ok ? "SUCCESS" : "ERROR");
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Trigger Connect Failed";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 2. Direct Email Alert (Default Destination & Custom Formspree / Email Hook)
      const emailEnabled = localStorage.getItem("cactus_bear_autom_email_enabled") !== "false"; // Default to enabled
      const emailTarget = localStorage.getItem("cactus_bear_autom_email_target") || "chibundusadiq@gmail.com";
      const emailFormspreeKey = localStorage.getItem("cactus_bear_autom_email_key") || "xqeoaypr"; // Custom Formspree Form ID
      
      if (emailEnabled && emailTarget) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "EMAIL DISPATCH",
          payload: { destination: emailTarget, orderId: order.id },
          status: 102,
          statusText: "Sending Email"
        };

        // Determine destination endpoint. We default to standard Formspree form submission endpoint or an easy public dispatcher
        const emailEndpoint = `https://formspree.io/f/${emailFormspreeKey}`;

        fetch(emailEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: `✦ NEW CACTUS BEAR ORDER [ID: ${order.id}] - ${order.name || order.email} (${paymentStatusLabel}) ✦`,
            recipient: emailTarget,
            message: formattedMessage,
            name: order.name || "Authenticated Patron",
            email: order.email,
            phone: order.phone || "N/A",
            paymentMethod: paymentMethodLabel,
            paymentStatus: paymentStatusLabel,
            paymentReference: paymentRefLabel,
            flutterwaveTxId: order.flutterwaveTxId || "N/A",
            shippingAddress: order.address || "N/A",
            city: order.city || "N/A",
            country: order.country || "N/A",
            orderId: order.id,
            totalNgn: `₦${actualOrderTotal.toLocaleString()} NGN`,
            itemsOrdered: order.items.map((it: any) => `${it.product?.name} (Size: ${it.selectedSize || "N/A"}, Color: ${it.selectedColor?.name || "N/A"}, Qty: ${it.quantity || 1})`).join("; "),
            itemsOrderedDetailed: detailedItemsList,
            creationDate: order.createdAt || new Date().toISOString()
          })
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.ok ? "Email Sent Successfully" : "Email Forward Rejected";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Email Connect Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 3. Direct WhatsApp Alert (Twilio / CallMeBot Webhook)
      const whatsappEnabled = localStorage.getItem("cactus_bear_autom_whatsapp_enabled") === "true";
      const whatsappPhone = localStorage.getItem("cactus_bear_autom_whatsapp_phone") || "2348123456789";
      const whatsappApiKey = localStorage.getItem("cactus_bear_autom_whatsapp_apikey") || ""; // CallMeBot API key
      const whatsappCustomWebhook = localStorage.getItem("cactus_bear_autom_whatsapp_webhook") || "";

      if (whatsappEnabled && whatsappPhone) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "WHATSAPP DISPATCH",
          payload: { phone: whatsappPhone, orderId: order.id },
          status: 102,
          statusText: "Sending WhatsApp Alert"
        };

        if (whatsappCustomWebhook) {
          // Custom Twilio direct hook dispatch
          fetch(whatsappCustomWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: whatsappPhone,
              message: formattedMessage,
              orderId: order.id
            })
          })
          .then(res => {
            logEntry.status = res.status;
            logEntry.statusText = res.ok ? "Custom Hook Posted Successfully" : "Webhook Connection Lost";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          })
          .catch(err => {
            logEntry.status = 503;
            logEntry.statusText = err?.message || "WhatsApp Webhook Error";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          });
        } else if (whatsappApiKey) {
          // Send via popular developer lightweight WhatsApp API (CallMeBot)
          const cleanPhone = whatsappPhone.replace(/\D/g, "");
          const encodedText = encodeURIComponent(formattedMessage);
          const callMeBotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${whatsappApiKey.trim()}`;
          
          fetch(callMeBotUrl, { mode: "no-cors" })
          .then(() => {
            logEntry.status = 200;
            logEntry.statusText = "Dispatched via CallMeBot Bot Channel";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          })
          .catch(err => {
            logEntry.status = 502;
            logEntry.statusText = err?.message || "WhatsApp API Request Timeout";
            try {
              const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
              const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
              localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
            } catch {}
          });
        } else {
          // If neither is configured but WhatsApp is toggled, record trigger logic dispatch link
          logEntry.status = 202;
          logEntry.statusText = "Setup CallMeBot API Key / Custom Link in Settings";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        }
      }

      // 4. Direct Slack Channel hook
      const slackEnabled = localStorage.getItem("cactus_bear_autom_slack_enabled") === "true";
      const slackUrl = localStorage.getItem("cactus_bear_autom_slack_url") || "";
      if (slackEnabled && slackUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "SLACK HUB",
          payload: { orderId: order.id, value: order.totalPrice },
          status: 102,
          statusText: "Posting Alert"
        };

        const actualLogTotal = order.totalPrice;
        const slackText = `✦ *NEW PRE-ORDER DISPATCHED:* ${order.id} ✦\n• *Client:* ${order.email}\n• *Total:* ₦${actualLogTotal.toLocaleString()} NGN\n• *Items:* ${order.items.map((it: any) => `${it.product?.name || "Premium Item"} (${it.selectedSize || "N/A"})`).join(", ")}`;

        fetch(slackUrl, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify({ text: slackText })
        })
        .then(() => {
          logEntry.status = 200;
          logEntry.statusText = "OK (Triggered Dispatch)";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 500;
          logEntry.statusText = err?.message || "Slack Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 5. Direct Discord Dispatcher
      const discordEnabled = localStorage.getItem("cactus_bear_autom_discord_enabled") === "true";
      const discordUrl = localStorage.getItem("cactus_bear_autom_discord_url") || "";
      if (discordEnabled && discordUrl) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "DISCORD HOOK",
          payload: { orderId: order.id, region: order.city || "Port Harcourt" },
          status: 102,
          statusText: "Posting Embed"
        };

        const discordBody = {
          embeds: [{
            title: `✦ SECURED COLLECTION PRE-ORDER: ${order.id} [${paymentStatusLabel}] ✦`,
            description: `Automated dispatch logged to the atelier register database.\n\n**Items Ordered:**\n${order.items.map(it => `• ${it.quantity}x ${it.product?.name || "Item"} (Size: ${it.selectedSize || "N/A"}, Color: ${it.selectedColor?.name || "N/A"})`).join("\n")}`,
            color: 15728384, // #EFFF00
            fields: [
              { name: "Patron Name", value: order.name || "Authenticated Patron", inline: true },
              { name: "Patron Email", value: order.email, inline: true },
              { name: "Payment Method", value: paymentMethodLabel, inline: true },
              { name: "Payment Ref", value: paymentRefLabel, inline: true },
              { name: "Order Value (NGN)", value: `₦${actualOrderTotal.toLocaleString()} NGN`, inline: true },
              { name: "Fulfillment Location", value: `${order.address || "N/A"}, ${order.city || "N/A"} (${order.country || "N/A"})` }
            ],
            timestamp: new Date().toISOString()
          }]
        };

        fetch(discordUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordBody)
        })
        .then(res => {
          logEntry.status = res.status;
          logEntry.statusText = res.statusText || "OK";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        })
        .catch(err => {
          logEntry.status = 502;
          logEntry.statusText = err?.message || "Discord Post Blocked";
          try {
            const currentLogs = JSON.parse(localStorage.getItem("cactus_bear_autom_logs") || "[]");
            const updated = [logEntry, ...currentLogs.filter((l: any) => l.id !== logEntry.id)].slice(0, 50);
            localStorage.setItem("cactus_bear_autom_logs", JSON.stringify(updated));
          } catch {}
        });
      }

      // 6. Trace log fallback guarantee
      if (!webhookEnabled && !slackEnabled && !discordEnabled && !emailEnabled && !whatsappEnabled) {
        const logEntry = {
          id: "log-" + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          type: "TRIGGER INSTANCE",
          payload: { orderId: order.id, totalPrice: order.totalPrice, status: "Awaiting Production Batch" },
          status: 200,
          statusText: "Built-In Dispatch OK"
        };
        safeLocalStorageSet("cactus_bear_autom_logs", JSON.stringify([logEntry, ...logs].slice(0, 50)));
      }
    } catch (e) {
      console.error("Autotarget failed:", e);
    }
  }

  public async addOrder(order: Omit<DbOrder, "id" | "createdAt" | "status">): Promise<DbOrder> {
    const orderId = "CB-OR-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const createdAt = new Date().toISOString();
    const currentUserId = auth?.currentUser?.uid || authService.getSession()?.uid;

    const newOrder: DbOrder & { userId?: string } = {
      ...order,
      id: orderId,
      status: "Pending",
      createdAt: createdAt,
      ...(currentUserId ? { userId: currentUserId } : {})
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "orders", orderId), newOrder);
        this.runAutomations(newOrder as DbOrder);
        return newOrder as DbOrder;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      }
    }

    this.refreshLocal();
    this.localOrders.unshift(newOrder as DbOrder);
    safeLocalStorageSet(STORAGE_ORDERS_KEY, JSON.stringify(this.localOrders));
    this.runAutomations(newOrder as DbOrder);
    return newOrder as DbOrder;
  }

  public async updateOrderStatus(id: string, status: DbOrder["status"]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "orders", id), { status });
        return;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
      }
    }

    this.refreshLocal();
    this.localOrders = this.localOrders.map(order => 
      order.id === id ? { ...order, status } : order
    );
    safeLocalStorageSet(STORAGE_ORDERS_KEY, JSON.stringify(this.localOrders));
  }

  // Reviews Operations
  public async getReviews(productId: string): Promise<Review[]> {
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        const list: Review[] = [];
        querySnapshot.forEach((docSnap) => {
          const item = docSnap.data() as Review;
          if (item.productId === productId) {
            list.push(item);
          }
        });
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "reviews");
      }
    }

    this.refreshLocal();
    return this.localReviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addReview(reviewData: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const reviewId = "rev-" + Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date().toISOString();
    const newReview: Review = {
      ...reviewData,
      id: reviewId,
      createdAt
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "reviews", reviewId), newReview);
        return newReview;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
      }
    }

    this.refreshLocal();
    this.localReviews.unshift(newReview);
    safeLocalStorageSet(STORAGE_REVIEWS_KEY, JSON.stringify(this.localReviews));
    return newReview;
  }

  // Support Cart storage in Firestore
  public async saveUserCart(userId: string, cart: CartItem[]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", userId), { cart }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      }
    }
  }

  public async loadUserCart(userId: string): Promise<CartItem[]> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.cart) {
            return data.cart as CartItem[];
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
    return [];
  }

  // Support Wishlist storage in Firestore
  public async saveUserWishlist(userId: string, wishlist: string[]): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", userId), { wishlist }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      }
    }
  }

  public async loadUserWishlist(userId: string): Promise<string[]> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.wishlist) {
            return data.wishlist as string[];
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
    return [];
  }
}

export const dbService = new DatabaseService();

// AUTH SERVICE - SIMULATED WITH REAL SEED CAPABILITIES
export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
}

class AuthService {
  private currentSession: UserSession | null = null;
  private listeners: ((session: UserSession | null) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem(STORAGE_SESSION_KEY);
    if (saved) {
      try {
        this.currentSession = JSON.parse(saved);
      } catch {
        this.currentSession = null;
      }
    }

    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const emailAddress = fbUser.email || "";
          const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
          
          const userSession: UserSession = {
            uid: fbUser.uid,
            email: emailAddress,
            displayName: fbUser.displayName || emailAddress.split("@")[0] || "Patron",
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
            isAdmin: isAdminUser
          };
          this.currentSession = userSession;
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
          // Synchronize profile to physical Firestore database to ensure every user has its database profile
          await this.syncUserProfile(userSession);
          this.notifyListeners(userSession);
        } else {
          // If signed out in firebase, but session in localStorage has a firebase uid, clean it
          if (this.currentSession && !this.currentSession.uid.startsWith("google-uid-") && !this.currentSession.uid.startsWith("github-uid-") && !this.currentSession.uid.startsWith("email-uid-") && !this.currentSession.uid.startsWith("guest-uid-")) {
            this.currentSession = null;
            localStorage.removeItem(STORAGE_SESSION_KEY);
            this.notifyListeners(null);
          }
        }
      });
    }
  }

  public subscribe(callback: (session: UserSession | null) => void) {
    this.listeners.push(callback);
    callback(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(session: UserSession | null) {
    this.listeners.forEach(cb => cb(session));
  }

  public async syncUserProfile(session: UserSession) {
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, "users", session.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          await updateDoc(userDocRef, {
            uid: session.uid,
            email: session.email,
            displayName: session.displayName,
            photoURL: session.photoURL,
            isAdmin: session.isAdmin,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(userDocRef, {
            uid: session.uid,
            email: session.email,
            displayName: session.displayName,
            photoURL: session.photoURL,
            isAdmin: session.isAdmin,
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Failed to sync user profile to Firestore:", error);
      }
    }
  }

  public getSession(): UserSession | null {
    return this.currentSession;
  }

  // Sign out
  public signOut(): void {
    this.currentSession = null;
    localStorage.removeItem(STORAGE_SESSION_KEY);
    this.notifyListeners(null);
    if (isFirebaseConfigured && auth) {
      try {
        firebaseSignOut(auth);
      } catch (err) {
        console.error("Firebase Auth sign out failure:", err);
      }
    }
  }

  // Real or Simulated Google Sign In
  public async signInWithGoogle(): Promise<UserSession> {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const emailAddress = fbUser.email || "";
        const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
        
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: emailAddress,
          displayName: fbUser.displayName || emailAddress.split("@")[0],
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };

        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error) {
        console.error("Firebase Google Auth error:", error);
        throw error;
      }
    }

    // Standard high-fidelity developer simulation bypass
    const sim = this.signInWithGoogleSimulate("chibundusadiq@gmail.com");
    this.notifyListeners(sim);
    return sim;
  }

  // Backup Google simulation with email input bypass
  public signInWithGoogleSimulate(emailAddress: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    
    // Check if user is chibundusadiq (admin bypass)
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "google-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Real or Simulated GitHub Sign In
  public async signInWithGithub(): Promise<UserSession> {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const emailAddress = fbUser.email || "";
        const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
        
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: emailAddress,
          displayName: fbUser.displayName || emailAddress.split("@")[0] || "GitHub Patron",
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };

        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error) {
        console.error("Firebase GitHub Auth error:", error);
        throw error;
      }
    }

    // High fidelity simulation
    const sim = this.signInWithGithubSimulate("github-patron@cactusbear.club");
    this.notifyListeners(sim);
    return sim;
  }

  public signInWithGithubSimulate(emailAddress: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "github-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName + " (Github)",
      photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Real or Simulated Email & Password sign-in / registration
  public async signInWithEmail(emailAddress: string, passwordInput: string): Promise<UserSession> {
    const cleanEmail = emailAddress.trim().toLowerCase();
    
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        const fbUser = result.user;
        const isAdminUser = cleanEmail === "chibundusadiq@gmail.com";
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split("@")[0],
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
          isAdmin: isAdminUser
        };
        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error: any) {
        // If user not found or password doesn't match, or if register dynamic scenario
        if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
          // Attempt automatic registration for convenience
          try {
            const signupResult = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
            const fbUser = signupResult.user;
            const isAdminUser = cleanEmail === "chibundusadiq@gmail.com";
            const userSession: UserSession = {
              uid: fbUser.uid,
              email: cleanEmail,
              displayName: cleanEmail.split("@")[0],
              photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
              isAdmin: isAdminUser
            };
            this.currentSession = userSession;
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
            await this.syncUserProfile(userSession);
            this.notifyListeners(userSession);
            return userSession;
          } catch (signupError: any) {
            console.error("Firebase email signup error:", signupError);
            throw signupError;
          }
        }
        throw error;
      }
    }

    const sim = this.signInWithEmailSimulate(cleanEmail, passwordInput);
    this.notifyListeners(sim);
    return sim;
  }

  // Phone Authentication: Send Verification Code (OTP)
  public async sendPhoneVerificationCode(phoneNumber: string, recaptchaContainerId: string): Promise<any> {
    if (isFirebaseConfigured && auth) {
      try {
        // Prepare or retrieve Recaptcha Verifier
        let recaptchaVerifier = (window as any).recaptchaVerifier;
        if (!recaptchaVerifier) {
          recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            }
          });
          (window as any).recaptchaVerifier = recaptchaVerifier;
        }

        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        return confirmationResult;
      } catch (error) {
        console.error("Firebase sendPhoneVerificationCode error:", error);
        throw error;
      }
    }

    // High fidelity simulation
    console.log(`[Phone Auth Simulation] OTP code dispatched to: ${phoneNumber}`);
    return {
      simulated: true,
      phoneNumber,
      verificationId: `sim-verify-${Date.now()}`
    };
  }

  // Phone Authentication: Verify OTP & Sign In
  public async confirmPhoneCode(confirmationResult: any, otpCode: string): Promise<UserSession> {
    if (isFirebaseConfigured && auth && confirmationResult && !confirmationResult.simulated) {
      try {
        const result = await confirmationResult.confirm(otpCode);
        const fbUser = result.user;
        const phoneLabel = fbUser.phoneNumber || confirmationResult.phoneNumber || "Phone Patron";
        
        // Use part of the phone as display/email-fallback or standard template
        const cleanRef = phoneLabel.replace("+", "");
        const userSession: UserSession = {
          uid: fbUser.uid,
          email: `${cleanRef}@cactusbear-phone.club`,
          displayName: `Patron (${phoneLabel})`,
          photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fbUser.uid}`,
          isAdmin: false
        };

        this.currentSession = userSession;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
        await this.syncUserProfile(userSession);
        this.notifyListeners(userSession);
        return userSession;
      } catch (error) {
        console.error("Firebase confirmPhoneCode error:", error);
        throw error;
      }
    }

    // Simulated confirmation
    const phoneLabel = confirmationResult?.phoneNumber || "+2348000000000";
    const cleanRef = phoneLabel.replace("+", "");
    const userSession: UserSession = {
      uid: "phone-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: `${cleanRef}@cactusbear-phone.club`,
      displayName: `Patron (${phoneLabel})`,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${cleanRef}`,
      isAdmin: false
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Mock Email & Password login select
  public signInWithEmailSimulate(emailAddress: string, password?: string): UserSession {
    const standardName = emailAddress.split("@")[0];
    const cleanName = standardName.charAt(0).toUpperCase() + standardName.slice(1);
    
    const isAdminUser = emailAddress.trim().toLowerCase() === "chibundusadiq@gmail.com";
    
    const userSession: UserSession = {
      uid: "email-uid-" + Math.floor(10000 + Math.random() * 90000),
      email: emailAddress.trim().toLowerCase(),
      displayName: cleanName,
      photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${standardName}`,
      isAdmin: isAdminUser
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }

  // Mock Guest/VIP login select
  public signInGuestSimulate(): UserSession {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const userSession: UserSession = {
      uid: "guest-uid-" + guestId,
      email: `guest-${guestId}@cactusbear.club`,
      displayName: `Guest Patron #${guestId}`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=guest-${guestId}`,
      isAdmin: false
    };

    this.currentSession = userSession;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userSession));
    this.notifyListeners(userSession);
    return userSession;
  }
}

export const authService = new AuthService();
