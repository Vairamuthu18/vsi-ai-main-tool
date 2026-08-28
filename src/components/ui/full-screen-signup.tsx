"use client";
 
import { SunIcon as Sunburst, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface FullScreenSignupProps {
  onLoginSubmit?: (email: string, password: string) => Promise<void> | void;
  isLoading?: boolean;
  authError?: string;
  clearAuthError?: () => void;
}
 
export const FullScreenSignup = ({
  onLoginSubmit,
  isLoading = false,
  authError = "",
  clearAuthError,
}: FullScreenSignupProps = {}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 6;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    setSubmitted(true);
 
    if (valid) {
      if (onLoginSubmit) {
        await onLoginSubmit(email, password);
      } else {
        console.log("Form submitted!");
        console.log("Email:", email);
        alert("Form submitted!");
        setEmail("");
        setPassword("");
        setSubmitted(false);
      }
    }
  };
 
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-12 font-sans selection:bg-orange-500 selection:text-white">
      {/* Outer Card with subtle shadow and border */}
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row rounded-3xl border border-slate-200/90 shadow-2xl bg-white min-h-[540px]">
        
        {/* Left Side: Dark Hero Image Panel with Glowing Orange Pillars & Dashboard Copy */}
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-l-3xl md:rounded-r-none rounded-t-3xl md:rounded-bl-3xl overflow-hidden flex flex-col justify-between z-10 min-h-[460px]">
          {/* Top Gradient Overlay */}
          <div className="w-full h-full z-2 absolute inset-0 bg-gradient-to-t from-transparent via-black/40 to-black/80 pointer-events-none"></div>
          
          {/* Vertical Glowing Pillar Strips matching original image design */}
          <div className="flex absolute inset-0 z-2 overflow-hidden backdrop-blur-2xl pointer-events-none">
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
            <div className="h-[40rem] z-2 w-[4rem] bg-gradient-to-r from-transparent via-black via-[69%] to-white/20 opacity-30 overflow-hidden"></div>
          </div>
          
          {/* Bottom Glowing Orbs */}
          <div className="w-[16rem] h-[16rem] bg-orange-500/90 blur-xl absolute z-1 rounded-full -bottom-10 -left-10 pointer-events-none"></div>
          <div className="w-[10rem] h-[6rem] bg-white/40 blur-lg absolute z-1 rounded-full bottom-0 left-4 pointer-events-none"></div>
          <div className="w-[8rem] h-[5rem] bg-orange-400/50 blur-md absolute z-1 rounded-full bottom-2 left-16 pointer-events-none"></div>
 
          {/* Dashboard Platform Content */}
          <div className="relative z-10 my-auto flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide w-fit">
              VSI AI Suite • GEO Platform
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              AI Search Intelligence & GEO platform for enterprise brands.
            </h1>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-normal mt-1">
              Monitor AI search mentions, citation share of voice, and brand visibility across ChatGPT, Perplexity, Gemini & Claude.
            </p>
          </div>

          <div className="relative z-10 text-xs text-zinc-400 font-medium">
            © ValGrow Labs • Generative Engine Optimization
          </div>
        </div>
 
        {/* Right Side: Form Panel with Clean White Background */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white text-slate-900 z-10">
          <div className="flex flex-col items-start mb-6">
            <div className="text-orange-500 mb-3 drop-shadow-sm">
              <Sunburst className="h-10 w-10 stroke-[2]" />
            </div>
            <h2 className="text-3xl font-bold mb-1.5 tracking-tight text-slate-900">
              Get Started
            </h2>
            <p className="text-left text-slate-500 text-sm">
              Welcome to VSI AI Suite — Sign in to your dashboard
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}
 
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm mb-1.5 font-semibold text-slate-700">
                Your email
              </label>
              <input
                type="email"
                id="email"
                className={`text-sm font-medium w-full py-2.5 px-3.5 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-slate-900 focus:bg-white focus:ring-orange-500 transition-all ${
                  emailError ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                  if (clearAuthError) clearAuthError();
                }}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                autoComplete="email"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1 font-medium">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-1.5 font-semibold text-slate-700">
                Create new password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`text-sm font-medium w-full py-2.5 pl-3.5 pr-10 border rounded-xl focus:outline-none focus:ring-2 bg-slate-50 text-slate-900 focus:bg-white focus:ring-orange-500 transition-all ${
                    passwordError ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (clearAuthError) clearAuthError();
                  }}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 focus:text-slate-600 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1 font-medium">
                  {passwordError}
                </p>
              )}
            </div>
 
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-500/20 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
 
            <div className="text-center text-slate-500 text-sm mt-1">
              Already have account?{" "}
              <a href="/login" className="text-orange-600 font-semibold hover:underline">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
