import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Ruler,
  Layers,
  Scissors,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import GlowCrown from "./GlowCrown";
import { ProductCat } from "../types";

interface AboutPageProps {
  onBack: () => void;
  onExploreShop: (category?: ProductCat | "All") => void;
  onOpenSizeGuide?: () => void;
}

export default function AboutPage({ onBack, onExploreShop }: AboutPageProps) {
  const garments = [
    {
      category: "Tees" as ProductCat,
      title: "Heavyweight Graphic Tees",
      weight: "300 - 320 GSM",
      cut: "Architectural Boxy Cut",
      material: "100% Combed Organic Cotton",
      desc: "Dense, structured drape that maintains its shape. Features a thick 1.25-inch high-ribbed collar that never sags after washing.",
      points: [
        "Pre-shrunk 100% organic cotton jersey",
        "Reinforced twin-needle shoulder seams",
        "Archival high-density screenprints",
        "Relaxed boxy streetwear silhouette"
      ]
    },
    {
      category: "Outerwear" as ProductCat,
      title: "Ultra-Heavy Fleece Hoodies",
      weight: "450 GSM Zero-Blend",
      cut: "Oversized Street Cut",
      material: "100% Heavy Brushed Cotton Fleece",
      desc: "Our heaviest signature build. Engineered with a double-layer structured hood that stays upright without drawstrings, deep hidden kangaroo pouch, and snug rib cuffs.",
      points: [
        "450 GSM zero-blend ultra-heavy cotton fleece",
        "Double-layer self-fabric structured hood",
        "Ribbed side-action panels for natural motion",
        "Tonal embroidered crown monogram"
      ]
    },
    {
      category: "Outerwear" as ProductCat,
      title: "French Terry Sweatpants & Bottoms",
      weight: "400 GSM Loopback",
      cut: "Relaxed Straight / Tapered",
      material: "100% Loopback French Terry",
      desc: "Tailored for street presence and everyday comfort. Deep zippered pockets for oversized phones and custom dipped matte metal aglets.",
      points: [
        "Breathable heavyweight loopback interior",
        "Deep secure zippered side pockets",
        "Thick custom braided cotton drawstrings",
        "Engineered knee darts for clean draping"
      ]
    },
    {
      category: "Headwear" as ProductCat,
      title: "Headwear & Street Essentials",
      weight: "Heavyweight Chino Twill",
      cut: "Structured Unisex Fit",
      material: "100% Cotton Chino Twill",
      desc: "Low-profile structured 6-panel caps and dense ribbed beanies featuring the signature Cactus Bear crown embroidery.",
      points: [
        "Unstructured crown with pre-curved visor",
        "Custom brass buckle strap closure",
        "High-density 3D crown embroidery",
        "Reinforced interior sweatband"
      ]
    }
  ];

  const sizeTable = [
    { size: "S", chest: '42" (107cm)', length: '28" (71cm)', shoulder: '21" (53cm)', rec: "5'4\" - 5'8\" (50-65kg)" },
    { size: "M", chest: '45" (114cm)', length: '29" (74cm)', shoulder: '22" (56cm)', rec: "5'8\" - 5'11\" (65-78kg)" },
    { size: "L", chest: '48" (122cm)', length: '30" (76cm)', shoulder: '23" (58cm)', rec: "5'10\" - 6'2\" (75-90kg)" },
    { size: "XL", chest: '51" (130cm)', length: '31" (79cm)', shoulder: '24" (61cm)', rec: "6'1\" - 6'5\" (88-105kg)" },
    { size: "XXL", chest: '54" (137cm)', length: '32" (81cm)', shoulder: '25" (64cm)', rec: "6'2\"+ (100kg+)" }
  ];

  return (
    <div className="w-full bg-[#050505] text-white min-h-screen pb-24" id="about-us-page">
      {/* Return Bar */}
      <div className="w-full border-b border-zinc-900 bg-black/90 sticky top-16 md:top-20 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-xs text-zinc-400 hover:text-[#EFFF00] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>BACK TO HOME</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest hidden sm:inline-block">
              CACTUS BEAR ATELIER
            </span>
            <div className="w-6 h-3">
              <GlowCrown size="100%" color="#EFFF00" glow={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 md:pt-14 space-y-14">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EFFF00] animate-pulse" />
            <span className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest">
              LAGOS STREETWEAR ATELIER
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight uppercase text-white mb-4">
            ABOUT <span className="text-[#EFFF00]">CACTUS BEAR</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans">
            Independent Nigerian luxury streetwear atelier creating heavy-gauge 100% organic cotton garments with architectural boxy cuts and minimalist durability.
          </p>
        </div>

        {/* 1. WHO WE ARE */}
        <section className="p-6 sm:p-8 bg-zinc-950 border border-zinc-850 rounded-lg">
          <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={14} />
            <span>01 // WHO WE ARE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white mb-4">
            BORN IN LAGOS, CRAFTED FOR LONGEVITY
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">
            Founded in Lagos, Nigeria, <strong className="text-white">CACTUS BEAR</strong> was built to solve a simple problem: standard fast-fashion t-shirts are thin, lose collar tension, and shrink into misshapen rags after a couple of washes.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            We engineer small-batch garments using dense 300–450 GSM pure combed cotton. Every piece carries our crown emblem—a symbol of self-made authority, discipline, and uncompromising African craftsmanship.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-zinc-900">
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">ATELIER</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase">LAGOS, NIGERIA</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">FABRICS</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#EFFF00] uppercase">300-450 GSM COTTON</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 col-span-2 sm:col-span-1">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">EDITIONS</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase">LIMITED CAPSULES</span>
            </div>
          </div>
        </section>

        {/* 2. WHAT WE DO */}
        <section>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-1">
              <Layers size={14} />
              <span>02 // WHAT WE DO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white">
              CRAFT & MANUFACTURING PRINCIPLES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Layers size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Heavyweight Textiles</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                We exclusively source 300 to 450 GSM pure combed cotton. Zero polyester filler blends, zero pilling, and full breathability.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Scissors size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Architectural Cuts</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Drop-shoulder proportions, widened chests, tight high-ribbed necklines, and clean lengths designed for modern streetwear styling.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Archival Screenprinting</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                High-tension silk screens and cured puff ink formulas that resist cracking, peeling, or fading through repeated washing.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Manual Inspection</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Every tee, hoodie, and cap is individually checked for seam alignment, tension, and embroidery finish before packaging.
              </p>
            </div>
          </div>
        </section>

        {/* 3. WHAT WE SELL */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-1">
                <ShoppingBag size={14} />
                <span>03 // WHAT WE SELL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white">
                CORE GARMENT SILHOUETTES
              </h2>
            </div>
            <button
              onClick={() => onExploreShop("All")}
              className="font-mono text-xs text-[#EFFF00] hover:text-white flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            >
              <span>EXPLORE ALL ITEMS</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {garments.map((g, idx) => (
              <div
                key={idx}
                className="p-6 bg-zinc-950 border border-zinc-850 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[#EFFF00] font-mono text-[10px] font-bold uppercase">
                      {g.weight}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">
                      {g.cut}
                    </span>
                  </div>

                  <h3 className="text-lg font-sans font-bold text-white uppercase mb-2">
                    {g.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {g.desc}
                  </p>

                  <div className="space-y-1.5 mb-5">
                    {g.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 size={13} className="text-[#EFFF00] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onExploreShop(g.category)}
                  className="w-full bg-white hover:bg-[#EFFF00] text-black font-mono font-bold py-2.5 px-4 text-xs tracking-wider uppercase transition-colors rounded-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag size={13} />
                  <span>SHOP {g.category.toUpperCase()}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. INTEGRATED SIZE & FIT GUIDE */}
        <section className="p-6 sm:p-8 bg-zinc-950 border border-zinc-850 rounded-lg">
          <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-1">
            <Ruler size={14} />
            <span>04 // SIZING & FIT GUIDE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white mb-2">
            HOW OUR GARMENTS FIT
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
            Our tees and hoodies are cut with a signature boxy, drop-shoulder streetwear fit. For a tailored look, take your normal size. For an oversized drape, consider sizing up one size.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">SIZE</th>
                  <th className="py-2.5 px-3">CHEST WIDTH</th>
                  <th className="py-2.5 px-3">BODY LENGTH</th>
                  <th className="py-2.5 px-3">SHOULDER</th>
                  <th className="py-2.5 px-3">RECOMMENDED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {sizeTable.map((row) => (
                  <tr key={row.size} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#EFFF00]">{row.size}</td>
                    <td className="py-2.5 px-3">{row.chest}</td>
                    <td className="py-2.5 px-3">{row.length}</td>
                    <td className="py-2.5 px-3">{row.shoulder}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{row.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. BRAND PROMISES */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <Truck size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">NATIONWIDE SHIPPING</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              1–3 days in Lagos, 2–5 days across Nigeria with doorstep live tracking.
            </p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">100% ORGANIC COTTON</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Heavyweight combed fibers with zero synthetic filler blends.
            </p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <RefreshCw size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">EASY SIZE SWAPS</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Need a different fit or drape? Exchange your unworn garment within 7 days.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="p-8 bg-zinc-950 border border-[#EFFF00]/30 rounded-lg text-center flex flex-col items-center gap-4">
          <div className="w-12 h-6">
            <GlowCrown size="100%" color="#EFFF00" glow={true} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white max-w-md">
            EXPLORE THE COLLECTION
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-md">
            Heavyweight streetwear crafted in Lagos with nationwide delivery.
          </p>
          <button
            onClick={() => onExploreShop("All")}
            className="bg-[#EFFF00] hover:bg-white text-black font-mono font-black py-3.5 px-8 text-xs tracking-widest transition-colors rounded-none uppercase flex items-center gap-2 cursor-pointer mt-2"
          >
            <span>SHOP COLLECTION '01</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

