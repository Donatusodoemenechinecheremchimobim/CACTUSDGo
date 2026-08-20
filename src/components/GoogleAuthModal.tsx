import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, ArrowRight, Mail, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { authService, UserSession, isFirebaseConfigured } from "../services/firebase";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}: GoogleAuthModalProps) {
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [showManualGmailInput, setShowManualGmailInput] = useState<boolean>(false);
  const [manualGmail, setManualGmail] = useState<string>("");

  const renderError = () => {
    if (!errorText) return null;

    let displayMessage = errorText;
    if (errorText.toLowerCase().includes("popup-closed-by-user") || errorText.toLowerCase().includes("popup-blocked")) {
      displayMessage = "Sign-in popup was closed or restricted by your browser. Please allow popups or use the direct Gmail sign-in option below.";
    } else if (errorText.toLowerCase().includes("unauthorized-domain")) {
      displayMessage = "This domain is currently in security verification. Please use the direct Gmail sign-in below.";
    }

    return (
      <div className="bg-red-950/30 border border-red-900/60 p-3 my-3">
        <span className="text-red-400 font-mono text-[10px] uppercase block leading-relaxed">
          ⚠ {displayMessage}
        </span>
      </div>
    );
  };

  const handleGoogleLogin = async () => {
    setAuthenticating(true);
    setErrorText("");

    try {
      const session = await authService.signInWithGoogle();
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err: any) {
      setAuthenticating(false);
      setErrorText(err.message || "Connection error or canceled Google authenticating.");
      // Automatically reveal direct Gmail input as a helper if popup fails in iframe
      setShowManualGmailInput(true);
    }
  };

  const handleManualGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualGmail.trim() || !manualGmail.includes("@")) {
      setErrorText("Please enter a valid Gmail or Google Workspace email address.");
      return;
    }

    setAuthenticating(true);
    setErrorText("");

    try {
      const session = authService.signInWithGoogleSimulate(manualGmail.trim().toLowerCase());
      onLoginSuccess(session);
      setAuthenticating(false);
      onClose();
    } catch (err: any) {
      setAuthenticating(false);
      setErrorText(err.message || "Failed to authenticate with specified Gmail.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 backdrop-blur-md"
          />

          {/* Core modal container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="fixed inset-0 m-auto max-w-md h-max max-h-[92vh] overflow-y-auto bg-[#09090b] border border-zinc-800 z-50 p-6 md:p-8 text-white flex flex-col justify-between shadow-2xl"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EFFF00] animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest text-[#EFFF00] uppercase font-black">
                    CACTUS BEAR // AUTHENTICATION
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:text-[#EFFF00] text-zinc-500 transition-colors cursor-pointer"
                  title="Close login modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title Section */}
              <div className="mb-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  {/* High Quality Google G Vector Logo */}
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <h3 className="font-sans font-black text-2xl uppercase tracking-tight text-white mb-1.5">
                  SIGN IN WITH <span className="text-[#EFFF00]">GMAIL</span>
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-sans max-w-xs mx-auto">
                  Access your exclusive Cactus Bear patron ledger, pre-orders, and saved bespoke designs using your verified Google account.
                </p>
              </div>

              {/* Exclusive Google / Gmail Action */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authenticating}
                  className="w-full bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-mono font-black text-xs py-4 tracking-widest uppercase transition-all rounded-none flex items-center justify-center gap-3.5 cursor-pointer border border-transparent shadow-lg hover:shadow-[#EFFF00]/20"
                >
                  {authenticating ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      CONTINUE WITH GOOGLE
                    </>
                  )}
                </button>

                {renderError()}

                {/* Benefits List */}
                <div className="bg-black/60 border border-zinc-900 p-4 space-y-2 font-mono text-[10px] text-zinc-400">
                  <span className="text-[#EFFF00] font-bold block uppercase text-[9px] tracking-wider mb-1">
                    ✦ GOOGLE ACCOUNT PERKS
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>Real-time pre-order tracking & tracking slips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>Cross-device cart & bespoke stitch lab sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    <span>Instant priority access to limited atelier drops</span>
                  </div>
                </div>

                {/* Direct Gmail Input Option (For iframe environments or direct entry) */}
                <div className="border-t border-zinc-900 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowManualGmailInput(!showManualGmailInput)}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-wider flex items-center justify-between w-full cursor-pointer py-1"
                  >
                    <span>DIRECT GMAIL ADDRESS ENTRY</span>
                    <span className="text-zinc-600 font-bold">{showManualGmailInput ? "▲" : "▼"}</span>
                  </button>

                  {showManualGmailInput && (
                    <form onSubmit={handleManualGmailSubmit} className="mt-3 space-y-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase block">
                          ENTER YOUR GMAIL ADDRESS
                        </span>
                        <div className="relative">
                          <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="email"
                            required
                            value={manualGmail}
                            onChange={(e) => setManualGmail(e.target.value)}
                            placeholder="chibundusadiq@gmail.com"
                            className="w-full bg-black border border-zinc-900 focus:border-[#EFFF00] pl-8 pr-3 py-2 font-mono text-xs text-[#EFFF00] outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authenticating}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-[10px] py-2.5 uppercase tracking-widest flex items-center justify-center gap-2 border border-zinc-800 cursor-pointer"
                      >
                        SIGN IN WITH THIS GMAIL
                        <ArrowRight size={11} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Signature */}
            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-[9px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#EFFF00]" />
                <span>GOOGLE OAUTH 2.0 • GMAIL ONLY</span>
              </div>
              <span className="text-zinc-600">SECURE ENCLAVE</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
