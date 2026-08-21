import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "privacy" | "terms";
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose,
  defaultTab = "privacy",
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = React.useState<"privacy" | "terms">(defaultTab);

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[#0e0e10] border border-zinc-800 text-zinc-300 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-none bg-[#EFFF00]/10 border border-[#EFFF00]/30 flex items-center justify-center">
                  <Shield size={16} className="text-[#EFFF00]" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                    CACTUS BEAR // LEGAL & COMPLIANCE
                  </h3>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase">
                    LAST UPDATED: AUGUST 2026 • LAGOS, NIGERIA
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-800 bg-black/40 font-mono text-[10px]">
              <button
                onClick={() => setActiveTab("privacy")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === "privacy"
                    ? "border-[#EFFF00] text-[#EFFF00] bg-[#EFFF00]/5"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Lock size={12} />
                PRIVACY POLICY
              </button>
              <button
                onClick={() => setActiveTab("terms")}
                className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === "terms"
                    ? "border-[#EFFF00] text-[#EFFF00] bg-[#EFFF00]/5"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <FileText size={12} />
                TERMS OF SERVICE
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed text-zinc-300 font-sans">
              {activeTab === "privacy" ? (
                <>
                  <div className="bg-[#141407] border border-[#EFFF00]/20 p-4 font-mono text-[10px] text-[#EFFF00]/90">
                    <p className="font-bold uppercase tracking-wider mb-1">
                      SUMMARY: WE RESPECT AND PROTECT YOUR DATA
                    </p>
                    <p className="text-zinc-300 font-sans text-xs">
                      Cactus Bear ("we", "our", or "us") is dedicated to protecting your personal information. We collect only what is necessary to authenticate your account, fulfill your garment orders, and process secure payments.
                    </p>
                  </div>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">01.</span> INFORMATION WE COLLECT
                    </h4>
                    <p className="text-zinc-400">
                      When you interact with Cactus Bear (https://www.cactusbear.store), we may collect:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                      <li><strong>Account Information:</strong> Name, email address, and profile photo provided through Google Sign-In authentication.</li>
                      <li><strong>Order & Delivery Data:</strong> Shipping address, Nigerian state/LGA, recipient phone number, and garment customizer specifications.</li>
                      <li><strong>Transaction Details:</strong> Payment transaction references, order IDs, and receipt hashes. Note: We never store your raw credit card or bank credentials. All transactions are securely routed through licensed processors (e.g. Flutterwave).</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">02.</span> HOW WE USE YOUR INFORMATION
                    </h4>
                    <p className="text-zinc-400">
                      We utilize collected data solely for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                      <li>Processing and delivering your streetwear pre-orders and bespoke merchandise.</li>
                      <li>Maintaining your authenticated shopping cart, wishlist, and past order ledger.</li>
                      <li>Sending automated delivery updates, release countdown notifications, and verification receipts.</li>
                      <li>Preventing fraudulent transactions and unauthorized system access.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">03.</span> GOOGLE USER DATA & OAUTH
                    </h4>
                    <p className="text-zinc-400">
                      Our application accesses your basic Google Profile data (email address, full name, profile picture) solely for customer identity verification. We never sell, share, or transfer your Google user data to third-party advertisers or data brokers.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">04.</span> DATA RETENTION & SECURITY
                    </h4>
                    <p className="text-zinc-400">
                      All account and transaction records are encrypted in transit via SSL/TLS and stored securely in Google Cloud Firestore infrastructure. You may request account deletion or data retrieval at any time by contacting our support desk.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">05.</span> CONTACT & INQUIRIES
                    </h4>
                    <p className="text-zinc-400">
                      If you have any questions regarding this Privacy Policy, contact us directly:
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 p-3 font-mono text-[10px] space-y-1 text-zinc-400">
                      <p className="text-white font-bold">CACTUS BEAR APPAREL GROUP</p>
                      <p>Email: <a href="mailto:chibundusadiq@gmail.com" className="text-[#EFFF00] underline">chibundusadiq@gmail.com</a></p>
                      <p>Website: <a href="https://www.cactusbear.store" className="text-[#EFFF00] underline">https://www.cactusbear.store</a></p>
                      <p>Location: Lagos & Yaba Creative District, Nigeria</p>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">01.</span> ACCEPTANCE OF TERMS
                    </h4>
                    <p className="text-zinc-400">
                      By accessing, browsing, or purchasing from Cactus Bear (https://www.cactusbear.store), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the platform.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">02.</span> MERCHANDISE & PRE-ORDERS
                    </h4>
                    <p className="text-zinc-400">
                      All Cactus Bear heavyweight garments and bespoke pieces are produced in limited edition drops. Due to the limited nature of our drops:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                      <li>Orders are confirmed only after payment verification via Flutterwave or verified direct bank transfer.</li>
                      <li>Customized apparel built via the 3D Garment Lab Customizer is tailored to your exact specifications. Please double check sizing charts before placing your pre-order.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">03.</span> SHIPPING & DISPATCH
                    </h4>
                    <p className="text-zinc-400">
                      We dispatch country-wide across all 36 Nigerian states and Abuja FCT. Delivery timelines range from 2–5 business days within Lagos and 3–7 business days nationwide following drop fulfillment.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-[#EFFF00]">04.</span> INTELLECTUAL PROPERTY
                    </h4>
                    <p className="text-zinc-400">
                      All graphics, vector typography, lookbook photography, 3D assets, and trademark emblems are exclusive intellectual property of Cactus Bear Apparel Group.
                    </p>
                  </section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-500">
                HTTPS://WWW.CACTUSBEAR.STORE
              </span>
              <button
                onClick={onClose}
                className="bg-[#EFFF00] hover:bg-[#EFFF22] text-black font-mono font-black text-xs px-5 py-2 uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={13} />
                I UNDERSTAND
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
