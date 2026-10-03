import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Layers,
  Scissors,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Award
} from "lucide-react";
import GlowCrown from "./GlowCrown";
import { ProductCat } from "../types";

interface AboutPageProps {
  onBack: () => void;
  onExploreShop: (category?: ProductCat | "All") => void;
}

export default function AboutPage({ onBack, onExploreShop }: AboutPageProps) {
  const garments = [
    {
      category: "Tees" as ProductCat,
      title: "Signature Graphic Tees",
      edition: "Limited Drop",
      material: "Premium Knit Textile",
      desc: "Structured silhouette with rich drape and color retention. Finished with a durable high-rib collar and archival chest and back prints.",
      points: [
        "High-density archival graphic screenprints",
        "Reinforced shoulder seams for shape retention",
        "Pre-washed to resist shrinkage or fading",
        "Signature Cactus Bear crown monogram detailing"
      ]
    },
    {
      category: "Tank Tops" as ProductCat,
      title: "Studio Ribbed Tank Tops",
      edition: "Capsule Drop",
      material: "Heavy Stretch Rib Knit",
      desc: "Athletic cut sleeveless tanks tailored with high armholes, clean bound collar edges, and subtle chest crown embroidery.",
      points: [
        "Breathable heavy stretch rib knit",
        "Deep armhole and neckline binding",
        "Reinforced flatlock stitched double hem",
        "Subtle high-density chest crown mark"
      ]
    },
    {
      category: "Armless" as ProductCat,
      title: "Raw-Cut Armless Vests & Muscle Tees",
      edition: "Street Core Edition",
      material: "360GSM Combed French Terry",
      desc: "Heavyweight street silhouettes featuring raw cut dropped armholes, ribbed crew neck collar, and signature archival thorn prints.",
      points: [
        "Heavyweight 360GSM combed cotton construction",
        "Dropped raw armhole cut with anti-fray lockstitch",
        "Wide-shoulder armless cut with natural relaxed drape",
        "High-density tactile puff crown print at back yoke"
      ]
    },
    {
      category: "Outerwear" as ProductCat,
      title: "Structured Fleece Hoodies",
      edition: "Studio Archive",
      material: "Custom Brushed Fleece",
      desc: "Signature cold-weather outerwear featuring a double-layer structured hood, deep hidden kangaroo pouch, and snug ribbed cuffs.",
      points: [
        "Plush interior with high-density outer weave",
        "Double-layer self-fabric structured hood",
        "Ribbed side-action panels for natural motion",
        "Tonal embroidered crown insignia"
      ]
    },
    {
      category: "Outerwear" as ProductCat,
      title: "French Terry Sweatpants & Bottoms",
      edition: "Core Collection",
      material: "Loopback Terry",
      desc: "Engineered for street presence and everyday comfort. Deep zippered pockets for smartphones and custom dipped matte metal aglets.",
      points: [
        "Breathable loopback interior construction",
        "Deep secure zippered side pockets",
        "Custom braided drawstrings with matte tips",
        "Clean structural paneling for everyday wear"
      ]
    },
    {
      category: "Headwear" as ProductCat,
      title: "Headwear & Street Essentials",
      edition: "Capsule Release",
      material: "Structured Chino Twill",
      desc: "Structured 6-panel caps and dense ribbed beanies featuring the signature Cactus Bear crown embroidery and custom hardware.",
      points: [
        "Structured crown with pre-curved visor",
        "Custom brass buckle strap closure",
        "High-density 3D crown embroidery",
        "Reinforced interior comfort sweatband"
      ]
    }
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
              PORT HARCOURT STREETWEAR ATELIER
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight uppercase text-white mb-4">
            ABOUT <span className="text-[#EFFF00]">CACTUS BEAR</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans">
            Independent Nigerian luxury streetwear atelier creating contemporary garments with distinctive graphic artistry, clean lines, and long-lasting durability.
          </p>
        </div>

        {/* 1. WHO WE ARE */}
        <section className="p-6 sm:p-8 bg-zinc-950 border border-zinc-855 rounded-lg">
          <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={14} />
            <span>01 // WHO WE ARE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black uppercase text-white mb-4">
            BORN IN PORT HARCOURT, CRAFTED FOR DURABILITY
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">
            Founded in Port Harcourt, Rivers State, Nigeria, <strong className="text-white">CACTUS BEAR</strong> was created to redefine African streetwear by prioritizing high craftsmanship, timeless aesthetics, and uncompromising quality over fast-fashion shortcuts.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            We produce small-batch collections where every piece carries our signature crown emblem—a symbol of self-made authority, resilience, and modern African creative expression.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-zinc-900">
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">STUDIO</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase">PORT HARCOURT, NIGERIA</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">CRAFT</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#EFFF00] uppercase">LIMITED CAPSULES</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 col-span-2 sm:col-span-1">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase">DISTRIBUTION</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase">NATIONWIDE & GLOBAL</span>
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
              DESIGN & MANUFACTURING PRINCIPLES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Layers size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Premium Textiles</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                We select durable, breathable fabrics that hold their structure through daily wear, resisting pilling and stretching.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Scissors size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Clean Silhouettes</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Refined proportions, balanced necklines, and clean lengths designed for modern, versatile streetwear styling.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Archival Screenprints</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                High-definition silk screens and cured ink formulas that resist cracking, peeling, or fading through repeated washing.
              </p>
            </div>

            <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00]">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-sans font-bold text-white text-base uppercase">Quality Inspection</h3>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Every piece is individually checked for seam alignment, tension, and embroidery finish before packaging and dispatch.
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
                      {g.edition}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">
                      {g.material}
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

        {/* 4. BRAND PROMISES */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <Truck size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">NATIONWIDE SHIPPING</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              1–2 days in Port Harcourt, 2–5 days across Nigeria with live tracking.
            </p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <Award size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">AUTHENTIC QUALITY</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Limited batch runs engineered with durable materials and careful stitching.
            </p>
          </div>

          <div className="p-5 bg-zinc-950 border border-zinc-850 rounded-lg">
            <div className="w-8 h-8 rounded bg-[#EFFF00]/10 border border-[#EFFF00]/20 flex items-center justify-center text-[#EFFF00] mb-3">
              <RefreshCw size={16} />
            </div>
            <h4 className="text-white font-mono text-xs font-bold uppercase mb-1">HASSLE-FREE RETURNS</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Easy exchanges and support for any unworn pieces within 7 days.
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
            Contemporary luxury streetwear crafted in Port Harcourt with nationwide delivery.
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

