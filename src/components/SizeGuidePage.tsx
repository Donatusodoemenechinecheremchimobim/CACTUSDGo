import React, { useState } from "react";
import { Ruler, Sparkles, CheckCircle2, ArrowRight, ShieldAlert, Shirt, Scissors } from "lucide-react";

interface SizeGuidePageProps {
  onBack: () => void;
  onExploreShop: () => void;
}

type GarmentType = "tees" | "hoodies" | "sweatpants" | "headwear";
type UnitType = "cm" | "in";

interface SizeRow {
  size: string;
  chestOrWaist: number; // CM
  length: number; // CM
  shoulderOrInseam: number; // CM
  sleeve: number; // CM
}

const SIZE_DATA: Record<GarmentType, { name: string; fitDescription: string; rows: SizeRow[] }> = {
  tees: {
    name: "Heavyweight Boxy Tees",
    fitDescription: "Cut with a modern boxy silhouette, drop shoulders, and a thick 1.25\" ribbed collar. Designed to fit relaxed.",
    rows: [
      { size: "S", chestOrWaist: 108, length: 71, shoulderOrInseam: 52, sleeve: 22 },
      { size: "M", chestOrWaist: 114, length: 73, shoulderOrInseam: 54, sleeve: 23 },
      { size: "L", chestOrWaist: 120, length: 76, shoulderOrInseam: 56, sleeve: 24 },
      { size: "XL", chestOrWaist: 126, length: 78, shoulderOrInseam: 58, sleeve: 25 },
      { size: "XXL", chestOrWaist: 132, length: 80, shoulderOrInseam: 60, sleeve: 26 },
    ],
  },
  hoodies: {
    name: "450GSM Heavyweight Zip & Pullover Hoodies",
    fitDescription: "Engineered from ultra-dense French Terry fleece with double-lined hoods and reinforced ribbing. Generously cut for layering.",
    rows: [
      { size: "S", chestOrWaist: 116, length: 68, shoulderOrInseam: 54, sleeve: 62 },
      { size: "M", chestOrWaist: 122, length: 71, shoulderOrInseam: 56, sleeve: 64 },
      { size: "L", chestOrWaist: 128, length: 74, shoulderOrInseam: 58, sleeve: 66 },
      { size: "XL", chestOrWaist: 134, length: 77, shoulderOrInseam: 60, sleeve: 68 },
      { size: "XXL", chestOrWaist: 140, length: 80, shoulderOrInseam: 62, sleeve: 70 },
    ],
  },
  sweatpants: {
    name: "Heavy French Terry Sweatpants",
    fitDescription: "Relaxed straight-leg cut with adjustable bungee toggles at the hem and deep zipper-secured side pockets.",
    rows: [
      { size: "S", chestOrWaist: 76, length: 102, shoulderOrInseam: 74, sleeve: 30 },
      { size: "M", chestOrWaist: 82, length: 104, shoulderOrInseam: 75, sleeve: 32 },
      { size: "L", chestOrWaist: 88, length: 106, shoulderOrInseam: 76, sleeve: 34 },
      { size: "XL", chestOrWaist: 94, length: 108, shoulderOrInseam: 77, sleeve: 36 },
      { size: "XXL", chestOrWaist: 100, length: 110, shoulderOrInseam: 78, sleeve: 38 },
    ],
  },
  headwear: {
    name: "Structure 6-Panel & Beanie Headwear",
    fitDescription: "Deep crown profile with premium brass rear clasp and curved visor. One size fits most (54cm - 62cm circumference).",
    rows: [
      { size: "OS (One Size)", chestOrWaist: 58, length: 16, shoulderOrInseam: 7, sleeve: 0 },
    ],
  },
};

