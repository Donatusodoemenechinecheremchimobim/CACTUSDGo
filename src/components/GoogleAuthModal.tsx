import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { authService, UserSession } from "../services/firebase";

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
  const [manualGmail, setManualGmail] = useState<string>("");

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
      const msg = err.message || "";
      if (msg.toLowerCase().includes("popup-closed-by-user") || msg.toLowerCase().includes("popup-blocked")) {
        setErrorText("Popup was closed. You can also sign in by typing your Gmail below.");
      } else {
        setErrorText("Google sign-in is unavailable in this view. Please enter your Gmail below.");
      }
    }
  };

  const handleManualGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualGmail.trim() || !manualGmail.includes("@")) {
      setErrorText("Please enter a valid Gmail address.");
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
      setErrorText(err.message || "Failed to sign in. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Simple & Clean Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 text-white shadow-2xl z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header / Logo */}
            <div className="text-center mb-6 pt-2">
              <div className="w-12 h-12 mx-auto mb-3.5 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shadow-inner">
                {/* Clean Google G Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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

              <h3 className="font-sans font-bold text-xl text-white">
                Sign in to Cactus Bear
              </h3>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                Sign in with your Google account to track orders and save your wishlist.
              </p>
            </div>

            {/* Error Message */}
            {errorText && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2.5 mb-4 text-center"
              >
                <span className="text-amber-300 text-xs block leading-tight">
                  {errorText}
                </span>
              </motion.div>
            )}

            {/* Google Sign In Action */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authenticating}
                className="w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-medium text-xs sm:text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md active:scale-[0.99]"
              >
                {authenticating ? (
                  <div className="w-4 h-4 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    Continue with Google
                  </>
                )}
              </button>

              {/* Simple Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-[1px] bg-zinc-800 flex-1" />
                <span className="text-[11px] text-zinc-500 font-sans">or sign in with email</span>
                <div className="h-[1px] bg-zinc-800 flex-1" />
              </div>

              {/* Simple Email Input */}
              <form onSubmit={handleManualGmailSubmit} className="space-y-2.5">
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={manualGmail}
                    onChange={(e) => setManualGmail(e.target.value)}
                    placeholder="Enter your Gmail"
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-zinc-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 font-medium text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-800 cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
