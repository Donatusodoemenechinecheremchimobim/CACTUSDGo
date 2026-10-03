import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ShoppingBag, ArrowRight, Sparkles, Package, Tag, ArrowUpRight, Flame, Check } from "lucide-react";
import { Product, ProductCat, CartItem } from "../types";
import ProductThumbnail from "./ProductThumbnail";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (item: CartItem) => void;
  onNavigateToCatalog: () => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  products,
  searchQuery,
  onSearchQueryChange,
  onSelectProduct,
  onAddToCart,
  onNavigateToCatalog,
}: SearchModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Global ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Categories list
  const categories: (ProductCat | "All")[] = ["All", "Outerwear", "Tees", "Tank Tops", "Armless", "Headwear", "Accessories"];

  // Filtered matching items
  const matchingProducts = useMemo(() => {
    let list = [...products];

    // Filter by Category
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.details && p.details.some((d) => d.toLowerCase().includes(q))) ||
          (p.colors && p.colors.some((c) => c.name.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory]);

  const trendingTags = [
    { label: "ARMLESS & TANKS", query: "armless" },
    { label: "STONER TANKS", query: "stoner" },
    { label: "HOODIES & OUTERWEAR", query: "outerwear" },
    { label: "HEAVYWEIGHT TEES", query: "tees" },
    { label: "HEADWEAR", query: "headwear" },
    { label: "NIGERIA LUXURY", query: "port harcourt" },
  ];

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const defaultColor = (product.colors && product.colors[0]) || {
      name: "Standard",
      hex: "#111111",
      bgHex: "#1a1a1c",
    };
    const defaultSize = (product.sizes && product.sizes[0]) || "L";

    const newItem: CartItem = {
      id: `${product.id}-${defaultColor.name}-${defaultSize}`,
      product,
      selectedColor: defaultColor,
      selectedSize: defaultSize,
      quantity: 1,
    };

    onAddToCart(newItem);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
  };

  const handleSelect = (productId: string) => {
    onSelectProduct(productId);
    onClose();
  };

  const handleViewAllInCatalog = () => {
    onNavigateToCatalog();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Search Card Dialog */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-3xl bg-[#08080a] border border-zinc-800 shadow-[0_20px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden my-auto sm:my-8 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Bar Input Header */}
            <div className="p-3.5 sm:p-5 border-b border-zinc-800 bg-[#0c0c0e] flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-black border border-zinc-800 flex items-center justify-center text-[#EFFF00] shrink-0">
                <Search size={16} />
              </div>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="SEARCH CATALOG, SKU, OR CATEGORY..."
                  className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder-zinc-500 uppercase tracking-widest outline-none py-1"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange("")}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear search text"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider border border-zinc-700 transition-colors cursor-pointer shrink-0"
              >
                [ ESC ]
              </button>
            </div>

            {/* Category Quick Selector Filter Chips */}
            <div className="px-3.5 sm:px-5 py-2.5 bg-black border-b border-zinc-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <Tag size={10} /> FILTER:
              </span>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === "All" ? products.length : products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`font-mono text-[9px] px-2.5 py-1 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#EFFF00] text-black font-bold border border-[#EFFF00]"
                        : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded-none ${isSelected ? "bg-black text-[#EFFF00]" : "bg-zinc-900 text-zinc-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-2.5">
              {/* Header stats row */}
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 pb-1">
                <span className="uppercase tracking-wider">
                  {searchQuery ? (
                    <>
                      MATCHING PIECES FOR <strong className="text-[#EFFF00]">"{searchQuery}"</strong> ({matchingProducts.length})
                    </>
                  ) : (
                    <>POPULAR & RECENT CATALOG PIECES ({matchingProducts.length})</>
                  )}
                </span>
                {matchingProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleViewAllInCatalog}
                    className="text-[#EFFF00] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <span>VIEW IN FULL CATALOG</span>
                    <ArrowUpRight size={11} />
                  </button>
                )}
              </div>

              {/* No results matching */}
              {matchingProducts.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 bg-zinc-950/60 border border-zinc-900">
                  <Package size={32} className="text-zinc-600 animate-pulse" />
                  <span className="font-mono text-xs text-[#EFFF00] uppercase font-bold tracking-widest">
                    NO STREETWEAR MATCHES FOUND
                  </span>
                  <p className="font-mono text-[11px] text-zinc-400 max-w-sm leading-relaxed">
                    No articles found matching "{searchQuery}". Try searching by piece type like "tank", "tee", "hoodie", or clear filters.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSearchQueryChange("");
                        setSelectedCategory("All");
                      }}
                      className="px-4 py-2 bg-[#EFFF00] text-black font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                    >
                      RESET SEARCH FILTERS
                    </button>
                  </div>
                </div>
              ) : (
                /* Results List */
                <div className="flex flex-col gap-2">
                  {matchingProducts.map((prod) => {
                    const isAdded = addedProductId === prod.id;
                    const defaultColor = (prod.colors && prod.colors[0]) || { name: "Standard", hex: "#111", bgHex: "#111" };
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelect(prod.id)}
                        className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-zinc-950 hover:bg-[#121216] border border-zinc-900 hover:border-[#EFFF00]/50 transition-all cursor-pointer"
                      >
                        {/* Thumbnail image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black border border-zinc-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                          <ProductThumbnail product={prod} selectedColor={defaultColor} />
                          {prod.stock !== undefined && prod.stock <= 5 && (
                            <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white font-mono text-[7px] font-bold text-center uppercase tracking-tighter">
                              {prod.stock} LEFT
                            </span>
                          )}
                        </div>

                        {/* Middle info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[8.5px] uppercase px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-[#EFFF00]">
                              {prod.category}
                            </span>
                            <span className="font-mono text-[8.5px] text-zinc-400">
                              {prod.sku}
                            </span>
                          </div>

                          <h4 className="font-sans font-black text-xs sm:text-sm text-white uppercase tracking-tight truncate group-hover:text-[#EFFF00] transition-colors mt-0.5">
                            {prod.name}
                          </h4>

                          <p className="font-mono text-[10px] text-zinc-400 truncate mt-0.5">
                            {prod.description}
                          </p>
                        </div>

                        {/* Price & Action button */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                          <span className="font-mono text-xs sm:text-sm font-black text-[#EFFF00] whitespace-nowrap">
                            ₦{prod.price.toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(e, prod)}
                            className={`font-mono text-[9px] uppercase font-bold px-2.5 py-1.5 border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                              isAdded
                                ? "bg-[#EFFF00] text-black border-[#EFFF00]"
                                : "bg-black hover:bg-[#EFFF00] hover:text-black border-zinc-800 text-zinc-300"
                            }`}
                            title="Quick Add to Bag"
                          >
                            {isAdded ? (
                              <>
                                <Check size={11} />
                                <span className="hidden sm:inline">ADDED</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={11} />
                                <span className="hidden sm:inline">ADD</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Trending suggestions tag strip */}
              {!searchQuery && (
                <div className="mt-3 pt-3 border-t border-zinc-900">
                  <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider mb-2">
                    <Flame size={12} className="text-amber-500" />
                    <span>TRENDING SEARCH KEYWORDS</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingTags.map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => onSearchQueryChange(tag.query)}
                        className="px-2.5 py-1 bg-zinc-950 hover:bg-[#EFFF00] hover:text-black text-zinc-400 border border-zinc-850 hover:border-[#EFFF00] font-mono text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Catalog Shortcut & Quick Tips */}
            <div className="p-3 bg-[#0a0a0c] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-[#EFFF00]">✦ TIP:</span>
                <span>Type any keyword, category, or color to filter instantly</span>
              </div>
              <button
                type="button"
                onClick={handleViewAllInCatalog}
                className="text-white hover:text-[#EFFF00] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ml-auto"
              >
                <span>OPEN FULL CATALOG ({products.length})</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