export default function SizeGuidePage({ onBack, onExploreShop }: SizeGuidePageProps) {
  const [activeGarment, setActiveGarment] = useState<GarmentType>("tees");
  const [unit, setUnit] = useState<UnitType>("cm");
  const [userHeight, setUserHeight] = useState<string>("175");
  const [userWeight, setUserWeight] = useState<string>("75");
  const [preferredFit, setPreferredFit] = useState<"true" | "oversized">("oversized");

  // Helper converter
  const formatVal = (cmVal: number) => {
    if (unit === "in") {
      return (cmVal / 2.54).toFixed(1);
    }
    return cmVal.toString();
  };

  // Quick automated fit recommendation calculation
  const getRecommendedSize = () => {
    const h = parseInt(userHeight, 10) || 175;
    const w = parseInt(userWeight, 10) || 75;

    let baseSize = "M";
    if (w < 65 || h < 168) baseSize = "S";
    else if (w <= 78 && h <= 180) baseSize = "M";
    else if (w <= 90 && h <= 188) baseSize = "L";
    else if (w <= 102) baseSize = "XL";
    else baseSize = "XXL";

    if (preferredFit === "oversized") {
      if (baseSize === "S") return "M (For relaxed drape)";
      if (baseSize === "M") return "L (For signature boxy drape)";
      if (baseSize === "L") return "XL (For oversized street drape)";
      if (baseSize === "XL") return "XXL (For maximum oversized drape)";
      return "XXL (Maximum oversize)";
    }
    return `${baseSize} (True to Boxy Fit)`;
  };

  const currentCategory = SIZE_DATA[activeGarment];

  return (
    <div className="w-full bg-black text-white py-12 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#EFFF00]" />
              <span className="font-mono text-[10px] text-[#EFFF00] tracking-widest uppercase font-bold">
                FIT & SILHOUETTE BLUEPRINT
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black uppercase tracking-tight text-white">
              SIZE & <span className="text-[#EFFF00]">FIT GUIDE</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-xl font-sans leading-relaxed">
              Find your ideal silhouette across our heavyweight 450GSM outerwear, boxy drop-shoulder tees, and luxury street essentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="font-mono text-[10px] tracking-widest bg-zinc-950 border border-zinc-900 hover:border-[#EFFF00] px-4 py-2.5 uppercase hover:text-[#EFFF00] transition-colors cursor-pointer"
            >
              [ RETURN HOME ]
            </button>
            <button
              onClick={onExploreShop}
              className="font-mono text-[10px] tracking-widest bg-[#EFFF00] text-black font-black px-4 py-2.5 uppercase hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              SHOP CATALOG
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Section 1: Garment Category Switcher & Unit Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-900 p-4 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "tees", label: "Heavyweight Tees", icon: Shirt },
                { id: "hoodies", label: "Outerwear & Hoodies", icon: Scissors },
                { id: "sweatpants", label: "Bottoms & Pants", icon: Ruler },
                { id: "headwear", label: "Caps & Headwear", icon: Sparkles },
              ] as const
            ).map((item) => {
              const isSelected = activeGarment === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveGarment(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EFFF00] text-black font-bold shadow-md shadow-[#EFFF00]/10"
                      : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase font-medium">Unit:</span>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                unit === "cm" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              CM
            </button>
            <button
              onClick={() => setUnit("in")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                unit === "in" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              INCHES
            </button>
          </div>
        </div>

        {/* Section 2: Active Category Table */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/30">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {currentCategory.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {currentCategory.fitDescription}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#EFFF00] bg-[#EFFF00]/10 px-3 py-1.5 rounded-full border border-[#EFFF00]/20 w-max">
              <Sparkles size={13} />
              <span>MEASURED FLAT ({unit.toUpperCase()})</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/60 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Size Tag</th>
                  <th className="py-3.5 px-4 sm:px-6">
                    {activeGarment === "sweatpants" ? "Waist" : "Chest Width"} ({unit})
                  </th>
                  <th className="py-3.5 px-4 sm:px-6">Body Length ({unit})</th>
                  <th className="py-3.5 px-4 sm:px-6">
                    {activeGarment === "sweatpants" ? "Inseam" : "Shoulder Drop"} ({unit})
                  </th>
                  {activeGarment !== "headwear" && (
                    <th className="py-3.5 px-4 sm:px-6">Sleeve ({unit})</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono text-xs">
                {currentCategory.rows.map((row) => (
                  <tr key={row.size} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-bold text-[#EFFF00]">
                      {row.size}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-zinc-200">
                      {formatVal(row.chestOrWaist)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-zinc-200">
                      {formatVal(row.length)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-zinc-200">
                      {formatVal(row.shoulderOrInseam)}
                    </td>
                    {activeGarment !== "headwear" && (
                      <td className="py-4 px-4 sm:px-6 text-zinc-200">
                        {formatVal(row.sleeve)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Interactive Fit Advisor Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#EFFF00] font-mono text-xs font-bold uppercase mb-2">
                <Ruler size={15} />
                <span>INTERACTIVE FIT FINDER</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2">
                What's Your Preferred Fit?
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                Enter your approximate height & weight to calculate the recommended Cactus Bear garment size.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-1.5">
                    Height (cm): {userHeight} cm (~{(parseInt(userHeight || "175", 10) / 30.48).toFixed(1)} ft)
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="205"
                    value={userHeight}
                    onChange={(e) => setUserHeight(e.target.value)}
                    className="w-full accent-[#EFFF00] bg-zinc-900 rounded-lg h-2"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-zinc-400 uppercase mb-1.5">
                    Weight (kg): {userWeight} kg (~{Math.round(parseInt(userWeight || "75", 10) * 2.204)} lbs)
                  </label>
                  <input
                    type="range"
                    min="45"
                    max="130"
                    value={userWeight}
                    onChange={(e) => setUserWeight(e.target.value)}
                    className="w-full accent-[#EFFF00] bg-zinc-900 rounded-lg h-2"
                  />
                </div>
              </div>

              {/* Fit Style Toggle */}
              <div className="space-y-2">
                <span className="block font-mono text-[10px] text-zinc-400 uppercase">
                  Silhouette Preference:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPreferredFit("true")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      preferredFit === "true"
                        ? "border-[#EFFF00] bg-[#EFFF00]/10 text-white"
                        : "border-zinc-850 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">Classic Boxy</span>
                    <span className="text-[11px] text-zinc-400">Natural drop shoulder fit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredFit("oversized")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      preferredFit === "oversized"
                        ? "border-[#EFFF00] bg-[#EFFF00]/10 text-white"
                        : "border-zinc-850 bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#EFFF00]">Oversized Drape</span>
                    <span className="text-[11px] text-zinc-400">Deep street drape & heavy stack</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendation Result Card */}
            <div className="mt-6 pt-6 border-t border-zinc-900 flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 block uppercase">
                  Recommended Size
                </span>
                <span className="text-base sm:text-lg font-black text-[#EFFF00]">
                  {getRecommendedSize()}
                </span>
              </div>

              <button
                onClick={onExploreShop}
                className="bg-white hover:bg-[#EFFF00] text-black font-mono font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                View Catalog
              </button>
            </div>
          </div>

          {/* Garment & Care Instructions */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs font-bold uppercase mb-2">
                <ShieldAlert size={15} className="text-amber-400" />
                <span>FABRIC & CARE INSTRUCTIONS</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">
                Preserve Heavyweight Cotton
              </h3>

              <ul className="space-y-3.5 text-xs text-zinc-300 font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Wash Cold (Max 30°C):</strong> Wash inside out with similar dark tones to maintain mineral dye richness.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hang Dry in Shade:</strong> Avoid high-heat tumble dryers to prevent shrinkage of heavy 450GSM organic fleece.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Reverse Ironing:</strong> Iron garments inside out. Never iron directly over high-density puff screenprints.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Storage:</strong> Fold heavy knitwear on shelves instead of hanging to preserve shoulder stitch structure.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-900 font-mono text-[10px] text-zinc-500 flex justify-between items-center">
              <span>LAGOS DESIGN ATELIER</span>
              <span className="text-[#EFFF00]">100% ORGANIC COTTON</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
