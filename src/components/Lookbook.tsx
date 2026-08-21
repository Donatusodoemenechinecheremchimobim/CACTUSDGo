import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Flame, Cpu, RefreshCw, Camera } from "lucide-react";
import { ProductCardSkeleton } from "./ProductCard";

const LOOKBOOK_SHOTS = [
  {
    id: "look-01",
    tag: "CAMPAIGN // SERIE 01",
    label: "OBSIDIAN SILHOUETTE",
    desc: "Prestige organic fleece styled with double needle structural shoulder lines and thick rib retention.",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
    dimensions: "500GSM BOX FIT"
  },
  {
    id: "look-02",
    tag: "CAMPAIGN // SERIE 02",
    label: "TOBACCO EARTH BLUEPRINT",
    desc: "Structured linen-cotton yarn woven and buttoned under rigorous atelier guidelines.",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    dimensions: "OVERSIZED SEED SHIRT"
  }
];

export default function Lookbook() {
  const [isFetching, setIsFetching] = useState<boolean>(true);

  // Auto load lookbook captures on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const triggerRefresh = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 1200);
  };

  return (
    <section id="brand-lookbook" className="w-full bg-black text-white py-24 px-4 md:px-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-[#EFFF00]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#EFFF00]/4 blur-[160px] pointer-events-none" />

      {/* Decorative Ticker Tape scroller */}
      <div className="w-full overflow-hidden border-y border-zinc-900 py-3 bg-[#050505] absolute top-0 left-0">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] font-mono text-[9px] text-[#EFFF00]/60 tracking-[0.25em]">
          <span>CACTUS BEAR // HEAVYWEIGHT PREMIUM STREETWEAR // 100% SUPIMA COTTON // LAGOS YABA EXP-STUDIO // </span>
          <span>CACTUS BEAR // HEAVYWEIGHT PREMIUM STREETWEAR // 100% SUPIMA COTTON // LAGOS YABA EXP-STUDIO // </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        {/* Section Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
          <div>
            <span className="font-mono text-[#EFFF00] text-[10px] tracking-[0.3em] uppercase block font-bold mb-2">
              ATELIER ARCHIVE // 2026
            </span>
            <h2 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tight text-white">
              CRAFT & <span className="text-[#EFFF00]">EDITORIAL</span>
            </h2>
          </div>
          <p className="text-zinc-500 text-xs font-sans max-w-md">
            Engineered silhouettes, custom heavyweight cotton textiles, and hand-finished garment specifications crafted in Lagos.
          </p>
        </div>

        {/* Editorial Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Brand Concept story */}
          <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-800 transition-colors">
            <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
              01 // OUR MISSION
            </span>
            <div>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                BUILT TO <span className="text-[#EFFF00]">LAST</span>
              </h3>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                We design streetwear that is made to last. Our heavy organic cotton is durable and comfortable, featuring double-stitch details for long wear.
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center text-zinc-600 font-mono text-[9px]">
              <span>FIT: BOXY</span>
              <span>ORIGIN: NIGERIA</span>
            </div>
          </div>

          {/* Bento Card 2: Fabric Blueprint */}
          <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-800 transition-colors">
            <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
              02 // PRESTIGE FABRICS
            </span>
            <div>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                PREMIUM <span className="text-[#EFFF00]">COTTON</span>
              </h3>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                We use 100% natural organic cotton fabrics. No polyester or synthetic blends. Our garments keep their shape and offer premium thickness and breathability.
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center text-zinc-600 font-mono text-[9px]">
              <span>FABRIC: 100% SUPIMA</span>
              <span>WASH: VINTAGE MINERAL</span>
            </div>
          </div>

          {/* Bento Card 3: Cinematic Look card with visual asset & blueprint */}
          <div className="lg:col-span-12 bg-gradient-to-r from-zinc-950 to-[#0c0c0d] border border-zinc-900 p-8 flex flex-col md:flex-row justify-between items-stretch gap-6 min-h-[260px]">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
                  03 // COMFORT & CRAFT
                </span>
                <h3 className="font-sans font-black text-2xl md:text-3xl uppercase tracking-tight mb-3">
                  HAND-FINISHED <span className="text-[#EFFF00]">DESIGNS</span>
                </h3>
                <p className="text-zinc-400 text-xs font-sans leading-relaxed max-w-2xl">
                  To maintain our high quality standards, we avoid mass production. Each streetwear item is custom designed, hand-inspected, and shipped from our studio in Lagos. That's our promise of simple, elegant everyday luxury.
                </p>
              </div>
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                  <Flame size={13} className="text-[#EFFF00]" />
                  LIMITED BATCH RUNS
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                  <Cpu size={13} className="text-[#EFFF00]" />
                  VERIFIED ATELIER LABEL
                </div>
              </div>
            </div>

            {/* Graphical blueprint line box */}
            <div className="w-full md:w-64 bg-black/70 border border-zinc-800 p-5 flex flex-col justify-between font-mono text-[9px] text-zinc-500 relative shrink-0">
              <div className="absolute inset-0 bg-[#EFFF00]/5 opacity-30 pointer-events-none" />
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span>SPECIFICATIONS</span>
                <span className="text-white font-bold">CB_SPECS</span>
              </div>
              <div className="flex flex-col gap-1.5 my-3 text-[10px]">
                <div className="flex justify-between"><span>[01] COTTON YARN:</span> <span className="text-white">100% ORGANIC</span></div>
                <div className="flex justify-between"><span>[02] HEM STITCH:</span> <span className="text-white">DOUBLE NEEDLE</span></div>
                <div className="flex justify-between"><span>[03] DYE QUALITY:</span> <span className="text-white">REACTIVE VAT</span></div>
                <div className="flex justify-between"><span>[04] WEIGHT CLASS:</span> <span className="text-[#EFFF00]">500GSM HEAVY</span></div>
              </div>
              <div className="text-center bg-[#EFFF00]/10 text-[#EFFF00] py-1.5 border border-[#EFFF00]/20 font-bold tracking-wider">
                CERTIFIED ATELIER
              </div>
            </div>
          </div>

          {/* Bento Card 4: Editorial Campaign Captures */}
          <div className="lg:col-span-12 bg-[#020202] border border-zinc-900 p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none border border-zinc-900 flex items-center justify-center text-[#EFFF00] bg-black/40">
                  <Camera size={14} />
                </div>
                <div>
                  <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold uppercase">
                    04 // EDITORIAL LOOKBOOK CAMPAIGN
                  </span>
                  <h3 className="font-sans font-black text-xl md:text-2xl uppercase tracking-tight text-white mt-0.5">
                    EDITORIAL <span className="text-[#EFFF00]">CAPTURES</span>
                  </h3>
                </div>
              </div>
              
              {/* Loader control indicator */}
              <button
                onClick={triggerRefresh}
                disabled={isFetching}
                className="font-mono text-[8px] tracking-[0.25em] bg-zinc-950 border border-zinc-900 hover:border-[#EFFF00] text-zinc-400 hover:text-[#EFFF00] transition-all px-4 py-2 uppercase flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw size={11} className={`${isFetching ? 'animate-spin text-[#EFFF00]' : 'text-zinc-500'}`} />
                <span>REFRESH CAPTURES FEED</span>
              </button>
            </div>

            {/* Lookbook captures grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[380px]">
              {isFetching ? (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              ) : (
                LOOKBOOK_SHOTS.map((shot) => (
                  <motion.div
                    key={shot.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#050505] border border-zinc-900 group/look overflow-hidden flex flex-col justify-between relative"
                  >
                    {/* Header block with brand tag and release metadata */}
                    <div className="flex justify-between items-center px-4 py-2.5 bg-black/40 border-b border-zinc-900 font-mono text-[9px] text-zinc-500">
                      <span>{shot.tag}</span>
                      <span className="text-[#EFFF00] font-bold">{shot.dimensions}</span>
                    </div>

                    {/* Main campaign snapshot box */}
                    <div className="relative h-[240px] sm:h-[320px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                      <img
                        src={shot.imageUrl}
                        alt={shot.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale opacity-75 group-hover/look:scale-105 group-hover/look:grayscale-0 group-hover/look:opacity-100 transition-all duration-700 ease-out"
                      />
                      {/* Interactive watermark overlay */}
                      <div className="absolute bottom-3 left-3 bg-black/90 border border-zinc-900 px-3 py-1 text-[8px] font-mono text-zinc-400 tracking-wider">
                        ✦ CAM_REFID: {shot.id.toUpperCase()}
                      </div>
                    </div>

                    {/* Bottom Info Blocks */}
                    <div className="p-4 border-t border-zinc-900 bg-black/60">
                      <h4 className="font-sans font-black text-xs sm:text-sm text-white tracking-tight uppercase group-hover/look:text-[#EFFF00] transition-colors">
                        {shot.label}
                      </h4>
                      <p className="text-zinc-500 text-[11px] font-sans mt-1 leading-relaxed">
                        {shot.desc}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
