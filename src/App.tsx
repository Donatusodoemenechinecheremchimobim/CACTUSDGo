import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Layers,
  Lock,
  Mail,
  Check,
  Flame,
  Globe,
  Plus,
  ArrowDown,
  ArrowUp,
  Cpu,
  Menu,
  X,
  Clock,
  Package,
  Search,
  User,
  Home,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Truck,
  ShieldCheck,
  CreditCard
} from "lucide-react";

import { CartItem, ProductCat } from "./types";
import { DROPS_TIMELINE } from "./data";
import GlowCrown from "./components/GlowCrown";
import ProductCard, { ProductCardSkeleton } from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import Lookbook from "./components/Lookbook";
import AboutPage from "./components/AboutPage";
import ProductDetailPage from "./components/ProductDetailPage";
import CollectionPage from "./components/CollectionPage";

import { dbService, authService, UserSession, DropTimerConfig } from "./services/firebase";
import GoogleAuthModal from "./components/GoogleAuthModal";
import AdminWorkspaceModal from "./components/AdminWorkspaceModal";
import OrdersLookupModal from "./components/OrdersLookupModal";
import OrderHistoryModal from "./components/OrderHistoryModal";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCat | "All">("All");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>("");
  
  const [activePage, setActivePage] = useState<"home" | "collection" | "about" | "drop">("home");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "alert"; timestamp: string }[]>([]);

  // Legal & Privacy modal states
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);
  const [privacyTab, setPrivacyTab] = useState<"privacy" | "terms">("privacy");

  const addToast = (message: string, type: "success" | "info" | "alert" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setToasts((prev) => [...prev, { id, message, type, timestamp }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };
  
  
  // Upcoming Drop Countdown states
  const [timerConfig, setTimerConfig] = useState<DropTimerConfig>({
    id: "active-drop-config",
    heading: "NEW LAGOS CAPSULE DROP",
    subheading: "SIGNATURE STREETWEAR CAPSULE",
    targetDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Exclusive contemporary streetwear crafted for everyday style, comfort, and durability in Lagos and beyond.",
    isActivated: true,
    notifyEmails: []
  });
  const [alertFormEmail, setAlertFormEmail] = useState<string>("");
  const [alertSubscribed, setAlertSubscribed] = useState<boolean>(false);
  const [alertError, setAlertError] = useState<string>("");
  const [alertSubmitting, setAlertSubmitting] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Auth, products and Admin Workspace modal states
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
   const [ordersLookupOpen, setOrdersLookupOpen] = useState<boolean>(false);
   const [orderHistoryOpen, setOrderHistoryOpen] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);

  const getCartStorageKey = (uid: string | null) => {
    return uid ? `cactus_bear_cart_${uid}` : "cactus_bear_cart_guest";
  };
  
  const getWishlistStorageKey = (uid: string | null) => {
    return uid ? `cactus_bear_wishlist_${uid}` : "cactus_bear_wishlist_guest";
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isAlready = prev.includes(productId);
      const updated = isAlready ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem(getWishlistStorageKey(currentUser?.uid || null), JSON.stringify(updated));
      
      const prod = productsList.find((p) => p.id === productId);
      const prodName = prod ? prod.name : "Item";
      if (isAlready) {
        addToast(`Removed from wishlist`, "info");
      } else {
        addToast(`Saved to wishlist • ${prodName}`, "success");
      }

      if (currentUser) {
        dbService.saveUserWishlist(currentUser.uid, updated).catch(err => console.error("Wishlist sync failed", err));
      }
      return updated;
    });
  };

  const refreshDynamicProducts = async () => {
    setProductsLoading(true);
    try {
      const pList = await dbService.getProducts();
      setProductsList(pList);
      const tConf = await dbService.getTimerConfig();
      setTimerConfig(tConf);
    } catch (e) {
      console.error("Failed to load products/timer:", e);
    } finally {
      setProductsLoading(false);
    }
  };

  // Time calculation mechanics for live drop countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(timerConfig.targetDate) - +new Date();
      let left = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        left = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return left;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [timerConfig.targetDate]);

  // Load cart, products and auth on startup with real-time database synchronization
  useEffect(() => {
    // Real-time products synchronization across all tabs and devices
    const unsubscribeProducts = dbService.subscribeProducts((pList) => {
      setProductsList(pList);
      setProductsLoading(false);
    });

    dbService.getTimerConfig().then((tConf) => setTimerConfig(tConf)).catch(() => {});
    
    // Subscribe to Firebase Auth (or active simulation config)
    const unsubscribeAuth = authService.subscribe(async (session) => {
      // Hard reset memory states immediately to prevent old user data from flashing or spilling over
      setCart([]);
      setWishlist([]);
      setCurrentUser(session);

      if (session) {
        const userCartKey = `cactus_bear_cart_${session.uid}`;
        const userWishlistKey = `cactus_bear_wishlist_${session.uid}`;

        // Load cart gracefully even if database is offline or slow
        try {
          let dbCart: CartItem[] = [];
          try {
            dbCart = await dbService.loadUserCart(session.uid);
          } catch (err) {
            console.warn("Failed to load user cart from database, using offline cache.", err);
          }
          
          if (dbCart && dbCart.length > 0) {
            setCart(dbCart);
            localStorage.setItem(userCartKey, JSON.stringify(dbCart));
          } else {
            const savedCart = localStorage.getItem(userCartKey);
            if (savedCart) {
              try {
                const parsed = JSON.parse(savedCart);
                if (parsed.length > 0) {
                  setCart(parsed);
                  localStorage.setItem(userCartKey, JSON.stringify(parsed));
                  await dbService.saveUserCart(session.uid, parsed).catch(e => console.warn("Failed to sync cart", e));
                }
              } catch {}
            }
          }
        } catch (err) {
          console.error("Cart loading exception:", err);
        }

        // Load wishlist gracefully even if database is offline or slow
        try {
          let dbWishlist: string[] = [];
          try {
            dbWishlist = await dbService.loadUserWishlist(session.uid);
          } catch (err) {
            console.warn("Failed to load user wishlist from database, using offline cache.", err);
          }

          if (dbWishlist && dbWishlist.length > 0) {
            setWishlist(dbWishlist);
            localStorage.setItem(userWishlistKey, JSON.stringify(dbWishlist));
          } else {
            const savedWishlist = localStorage.getItem(userWishlistKey);
            if (savedWishlist) {
              try {
                const parsed = JSON.parse(savedWishlist);
                if (parsed.length > 0) {
                  setWishlist(parsed);
                  localStorage.setItem(userWishlistKey, JSON.stringify(parsed));
                  await dbService.saveUserWishlist(session.uid, parsed).catch(e => console.warn("Failed to sync wishlist", e));
                }
              } catch {}
            }
          }
        } catch (err) {
          console.error("Wishlist loading exception:", err);
        }
      } else {
        // Guest mode fallback load values - completely isolated
        const savedCart = localStorage.getItem("cactus_bear_cart_guest");
        if (savedCart) {
          try { setCart(JSON.parse(savedCart)); } catch { setCart([]); }
        }
        const savedWishlist = localStorage.getItem("cactus_bear_wishlist_guest");
        if (savedWishlist) {
          try { setWishlist(JSON.parse(savedWishlist)); } catch { setWishlist([]); }
        }
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeAuth();
    };
  }, []);

  // Monitor scroll height and URL hash/search params for seamless page persistence, back/forward history, and direct product links
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Synchronize page and product states with URL hash (#/product/..., #/shop, #/about, #/drop, #privacy, #terms)
    const syncRouteFromUrl = () => {
      const hash = window.location.hash || "";
      const searchParams = new URLSearchParams(window.location.search);
      const queryProductId = searchParams.get("product") || searchParams.get("p") || searchParams.get("id");

      // 1. Check direct product deep-link via search parameter or hash path
      if (queryProductId) {
        setSelectedProductId(queryProductId);
        return;
      }

      if (hash.startsWith("#/product/") || hash.startsWith("#product/")) {
        const prodId = hash.replace(/^#\/?product\//, "").split("?")[0].trim();
        if (prodId) {
          setSelectedProductId(prodId);
          return;
        }
      }

      // 2. Modals (#privacy, #terms)
      const cleanHash = hash.toLowerCase();
      if (cleanHash === "#privacy" || cleanHash === "#privacypolicy") {
        setPrivacyTab("privacy");
        setPrivacyModalOpen(true);
        return;
      } else if (cleanHash === "#terms" || cleanHash === "#termsofservice") {
        setPrivacyTab("terms");
        setPrivacyModalOpen(true);
        return;
      }

      // 3. Top-level page routes (#/collection, #/shop, #/about, #/drop, #/home)
      if (cleanHash.startsWith("#/collection") || cleanHash.startsWith("#/shop") || cleanHash.startsWith("#collection") || cleanHash.startsWith("#shop")) {
        setSelectedProductId(null);
        setActivePage("collection");
      } else if (cleanHash.startsWith("#/about") || cleanHash.startsWith("#/story") || cleanHash.startsWith("#about")) {
        setSelectedProductId(null);
        setActivePage("about");
      } else if (cleanHash.startsWith("#/drop") || cleanHash.startsWith("#/release") || cleanHash.startsWith("#drop")) {
        setSelectedProductId(null);
        setActivePage("drop");
      } else if (cleanHash === "" || cleanHash === "#" || cleanHash.startsWith("#/home") || cleanHash.startsWith("#home")) {
        setSelectedProductId(null);
        setActivePage("home");
      }
    };

    // Initial check on load/refresh
    syncRouteFromUrl();

    // Listen for hash and popstate changes (browser Back/Forward buttons and direct URL navigation)
    window.addEventListener("hashchange", syncRouteFromUrl);
    window.addEventListener("popstate", syncRouteFromUrl);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", syncRouteFromUrl);
      window.removeEventListener("popstate", syncRouteFromUrl);
    };
  }, []);

  // Update browser URL hash when internal view state changes to persist state upon browser refresh
  const navigateToPage = (page: "home" | "collection" | "about" | "drop", scrollToTop: boolean = true) => {
    setSelectedProductId(null);
    setActivePage(page);
    const targetHash = page === "home" ? "" : `#/${page}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, "", targetHash || window.location.pathname);
    }
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    const targetHash = `#/product/${productId}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, "", targetHash);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sync state helpers
  const syncCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem(getCartStorageKey(currentUser?.uid || null), JSON.stringify(updated));
    if (currentUser) {
      dbService.saveUserCart(currentUser.uid, updated).catch((err) =>
        console.error("Cart sync failed", err)
      );
    }
  };

  const handleAddToCart = (item: CartItem) => {
    const existingIdx = cart.findIndex((i) => i.id === item.id);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      syncCart(updated);
    } else {
      syncCart([...cart, item]);
    }
    
    const garName = item.product.name || "Item";
    addToast(`Added to cart • ${garName} (${item.selectedSize})`, "success");

    // Auto-open cart on additions
    setCartOpen(true);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    syncCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    syncCart(updated);
  };

  const handleClearCart = () => {
    syncCart([]);
  };

  // Subscribe to upcoming drops
  const handleAlertSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertFormEmail.trim()) return;
    setAlertSubmitting(true);
    setAlertError("");

    try {
      const isNew = await dbService.subscribeToDrop(alertFormEmail);
      if (isNew) {
        setAlertSubscribed(true);
        setAlertFormEmail("");
        addToast("You're all set! We'll notify you about the next drop.", "success");
        await refreshDynamicProducts();
      } else {
        setAlertError("You are already subscribed to the upcoming release!");
        addToast("You're already subscribed to drop updates.", "info");
      }
    } catch (err) {
      setAlertError("Connection timed out. Please try again.");
      addToast("Could not subscribe. Please try again.", "alert");
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleNavToSection = (sectionId: string) => {
    setSelectedProductId(null);
    setActivePage("home");
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 120);
  };

  // Filter Catalog Presets
  const filteredProducts = useMemo(() => {
    let result = productsList;
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (headerSearchQuery.trim() !== "") {
      const q = headerSearchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [productsList, selectedCategory, headerSearchQuery]);

  const cartItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  // Google Rich Snippets / Structured Data validation for Brand, Organization & Search Bar
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "Cactus Bear Design Labs",
    "image": "https://ais-pre-idoac2ds4ux6jkzbphimca-337745108430.europe-west2.run.app/cb-og-image.jpg",
    "@id": `${window.location.origin}/#store`,
    "url": window.location.origin,
    "telephone": "+2348123456789",
    "priceRange": "₦₦₦",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Agungi Area, Lekki-Epe Expressway",
      "addressLocality": "Lagos",
      "addressRegion": "Lagos State",
      "postalCode": "105102",
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.4311,
      "longitude": 3.4758
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://instagram.com/cactusbear",
      "https://wa.me/2348123456789"
    ]
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cactus Bear",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="w-full bg-black text-white font-sans selection:bg-[#EFFF00] selection:text-black min-h-screen flex flex-col justify-between pt-16 pb-20 md:pt-0 md:pb-0">
      
      {/* Search Engine Optimization structured schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* PERSISTENT HIGH-END STATIONS HEADER */}
      <header className="fixed top-0 inset-x-0 md:sticky z-40 h-16 md:h-auto bg-black/95 border-b border-zinc-900 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center">
        <a
          href="#/home"
          onClick={(e) => {
            e.preventDefault();
            navigateToPage("home");
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-6 rotate-[-15deg] transition-transform group-hover:rotate-[15deg]">
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </div>
          <span className="font-sans font-extrabold text-[#EFFF00] text-sm tracking-[0.2em] uppercase transition-colors">
            CACTUS BEAR
          </span>
        </a>

        {/* Anchor Quick Jump Bridges */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] font-semibold tracking-[0.12em] text-zinc-350">
          <a
            href="#/home"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage("home");
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              activePage === "home" && !selectedProductId ? "text-zinc-100 font-bold" : ""
            }`}
          >
            HOME
          </a>
          <a
            href="#/collection"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage("collection");
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              activePage === "collection" && !selectedProductId ? "text-[#EFFF00] font-bold" : ""
            }`}
          >
            SHOP CATALOG
          </a>
          <a
            href="#/about"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage("about");
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              (activePage === "about") && !selectedProductId ? "text-[#EFFF00] font-bold" : ""
            }`}
          >
            ABOUT US
          </a>
          <a
            href="#/drop"
            onClick={(e) => {
              e.preventDefault();
              navigateToPage("drop");
            }}
            className={`hover:text-[#EFFF00] transition-colors uppercase cursor-pointer ${
              activePage === "drop" && !selectedProductId ? "text-[#EFFF00] font-bold" : ""
            }`}
          >
            UPCOMING DROP
          </a>
          <button 
            onClick={() => setOrdersLookupOpen(true)}
            className="hover:text-[#EFFF00] transition-colors uppercase font-mono text-[11px] font-semibold tracking-[0.12em] text-zinc-350 cursor-pointer text-left"
          >
            TRACK ORDER
          </button>
        </nav>

         {/* Navigation Actions and login buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seek & Search Catalog Bar */}
          <div className="relative flex items-center w-32 sm:w-40 border border-zinc-900 bg-zinc-950 py-1.5 px-2.5 transition-all focus-within:border-[#EFFF00]">
            <Search size={11} className="text-zinc-600 mr-1.5 flex-shrink-0" />
            <input
              type="text"
              value={headerSearchQuery}
              onChange={(e) => {
                setHeaderSearchQuery(e.target.value);
                if (selectedProductId) {
                  setSelectedProductId(null);
                }
              }}
              placeholder="SEARCH CATALOGUE"
              className="w-full bg-transparent font-mono text-[9px] uppercase tracking-[0.1em] text-white placeholder-zinc-700 outline-none"
            />
            {headerSearchQuery && (
              <button
                onClick={() => setHeaderSearchQuery("")}
                className="text-zinc-500 hover:text-white p-0.5 ml-1 flex-shrink-0 cursor-pointer"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {currentUser ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] px-3 py-1.5 transition-all outline-none rounded-none cursor-pointer"
                title="Account ledger and trackers"
              >
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.displayName}`}
                  alt={currentUser.displayName}
                  className="w-5 h-5 rounded-full border border-[#EFFF00]/40 flex-shrink-0 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-mono text-[9px] tracking-wider text-zinc-300 uppercase truncate max-w-[80px]">
                  {currentUser.displayName.split(" ")[0]}
                </span>
                <span className="text-zinc-600 text-[8px]">▼</span>
              </button>

              {/* FLOATING ACTION LEDGER DROPDOWN */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-45 bg-transparent" 
                      onClick={() => setProfileDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 z-50 bg-[#080809] border border-zinc-800 shadow-2xl p-4 font-mono text-[10px]"
                    >
                      <div className="border-b border-zinc-900 pb-2.5 mb-2 px-1">
                        <span className="text-zinc-550 block text-[8px] tracking-wider uppercase">SIGNED IN AS</span>
                        <span className="text-[#EFFF00] block text-[11px] font-sans font-bold uppercase truncate tracking-tight">{currentUser.displayName}</span>
                        <span className="text-zinc-500 block text-[8px] truncate mt-0.5">{currentUser.email}</span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setOrderHistoryOpen(true);
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-zinc-950 hover:text-[#EFFF00] transition-all flex items-center justify-between cursor-pointer text-zinc-300"
                        >
                          <span>ACCOUNT LEDGER</span>
                          <span className="text-zinc-650">➔</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setOrdersLookupOpen(true);
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-zinc-950 hover:text-[#EFFF00] transition-all flex items-center justify-between cursor-pointer text-zinc-300"
                        >
                          <span>ORDER TRACKER</span>
                          <span className="text-zinc-650">➔</span>
                        </button>

                        {currentUser.isAdmin && (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setAdminOpen(true);
                            }}
                            className="w-full text-left py-2 px-2.5 rounded-none bg-[#EFFF00]/5 text-white hover:bg-[#EFFF00] hover:text-black font-black transition-all flex items-center justify-between cursor-pointer"
                          >
                            <span className="text-[#EFFF00] uppercase">ADMIN WORKSPACE</span>
                            <span className="text-zinc-500">❖</span>
                          </button>
                        )}

                        <div className="h-px bg-zinc-900 my-1" />

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            localStorage.removeItem("cactus_bear_cart_guest");
                            localStorage.removeItem("cactus_bear_cart");
                            localStorage.removeItem("cactus_bear_wishlist_guest");
                            localStorage.removeItem("cactus_bear_wishlist");
                            setCart([]);
                            setWishlist([]);
                            authService.signOut();
                            setCurrentUser(null);
                            setAdminOpen(false);
                            addToast("DISCONNECTED DECK", "info");
                          }}
                          className="w-full text-left py-2 px-2.5 rounded-none hover:bg-red-950/20 text-red-400 hover:text-red-300 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span>LOGOUT DECK</span>
                          <span>✖</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden md:flex items-center gap-2 border border-[#EFFF00]/25 bg-black hover:border-[#EFFF00] font-mono text-[9px] tracking-widest px-3 py-1.5 text-white hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
            >
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              LOGIN WITH GMAIL
            </button>
          )}

          {/* Vault cart trigger button - Hidden on mobile as it's persistently on bottom navbar */}
          <button
            onClick={() => setCartOpen(true)}
            className="hidden md:flex items-center gap-1.5 sm:gap-2 border border-zinc-900 bg-zinc-950 hover:border-[#EFFF00] font-mono text-[10px] tracking-widest px-3 sm:px-4 py-2 hover:text-[#EFFF00] transition-all rounded-none cursor-pointer"
          >
            <ShoppingBag size={12} className="text-[#EFFF00]" />
            <span>BAG ({cartItemsCount})</span>
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-x-0 top-16 bottom-[72px] z-30 bg-black/98 border-t border-b border-zinc-900 py-8 px-6 flex flex-col gap-6 md:hidden shadow-2xl backdrop-blur-lg justify-between overflow-y-auto"
          >
            <span className="text-[9px] font-mono text-zinc-500 tracking-[0.3em] uppercase block border-b border-zinc-950 pb-2">
              ✦ NAVIGATE SHOP
            </span>
            <div className="flex flex-col gap-5 font-sans text-base font-black tracking-tight text-zinc-100 uppercase">
              <a
                href="#/home"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigateToPage("home");
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block ${activePage === "home" && !selectedProductId ? "text-[#EFFF00]" : ""}`}
              >
                HOME
              </a>
              <a
                href="#/collection"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigateToPage("collection");
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block ${activePage === "collection" && !selectedProductId ? "text-[#EFFF00]" : ""}`}
              >
                SHOP CATALOG
              </a>
              <a
                href="#/about"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigateToPage("about");
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block cursor-pointer ${
                  activePage === "about" && !selectedProductId ? "text-[#EFFF00]" : ""
                }`}
              >
                ABOUT US
              </a>
              <a
                href="#/drop"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  navigateToPage("drop");
                }}
                className={`hover:text-[#EFFF00] text-left transition-all block cursor-pointer ${
                  activePage === "drop" && !selectedProductId ? "text-[#EFFF00]" : ""
                }`}
              >
                UPCOMING DROP
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOrdersLookupOpen(true);
                }}
                className="hover:text-[#EFFF00] text-left transition-all block font-sans text-base font-black tracking-tight text-zinc-100 uppercase cursor-pointer"
              >
                TRACK ORDER
              </button>
              
              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setOrderHistoryOpen(true);
                  }}
                  className="hover:text-[#EFFF00] text-left transition-all block font-sans text-base font-black tracking-tight text-[#EFFF00] uppercase cursor-pointer"
                >
                  ORDER HISTORY
                </button>
              )}
            </div>

            {/* Mobile Session Actions Shortcut */}
            <div className="mt-2 pt-4 border-t border-zinc-950 flex flex-col gap-3">
              {currentUser ? (
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      className="w-6 h-6 rounded-full border border-[#EFFF00]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                        PATRON
                      </span>
                      <span className="font-sans font-bold text-xs text-white">
                        {currentUser.displayName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setAdminOpen(true);
                        }}
                        className="bg-[#EFFF00] text-black font-mono font-black text-[9px] px-2.5 py-1.5 uppercase tracking-wide cursor-pointer"
                      >
                        ADMIN
                      </button>
                    )}
                    <button
                      onClick={() => {
                        localStorage.removeItem("cactus_bear_cart_guest");
                        localStorage.removeItem("cactus_bear_cart");
                        localStorage.removeItem("cactus_bear_wishlist_guest");
                        localStorage.removeItem("cactus_bear_wishlist");
                        setCart([]);
                        setWishlist([]);
                        authService.signOut();
                        setCurrentUser(null);
                        setAdminOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="text-red-400 hover:text-red-300 font-mono text-[9px] uppercase tracking-wider pl-2.5 border-l border-zinc-900 cursor-pointer"
                    >
                      LOGOUT
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2.5 border border-[#EFFF00]/25 bg-black hover:border-[#EFFF00] py-3 text-center text-[10px] font-mono tracking-widest text-[#EFFF00] uppercase cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  LOGIN WITH GMAIL
                </button>
              )}
            </div>
            
            <div className="pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>CACTUS BEAR DESIGN LABS</span>
              <span className="text-[#EFFF00]">EST. 2026</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 01: HERO LANDING ENVIRONMENT (WORLD-CLASS STREETWEAR PRESENTATION) */}
      <main className="relative z-10 flex-1 flex flex-col">
        {selectedProductId && productsList.some(p => p.id === selectedProductId) ? (
          <ProductDetailPage
            product={productsList.find(p => p.id === selectedProductId)!}
            allProducts={productsList}
            onBack={() => navigateToPage(activePage || "home")}
            onAddToCart={handleAddToCart}
            onSelectProduct={(productId) => navigateToProduct(productId)}
            isWishlisted={wishlist.includes(selectedProductId)}
            onToggleWishlist={() => handleToggleWishlist(selectedProductId)}
            currentUser={currentUser}
            onLoginTrigger={() => setAuthOpen(true)}
          />
        ) : activePage === "collection" ? (
          <CollectionPage
            productsList={productsList}
            onAddToCart={handleAddToCart}
            onSelectProduct={(productId) => navigateToProduct(productId)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onBack={() => navigateToPage("home")}
            searchQuery={headerSearchQuery}
            onSearchQueryChange={setHeaderSearchQuery}
            productsLoading={productsLoading}
          />
        ) : activePage === "about" ? (
          <AboutPage
            onBack={() => navigateToPage("home")}
            onExploreShop={(category) => {
              if (category && category !== "All") {
                setSelectedCategory(category);
              }
              navigateToPage("collection");
            }}
          />
        ) : activePage === "drop" ? (
          <div className="py-20 md:py-28 bg-[#050505]">
            {/* Elegant Stand-alone Header */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="text-[#EFFF00] font-mono text-xs tracking-widest block uppercase font-black mb-1">
                  ✦ NEXT DROP
                </span>
                <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                  UPCOMING <span className="text-[#EFFF00]">DROP</span>
                </h2>
                <p className="text-zinc-500 text-xs mt-1.5 max-w-md font-sans">
                  Count down to the next Cactus Bear Lagos drop. Once the countdown reaches zero, pre-orders go live immediately.
                </p>
              </div>
              <button
                onClick={() => navigateToPage("home")}
                className="font-mono text-[10px] tracking-widest bg-zinc-950 border border-zinc-900 hover:border-[#EFFF00] px-5 py-3 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer w-max"
              >
                [ RETURN HOME ]
              </button>
            </div>

            <div className="border-t border-b border-zinc-900 bg-black/40">
              {/* SECTION 05: INCOMING DROP & COUNTDOWN PORTAL */}
              <section className="w-full py-16 px-4 md:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Configurable Countdown and dynamic release definitions */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      <div>
                        <span className="text-[#EFFF00] font-mono text-xs tracking-widest block font-black uppercase mb-1">
                          ✦ ACTIVE RELEASE TIMER
                        </span>
                        <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                          {timerConfig.heading}
                        </h2>
                        <h3 className="text-xl font-mono text-zinc-400 mt-2 uppercase tracking-wide">
                          {timerConfig.subheading}
                        </h3>
                        <p className="text-zinc-500 text-xs max-w-xl mt-3 leading-relaxed font-sans">
                          {timerConfig.description}
                        </p>
                      </div>

                      {/* Gorgeous Monospace LCD Timer Block */}
                      <div className="grid grid-cols-4 gap-2 xs:gap-3 md:gap-4 max-w-lg mt-4">
                        <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                          <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">DAYS</span>
                          <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                            {String(timeLeft.days).padStart(2, '0')}
                          </span>
                          <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C1</div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                          <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">HOURS</span>
                          <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                            {String(timeLeft.hours).padStart(2, '0')}
                          </span>
                          <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C2</div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                          <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">MINS</span>
                          <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                            {String(timeLeft.minutes).padStart(2, '0')}
                          </span>
                          <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C3</div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                          <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">SECS</span>
                          <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                            {String(timeLeft.seconds).padStart(2, '0')}
                          </span>
                          <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C4</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-600 mt-2">
                        <span className="flex items-center gap-1.5 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-ping" />
                          LIVE COUNTDOWN
                        </span>
                        <span>|</span>
                        <span>RELEASE TIME: {new Date(timerConfig.targetDate).toLocaleDateString()} {new Date(timerConfig.targetDate).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Right Column: Alert Registry Form */}
                    <div className="lg:col-span-5 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between relative min-h-[380px]">
                      <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-700 tracking-widest">
                        NOTIFICATIONS
                      </div>

                      <div>
                        <h3 className="font-sans font-extrabold text-lg uppercase tracking-tight text-white mb-2">
                          RELEASE NOTIFICATION
                        </h3>
                        <p className="text-zinc-500 text-xs font-sans leading-relaxed">
                          Leave your email to receive early access instructions the moment this collection officially drops.
                        </p>
                      </div>

                      {/* Subscribed or Form wrapper with transitions */}
                      <AnimatePresence mode="wait">
                        {!alertSubscribed ? (
                          <motion.form
                            key="alert-signup-form-page"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleAlertSignup}
                            className="flex flex-col gap-4 mt-8"
                          >
                            <div className="flex flex-col gap-1">
                              <label className="font-mono text-[9px] text-zinc-650 uppercase">
                                YOUR EMAIL ADDRESS
                              </label>
                              <input
                                required
                                type="email"
                                value={alertFormEmail}
                                onChange={(e) => setAlertFormEmail(e.target.value)}
                                className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] rounded-none py-3 px-4 font-mono text-xs outline-none text-[#EFFF00] transition-colors"
                                placeholder="your.email@example.com"
                              />
                              {alertError && (
                                <span className="font-mono text-[9px] text-red-400 mt-1 block uppercase font-bold">
                                  ⚠ {alertError}
                                </span>
                              )}
                            </div>

                            <button
                              type="submit"
                              disabled={alertSubmitting}
                              className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-black text-xs py-3.5 tracking-widest transition-colors rounded-none uppercase flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {alertSubmitting ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                  SUBSCRIBING...
                                </>
                              ) : (
                                <>
                                  <Mail size={14} />
                                  NOTIFY ME ON RELEASE
                                </>
                              )}
                            </button>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="alert-unlocked-page"
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 flex flex-col gap-4"
                          >
                            <div className="border border-[#EFFF00] bg-[#121207] p-6 relative overflow-hidden">
                              <span className="font-mono text-[8px] text-[#EFFF00]/50 tracking-wider block mb-2">
                                NEWSLETTER REGISTRATION
                              </span>
                              
                              <div className="flex items-center gap-2 text-white">
                                <span className="bg-[#EFFF00]/10 border border-[#EFFF00]/30 text-[#EFFF00] p-1 ml-0 rounded-none">✓</span>
                                <span className="font-sans font-extrabold text-sm uppercase tracking-tight">VIP PASS SAVED</span>
                              </div>
                              <p className="text-zinc-400 text-[11px] font-sans mt-2 leading-relaxed">
                                Your email was saved in our notification list. You will receive an exclusive early shopping pass the second the countdown timer runs out.
                              </p>

                              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#EFFF00]/20 font-mono text-[8px] text-[#EFFF00]/60">
                                <span>NOTIFICATIONS: ENABLED</span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                                  EMAIL REGISTERED
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setAlertSubscribed(false)}
                              className="w-full bg-transparent border border-zinc-900 hover:border-zinc-800 text-zinc-550 font-mono text-[9px] py-2 uppercase tracking-wide transition-colors cursor-pointer"
                            >
                              [ SUBSCRIBE ANOTHER EMAIL ]
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                    </div>

                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION 01: HERO LANDING ENVIRONMENT (TIGHTENED & PROPORTIONAL) */}
            <section className="relative w-full py-12 sm:py-16 md:py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden border-b border-zinc-950">
          
          {/* Subtle slow spinning logo banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-32 sm:w-44 md:w-52 select-none opacity-90 relative mb-4"
          >
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </motion.div>

          {/* Staggered brand typography block */}
          <div className="flex flex-col items-center max-w-4xl px-4 relative">
            <motion.h1 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-tighter font-black uppercase text-white leading-none selection:bg-white"
            >
              CACTUS <span className="text-[#EFFF00] glow-text-yellow">BEAR</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-400 font-mono text-[11px] sm:text-xs tracking-[0.22em] mb-6 text-[#EFFF00] uppercase mt-3.5"
            >
              PREMIUM STREETWEAR DESIGNED IN NIGERIA
            </motion.p>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-1"
            >
              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setActivePage("collection");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#EFFF00] hover:bg-white text-black font-mono font-black py-3.5 px-6 sm:px-8 text-xs tracking-widest transition-colors rounded-none uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-[#EFFF00]/10"
              >
                EXPLORE COLLECTION '01
                <ChevronRight size={13} />
              </button>

              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setActivePage("about");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-transparent border border-zinc-800 hover:border-[#EFFF00] font-mono hover:text-[#EFFF00] py-3.5 px-6 sm:px-8 text-xs tracking-widest transition-colors rounded-none uppercase cursor-pointer"
              >
                ABOUT THE BRAND
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION 01.5: BRAND VALUE & TRUST HIGHLIGHTS BAR (FILLS EMPTY SPACE WITH HIGH VALUE) */}
        <section className="w-full bg-zinc-950/80 border-b border-zinc-900 py-6 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/50">
              <div className="w-9 h-9 rounded-md bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] shrink-0">
                <Truck size={17} />
              </div>
              <div>
                <h4 className="text-white font-mono text-[11px] font-bold uppercase tracking-wider">NATIONWIDE SHIPPING</h4>
                <p className="text-zinc-400 text-[10px]">1-3d Lagos, 2-5d Nigeria</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/50">
              <div className="w-9 h-9 rounded-md bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] shrink-0">
                <ShieldCheck size={17} />
              </div>
              <div>
                <h4 className="text-white font-mono text-[11px] font-bold uppercase tracking-wider">PREMIUM TEXTILES</h4>
                <p className="text-zinc-400 text-[10px]">High-grade atelier fabrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/50">
              <div className="w-9 h-9 rounded-md bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] shrink-0">
                <Sparkles size={17} />
              </div>
              <div>
                <h4 className="text-white font-mono text-[11px] font-bold uppercase tracking-wider">LIMITED CAPSULES</h4>
                <p className="text-zinc-400 text-[10px]">Authentic small-batch runs</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-lg border border-zinc-850/50">
              <div className="w-9 h-9 rounded-md bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] shrink-0">
                <CreditCard size={17} />
              </div>
              <div>
                <h4 className="text-white font-mono text-[11px] font-bold uppercase tracking-wider">INSTANT PAYMENTS</h4>
                <p className="text-zinc-400 text-[10px]">Flutterwave & Bank Transfer</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: DYNAMIC PRODUCT ARCHIVE (THE CORE STOCK GRID) */}
        <section id="preset-capsule" className="w-full py-12 md:py-16 px-4 md:px-8 border-b border-zinc-950">
          <div className="max-w-7xl mx-auto">
            
            {/* Archive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
              <div>
                <span className="text-[#EFFF00] font-mono text-xs tracking-widest block uppercase font-semibold mb-1">
                  [ NEW ARRIVALS ]
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                  SHOP THE <span className="text-zinc-700">COLLECTION</span>
                </h2>
                <p className="text-zinc-400 text-xs mt-1.5 max-w-md">
                  Explore contemporary luxury streetwear designed and crafted in Lagos.
                </p>
              </div>

              {/* Dynamic Categories Tab filters with horizontal swipe for mobile */}
              <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-2 md:pb-0">
                <div className="flex gap-1.5 p-1 bg-[#050505] border border-zinc-900 rounded-none w-max max-w-full">
                  {(["All", "Outerwear", "Tees", "Tank Tops", "Headwear"] as const).map((cat) => {
                    const isChose = selectedCategory === cat;
                    const count = cat === "All" ? productsList.length : productsList.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 font-mono text-[10px] tracking-widest transition-colors rounded-none whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          isChose
                            ? "bg-white text-black font-bold"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        <span>{cat.toUpperCase()}</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded ${isChose ? "bg-black text-white" : "bg-zinc-900 text-zinc-400"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

             {/* Core Products Grid mapping with dense 2-column layout for mobile */}
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductCardSkeleton key={`skel-home-${idx}`} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onSelect={navigateToProduct}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={() => handleToggleWishlist(prod.id)}
                  />
                ))}
              </div>
            ) : productsList.length === 0 ? (
              <div className="w-full bg-[#050505] border border-zinc-900 py-16 px-4 text-center flex flex-col items-center justify-center gap-4">
                <span className="text-[#EFFF00] font-mono text-[10px] tracking-widest uppercase font-black">
                  [ CATALOG CURRENTLY BEING CURATED ]
                </span>
                <p className="text-zinc-400 font-mono text-xs max-w-md leading-relaxed">
                  The studio is preparing custom pieces for this collection. Check our upcoming drop countdown below or stay tuned for our official release.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={() => navigateToPage("drop")}
                    className="font-mono text-[10px] tracking-widest bg-[#EFFF00] text-black font-black px-5 py-2.5 uppercase hover:bg-white transition-colors cursor-pointer"
                  >
                    [ VIEW UPCOMING DROP ]
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#050505] border border-zinc-900 py-16 px-4 text-center flex flex-col items-center justify-center gap-4">
                <span className="text-[#EFFF00] font-mono text-[10px] tracking-widest uppercase font-black animate-pulse">
                  [ NO PRODUCTS FOUND ]
                </span>
                <p className="text-zinc-500 font-mono text-xs max-w-sm leading-relaxed">
                  No items match "{headerSearchQuery}". Try adjusting your keywords.
                </p>
                <button
                  onClick={() => {
                    setHeaderSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="font-mono text-[10px] tracking-widest bg-zinc-950 border border-zinc-800 hover:border-[#EFFF00] px-4 py-2 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer"
                >
                  [ RESET SEARCH ]
                </button>
              </div>
            )}

          </div>
        </section>

        {/* SECTION 03: CRAFT ARCHIVE & EDITORIAL LOOKBOOK */}
        <Lookbook />

        {/* SECTION 04: INCOMING DROP & COUNTDOWN PORTAL */}
        <section id="unlocked-terminal" className="w-full bg-[#050505] border-t border-zinc-950 py-16 md:py-20 px-4 md:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Configurable Countdown and dynamic release definitions */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <span className="text-[#EFFF00] font-mono text-xs tracking-widest block font-black uppercase mb-1">
                    ✦ NEXT LAGOS DROP
                  </span>
                  <h2 className="text-4xl md:text-5xl font-sans tracking-tighter font-extrabold uppercase text-white">
                    {timerConfig.heading}
                  </h2>
                  <h3 className="text-xl font-mono text-zinc-400 mt-2 uppercase tracking-wide">
                    {timerConfig.subheading}
                  </h3>
                  <p className="text-zinc-500 text-xs max-w-xl mt-3 leading-relaxed font-sans">
                    {timerConfig.description}
                  </p>
                </div>

                {/* Gorgeous Monospace LCD Timer Block */}
                <div className="grid grid-cols-4 gap-2 xs:gap-3 md:gap-4 max-w-lg mt-4">
                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">DAYS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C1</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">HOURS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C2</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">MINS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-white tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C3</div>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 p-2.5 xs:p-3 sm:p-4 font-mono text-center relative overflow-hidden">
                    <span className="text-[8px] xs:text-[9px] text-zinc-650 block uppercase tracking-widest font-bold">SECS</span>
                    <span className="text-2xl xs:text-3xl md:text-4xl font-black text-[#EFFF00] tracking-wider block mt-1.5 xs:mt-2">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <div className="absolute top-1 right-1.5 text-[6px] xs:text-[7px] text-zinc-850">C4</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[9px] text-zinc-600 mt-2">
                  <span className="flex items-center gap-1.5 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-ping" />
                    LIVE COUNTDOWN
                  </span>
                  <span>|</span>
                  <span>RELEASE TIME: {new Date(timerConfig.targetDate).toLocaleDateString()} {new Date(timerConfig.targetDate).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Right Column: Alert Registry Form */}
              <div className="lg:col-span-5 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between relative min-h-[380px]">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-700 tracking-widest">
                  NOTIFICATIONS
                </div>

                <div>
                  <h3 className="font-sans font-extrabold text-lg uppercase tracking-tight text-white mb-2">
                    RELEASE NOTIFICATION
                  </h3>
                  <p className="text-zinc-500 text-xs font-sans leading-relaxed">
                    Leave your email to receive early access instructions the moment this collection officially drops.
                  </p>
                </div>

                {/* Subscribed or Form wrapper with transitions */}
                <AnimatePresence mode="wait">
                  {!alertSubscribed ? (
                    <motion.form
                      key="alert-signup-form"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleAlertSignup}
                      className="flex flex-col gap-4 mt-8"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="font-mono text-[9px] text-zinc-650 uppercase">
                          YOUR EMAIL ADDRESS
                        </label>
                        <input
                          required
                          type="email"
                          value={alertFormEmail}
                          onChange={(e) => setAlertFormEmail(e.target.value)}
                          className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] rounded-none py-3 px-4 font-mono text-xs outline-none text-[#EFFF00] transition-colors"
                          placeholder="your.email@example.com"
                        />
                        {alertError && (
                          <span className="font-mono text-[9px] text-red-400 mt-1 block uppercase font-bold">
                            ⚠ {alertError}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={alertSubmitting}
                        className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-black text-xs py-3.5 tracking-widest transition-colors rounded-none uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {alertSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            SUBSCRIBING...
                          </>
                        ) : (
                          <>
                            <Mail size={14} />
                            NOTIFY ME ON RELEASE
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="alert-unlocked"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-8 flex flex-col gap-4"
                    >
                      <div className="border border-[#EFFF00] bg-[#121207] p-6 relative overflow-hidden">
                        <span className="font-mono text-[8px] text-[#EFFF00]/50 tracking-wider block mb-2">
                          NEWSLETTER REGISTRATION
                        </span>
                        
                        <div className="flex items-center gap-2 text-white">
                          <Check size={14} className="text-[#EFFF00]" />
                          <h4 className="font-mono text-xs font-black uppercase tracking-wider text-[#EFFF00]">
                            YOU'RE ON THE LIST!
                          </h4>
                        </div>
                        <p className="text-zinc-400 text-[11px] font-sans mt-2 leading-relaxed">
                          Your email was saved in our notification list. You will receive an exclusive early shopping pass the second the countdown timer runs out.
                        </p>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#EFFF00]/20 font-mono text-[8px] text-[#EFFF00]/60">
                          <span>NOTIFICATIONS: ENABLED</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
                            EMAIL REGISTERED
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setAlertSubscribed(false)}
                        className="w-full bg-transparent border border-zinc-900 hover:border-zinc-800 text-zinc-550 font-mono text-[9px] py-2 uppercase tracking-wide transition-colors cursor-pointer"
                      >
                        [ SUBSCRIBE ANOTHER EMAIL ]
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>

            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* FOOTER: DESIGN STUDIO FOOTER */}
      <footer className="bg-black text-zinc-650 border-t border-zinc-950 py-16 px-4 md:px-8 relative z-20 font-mono text-[10px] tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Trademark details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-3.5">
                <GlowCrown size="100%" color="#EFFF00" glow={false} />
              </div>
              <span className="font-sans font-black text-white text-sm tracking-wider uppercase">[ CACTUS BEAR ]</span>
            </div>
            <span>CONTEMPORARY NIGERIAN STREETWEAR</span>
            <span>LAGOS & YABA DESIGNS, NIGERIA</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => {
                setSelectedProductId(null);
                setActivePage("about");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-zinc-400 hover:text-[#EFFF00] uppercase cursor-pointer transition-colors"
            >
              ABOUT US
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => {
                setSelectedProductId(null);
                setActivePage("collection");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-zinc-400 hover:text-[#EFFF00] uppercase cursor-pointer transition-colors"
            >
              CATALOG
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => {
                setSelectedProductId(null);
                setActivePage("drop");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-zinc-400 hover:text-[#EFFF00] uppercase cursor-pointer transition-colors"
            >
              UPCOMING DROP
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => {
                setPrivacyTab("privacy");
                setPrivacyModalOpen(true);
              }}
              className="text-zinc-400 hover:text-[#EFFF00] underline uppercase cursor-pointer transition-colors"
            >
              PRIVACY POLICY
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => {
                setPrivacyTab("terms");
                setPrivacyModalOpen(true);
              }}
              className="text-zinc-400 hover:text-[#EFFF00] underline uppercase cursor-pointer transition-colors"
            >
              TERMS
            </button>
          </div>

          <div className="flex flex-col md:items-end gap-1 text-zinc-500">
            <span>Cactus Bear Studio</span>
            <span>Lagos Streetwear & Design Atelier</span>
            <span>© 2026 CACTUS BEAR APPAREL GROUP. ALL RIGHTS RESERVED.</span>
          </div>

        </div>
      </footer>

      {/* SHOPPING CART DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        wishlist={productsList.filter((p) => wishlist.includes(p.id))}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onAddToast={addToast}
        currentUser={currentUser}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* GOOGLE SIGN-IN MODAL */}
      <GoogleAuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={(session) => {
          setCurrentUser(session);
          addToast(`Welcome back, ${session.displayName || "friend"}!`, "success");
        }}
      />

      {/* ORDERS LOOKUP AND LIVE TRACKING PORTAL */}
      <OrdersLookupModal
        isOpen={ordersLookupOpen}
        onClose={() => setOrdersLookupOpen(false)}
        currentUser={currentUser}
      />

      {/* ACCOUNT BOUND ORDER HISTORY LEDGER */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        currentUser={currentUser}
      />

      {/* ADMINISTRATIVE WORKSPACE MODAL */}
      {currentUser?.isAdmin && (
        <AdminWorkspaceModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          onRefreshProducts={refreshDynamicProducts}
        />
      )}

      {/* PRIVACY POLICY & TERMS MODAL */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        defaultTab={privacyTab}
      />

      {/* FLOATING BUBBLE NOTIFICATIONS CONTAINER */}
      <div className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 flex flex-col items-end gap-2.5 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.88, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -25, scale: 0.88, filter: "blur(4px)", transition: { duration: 0.35, ease: "easeOut" } }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="pointer-events-auto bg-zinc-900/95 text-white border border-zinc-700/60 rounded-full py-2.5 px-4 sm:px-5 flex items-center gap-3 shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-xl max-w-[90vw] sm:max-w-md"
            >
              {/* Floating Bubble Icon */}
              {toast.type === "success" && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} />
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-5 h-5 rounded-full bg-[#EFFF00]/20 text-[#EFFF00] flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </div>
              )}
              {toast.type === "alert" && (
                <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle size={13} />
                </div>
              )}

              {/* Message text */}
              <span className="font-sans text-xs text-zinc-100 font-medium leading-tight">
                {toast.message}
              </span>

              {/* Dismiss button */}
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors ml-1 shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE PERSISTENT BOTTOM NAVIGATION WRAPPER (SECURED FIXED POSITION + REFINED LAYOUT STABILITY) */}
      <div className="fixed bottom-0 inset-x-0 z-40 block md:hidden select-none pointer-events-none">
        {/* Backdrop glass panel & Safe Area Bottom spacing with stable padding */}
        <div className="relative w-full bg-zinc-950/95 backdrop-blur-md border-t border-zinc-900 shadow-[0_-10px_35px_rgba(0,0,0,0.95)] pointer-events-auto pb-[calc(11px+env(safe-area-inset-bottom,0px))] pt-3 px-4">
          <nav className="flex justify-around items-center gap-1">
            
            {/* TAB 01: HOME */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateToPage("home");
              }}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
                activePage === "home" && !selectedProductId ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
              }`}
            >
              <Home size={18} className={activePage === "home" && !selectedProductId ? "text-[#EFFF00]" : "text-zinc-550"} />
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider">HOME</span>
            </button>

            {/* TAB 02: CATALOG / SHOP */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateToPage("collection");
              }}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
                activePage === "collection" || selectedProductId ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
              }`}
            >
              <Package size={18} className={activePage === "collection" || selectedProductId ? "text-[#EFFF00]" : "text-zinc-550"} />
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider">CATALOG</span>
            </button>

            {/* TAB 03: ABOUT US */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateToPage("about");
              }}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
                activePage === "about" && !selectedProductId ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
              }`}
            >
              <Sparkles size={18} className={activePage === "about" ? "text-[#EFFF00]" : "text-zinc-550"} />
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider">ABOUT</span>
            </button>

            {/* TAB 04: BAG (CART) */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCartOpen(true);
              }}
              className="flex flex-col items-center gap-1 flex-1 cursor-pointer text-zinc-550 hover:text-white transition-colors relative outline-none"
            >
              <div className="relative">
                <ShoppingBag size={18} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#EFFF00] text-black font-mono text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider">BAG</span>
            </button>

            {/* TAB 05: ACCOUNT DECK PORTAL / MENU */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-colors outline-none ${
                mobileMenuOpen ? "text-[#EFFF00]" : "text-zinc-550 hover:text-white"
              }`}
            >
              {currentUser ? (
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.displayName}`}
                  alt={currentUser.displayName}
                  className={`w-5 h-5 rounded-full border bg-zinc-950 ${
                    mobileMenuOpen ? "border-[#EFFF00]" : "border-zinc-800"
                  } object-cover`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={18} className={mobileMenuOpen ? "text-[#EFFF00]" : "text-zinc-550"} />
              )}
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider">
                {currentUser ? "ACCOUNT" : "MENU"}
              </span>
            </button>

          </nav>
        </div>
      </div>

      {/* RETURNING TO APEX - BACK TO TOP BUTTON WITH HIGHEST BRAND STYLING INTEGRITY */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 md:bottom-24 right-4 md:right-8 z-45 bg-zinc-950/95 hover:bg-[#EFFF00] text-zinc-400 hover:text-black border border-zinc-900 hover:border-[#EFFF00] py-3 px-3.5 sm:px-4 font-mono text-[8px] tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.95)] cursor-pointer flex items-center gap-2 group"
          >
            <ArrowUp size={11} className="text-[#EFFF00] group-hover:text-black transition-colors" />
            <span className="hidden xs:inline">APEX // TOP</span>
            <span className="xs:hidden">TOP</span>
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
