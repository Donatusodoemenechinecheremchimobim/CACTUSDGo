import { Flame, Cpu } from "lucide-react";

export default function Lookbook() {
  return (
    <section id="brand-lookbook" className="w-full bg-black text-white py-12 md:py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative Ticker Tape scroller */}
      <div className="w-full overflow-hidden border-y border-zinc-900 py-2.5 bg-[#050505] absolute top-0 left-0">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] font-mono text-[9px] text-[#EFFF00]/60 tracking-[0.25em]">
          <span>CACTUS BEAR // CONTEMPORARY LUXURY STREETWEAR // PORT HARCOURT ATELIER // LIMITED CAPSULES // NATIONWIDE SHIPPING // </span>
          <span>CACTUS BEAR // CONTEMPORARY LUXURY STREETWEAR // PORT HARCOURT ATELIER // LIMITED CAPSULES // NATIONWIDE SHIPPING // </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4">
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <span className="font-mono text-[#EFFF00] text-[10px] tracking-[0.3em] uppercase block font-bold mb-1.5">
              ATELIER ARCHIVE // 2026
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white">
              CRAFT & <span className="text-[#EFFF00]">AESTHETICS</span>
            </h2>
          </div>
          <p className="text-zinc-400 text-xs font-sans max-w-md">
            Distinctive silhouettes, premium textiles, and signature graphic craftsmanship designed and curated in Port Harcourt.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Bento Card 1: Brand Concept story */}
          <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-800 transition-colors">
            <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
              01 // OUR VISION
            </span>
            <div>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                BUILT TO <span className="text-[#EFFF00]">LAST</span>
              </h3>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                We design streetwear with longevity in mind. Premium construction, reinforced seams, and timeless silhouettes built for lasting everyday wear.
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center text-zinc-600 font-mono text-[9px]">
              <span>EDITION: LIMITED</span>
              <span>ORIGIN: NIGERIA</span>
            </div>
          </div>

          {/* Bento Card 2: Fabric Blueprint */}
          <div className="lg:col-span-6 bg-[#0b0b0c] border border-zinc-900 p-8 flex flex-col justify-between min-h-[250px] relative group hover:border-zinc-800 transition-colors">
            <span className="font-mono text-[#EFFF00] text-[9px] tracking-widest block font-bold mb-4">
              02 // SIGNATURE FINISHES
            </span>
            <div>
              <h3 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                DISTINCTIVE <span className="text-[#EFFF00]">ARTISTRY</span>
              </h3>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                From high-definition screenprints to refined embroidery, each piece showcases our iconic crown motif and thoughtful streetwear detailing.
              </p>
            </div>
            <div className="mt-6 flex justify-between items-center text-zinc-600 font-mono text-[9px]">
              <span>CRAFT: ATELIER FINISH</span>
              <span>RELEASE: CAPSULE '01</span>
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
                  To maintain our high quality standards, we avoid mass production. Each streetwear item is custom designed, hand-inspected, and shipped directly from our studio in Port Harcourt.
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
                <div className="flex justify-between"><span>[01] TEXTILE:</span> <span className="text-white">PREMIUM ATELIER KNIT</span></div>
                <div className="flex justify-between"><span>[02] REINFORCEMENT:</span> <span className="text-white">DOUBLE SEAM</span></div>
                <div className="flex justify-between"><span>[03] GRAPHIC ART:</span> <span className="text-white">ARCHIVAL PRINT</span></div>
                <div className="flex justify-between"><span>[04] EDITION:</span> <span className="text-[#EFFF00]">CAPSULE RELEASE</span></div>
              </div>
              <div className="text-center bg-[#EFFF00]/10 text-[#EFFF00] py-1.5 border border-[#EFFF00]/20 font-bold tracking-wider">
                CERTIFIED ATELIER
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
