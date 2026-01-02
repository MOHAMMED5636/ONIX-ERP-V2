import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserCircleIcon, LockClosedIcon, GlobeAltIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { ROLES, getRoleRedirectPath } from "../utils/auth";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../services/authAPI";

const translations = {
  en: {
    title: "Tender Engineer Login",
    username: "Email",
    password: "Password",
    login: "Login",
    required: "is required",
    invalidEmail: "Invalid email address",
    en: "EN",
    ar: "AR",
    emailPlaceholder: "Enter your email address",
    passPlaceholder: "Enter your password",
    forgot: "Forgot Password?",
    description: "Access your assigned tender projects",
  },
  ar: {
    title: "تسجيل دخول مهندس المناقصات",
    username: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    required: "مطلوب",
    invalidEmail: "عنوان البريد الإلكتروني غير صحيح",
    en: "EN",
    ar: "AR",
    emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
    passPlaceholder: "أدخل كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
    description: "الوصول إلى مشاريع المناقصات المخصصة لك",
  },
};

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validate({ email, password, lang }) {
  const t = translations[lang];
  const errors = {};
  
  if (!email) {
    errors.email = t.required;
  } else if (!validateEmail(email)) {
    errors.email = t.invalidEmail;
  }
  
  if (!password) {
    errors.password = t.required;
  }
  
  return errors;
}

export default function TenderEngineerLogin() {
  const [lang, setLang] = useState("en");
  const [dir, setDir] = useState("ltr");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthUser } = useAuth();

  const t = translations[lang];
  // Always redirect to Tender Engineer dashboard - ignore any returnTo to prevent main ERP access
  // Never use location.state?.from?.pathname as it might point to main ERP routes

  const handleLangToggle = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
    setDir((prev) => (prev === "ltr" ? "rtl" : "ltr"));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const errs = validate({ email, password, lang });
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      
      try {
        // Call backend API for authentication
        const response = await login(
          email.trim().toLowerCase(),
          password,
          ROLES.TENDER_ENGINEER
        );
        
        if (response.success && response.data) {
          // Store token and set auth user via AuthContext
          const user = response.data.user || response.data;
          
          if (response.data.token) {
            // Use AuthContext login method to store token and fetch user profile
            await setAuthUser(response.data.token);
          }
          
          setLoading(false);
          
          // Always redirect to Tender Engineer dashboard, never to main ERP
          const redirectPath = getRoleRedirectPath(user.role || ROLES.TENDER_ENGINEER);
          navigate(redirectPath, { replace: true });
        } else {
          setLoading(false);
          setLoginError(lang === "en" 
            ? response.message || "Invalid email or password." 
            : "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoading(false);
        setLoginError(lang === "en" 
          ? error.message || "Invalid email or password." 
          : "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-purple-100" dir={dir}>
      {/* Animated SVG Blob background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="engineerBlobGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 400 300" to="360 400 300" dur="24s" repeatCount="indefinite" />
            <path d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z" fill="url(#engineerBlobGrad)" />
          </g>
        </svg>
      </div>
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-60 z-10" />
      <div className="relative z-30 w-full max-w-3xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden glass-card animate-fade-in">
        {/* Branding Panel */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-700 to-indigo-500 text-white">
          <div className="mb-4 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center animate-logo-glow mb-2">
              <img
                src={require("../assets/onix-logo.png")}
                alt="ONIX Engineering Consultancy"
                className="w-20 h-20 drop-shadow-lg rounded-full"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
            </div>
            <h2 className="text-2xl font-bold tracking-wide mt-2">Tender Engineer Portal</h2>
            <p className="text-sm mt-2 opacity-80 text-center">{t.description}</p>
          </div>
        </div>
        {/* Login Form Panel */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white/80 relative">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLangToggle}
            className="absolute top-4 right-4 text-indigo-700 font-bold border border-indigo-700 rounded-full px-4 py-1 text-xs hover:bg-indigo-50 transition flex items-center gap-1 shadow"
            style={{ left: lang === "ar" ? 16 : "auto", right: lang === "en" ? 16 : "auto" }}
          >
            <GlobeAltIcon className="h-4 w-4" />
            {lang === "en" ? `${t.en} | ${t.ar}` : `${t.ar} | ${t.en}`}
          </button>
          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center animate-fade-in">{t.title}</h2>
            <div>
              <label className="block text-gray-700 mb-1 font-semibold" htmlFor="email">{t.username}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"><UserCircleIcon className="h-5 w-5" /></span>
                <input
                  id="email"
                  type="email"
                  className={`w-full pl-10 pr-4 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-200 ${errors.email ? "border-red-400" : "border-indigo-100 focus:border-indigo-400"}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  dir={dir}
                  autoFocus={lang === "en"}
                />
              </div>
              {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-semibold" htmlFor="password">{t.password}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"><LockClosedIcon className="h-5 w-5" /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-10 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm shadow-sm transition-all duration-200 ${errors.password ? "border-red-400" : "border-indigo-100 focus:border-indigo-400"}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passPlaceholder}
                  dir={dir}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.938-1.938" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 1.657-.336 3.234-.938 4.675A9.956 9.956 0 0112 21c-2.21 0-4.267-.72-5.938-1.938A9.956 9.956 0 012 12c0-1.657.336-3.234.938-4.675A9.956 9.956 0 0112 3c2.21 0 4.267.72 5.938 1.938A9.956 9.956 0 0122 12z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="text-red-500 text-xs mt-1">{t.password} {errors.password}</div>}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-2 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-lg login-pop"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : <ArrowRightOnRectangleIcon className="h-6 w-6" />}
              {t.login}
            </button>
            {loginError && <div className="text-red-500 text-xs mt-2 text-center animate-fade-in">{loginError}</div>}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Demo: engineer@onixgroup.ae / engineer@123
              </p>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-logo-glow { animation: logoGlow 2.5s infinite alternate; }
        @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #818cf833, 0 0 0 0 #a78bfa33; } 100% { box-shadow: 0 0 16px 4px #818cf866, 0 0 32px 8px #a78bfa66; } }
        .login-pop { animation: loginPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes loginPop { from { transform: scale(0.95);} to { transform: scale(1);} }
      `}</style>
    </div>
  );
}

