import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import { UserCircleIcon, LockClosedIcon, GlobeAltIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { ROLES, getRoleRedirectPath } from "../utils/auth";
import { login as apiLogin } from "../services/authAPI";
import { useAuth } from "../contexts/AuthContext";

const translations = {
  en: {
    username: "Username",
    mobile: "Mobile Number",
    password: "Password",
    login: "Login",
    required: "is required",
    invalidMobile: "Invalid mobile number",
    invalidUsername: "Username must include letters",
    en: "EN",
    ar: "AR",
    userPlaceholder: "Enter your username or mobile number",
    mobilePlaceholder: "Enter your mobile number",
    passPlaceholder: "Enter your password",
    forgot: "Forgot Password?",
  },
  ar: {
    username: "اسم المستخدم",
    mobile: "رقم الجوال",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    required: "مطلوب",
    invalidMobile: "رقم الجوال غير صحيح",
    invalidUsername: "يجب أن يحتوي اسم المستخدم على أحرف",
    en: "EN",
    ar: "AR",
    userPlaceholder: "ادخل اسم المستخدم أو رقم الجوال",
    mobilePlaceholder: "ادخل رقم الجوال",
    passPlaceholder: "ادخل كلمة المرور",
    forgot: "نسيت كلمة المرور؟",
  },
};

function smartDetect(input) {
  if (/^\d+$/.test(input)) {
    // Only digits: treat as mobile
    let mobile = input;
    if (mobile.length === 9 && !mobile.startsWith("0")) {
      mobile = "0" + mobile;
    }
    return { type: "mobile", value: mobile };
  } else if (/[a-zA-Z]/.test(input)) {
    // Contains letters: treat as username
    return { type: "username", value: input };
  } else {
    // Mix or empty
    return { type: "unknown", value: input };
  }
}

function validate({ userInput, password, lang }) {
  const t = translations[lang];
  const errors = {};
  if (!userInput) {
    errors.userInput = t.required;
  } else {
    const detect = smartDetect(userInput);
    if (detect.type === "mobile") {
      if (!/^0\d{9}$/.test(detect.value)) {
        errors.userInput = t.invalidMobile;
      }
    } else if (detect.type === "username") {
      // If it contains @, validate as email format
      if (detect.value.includes('@')) {
        // Trim and normalize email before validation
        const trimmedEmail = detect.value.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
          errors.userInput = lang === "en" ? "Invalid email format" : "تنسيق البريد الإلكتروني غير صحيح";
        }
      } else {
        // Regular username - just check it has letters
        if (!/[a-zA-Z]/.test(detect.value)) {
          errors.userInput = t.invalidUsername;
        }
      }
    } else {
      errors.userInput = t.required;
    }
  }
  if (!password) errors.password = t.required;
  return errors;
}

export default function Login() {
  const [lang, setLang] = useState("en");
  const [dir, setDir] = useState("ltr");
  const [userInput, setUserInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setAuthUser, isAuthenticated, user } = useAuth();
  
  // Redirect if already authenticated - based on role
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Check if password change is required first
      if (user.forcePasswordChange) {
        navigate('/change-password', { state: { lang, dir } });
        return;
      }
      
      // Redirect based on user role - TENDER_ENGINEER goes to tender dashboard
      const redirectPath = getRoleRedirectPath(user.role);
      navigate(redirectPath, { state: { lang, dir } });
    }
  }, [isAuthenticated, user, navigate, lang, dir]);

  const t = translations[lang];

  const handleLangToggle = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
    setDir((prev) => (prev === "ltr" ? "rtl" : "ltr"));
  };

  const handleUserInput = (e) => {
    let value = e.target.value;
    // Smart auto-format for mobile
    if (/^\d+$/.test(value)) {
      if (value.length === 9 && !value.startsWith("0")) {
        value = "0" + value;
      }
    }
    setUserInput(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setErrors({}); // Clear previous errors
    
    // First validate input
    const errs = validate({ userInput, password, lang });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    setLoading(true);
    try {
      // Determine email from userInput
      const detect = smartDetect(userInput);
      let email = '';
      let role = ROLES.ADMIN; // Default role
      
      // Determine email and role from userInput
      if (detect.type === "username") {
        // If it's a username, try as email or construct email
        if (detect.value.includes('@')) {
          // It's already an email
          email = detect.value.trim().toLowerCase();
        } else {
          // Regular username - convert to email
          const username = detect.value.toLowerCase();
          if (username === "admin") {
            email = "admin@onixgroup.ae";
          } else if (username === "engineer" || username.includes("engineer")) {
            email = "engineer@onixgroup.ae";
          } else {
            email = `${detect.value}@onixgroup.ae`;
          }
        }
        
        // Auto-detect role based on email pattern
        const emailLower = email.toLowerCase();
        if (emailLower.includes('admin') || emailLower === 'admin@onixgroup.ae') {
          role = ROLES.ADMIN;
        } else if (emailLower.includes('engineer') || emailLower === 'engineer@onixgroup.ae') {
          role = ROLES.TENDER_ENGINEER;
        }
        // Otherwise defaults to ADMIN (already set above)
      } else if (detect.type === "mobile") {
        // Mobile number - can't use for email login
        setLoading(false);
        setLoginError(lang === "en" ? "Please use email or username for login." : "الرجاء استخدام البريد الإلكتروني أو اسم المستخدم لتسجيل الدخول.");
        return;
      } else {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid input format." : "تنسيق الإدخال غير صحيح.");
        return;
      }
      
      // Final email format check before sending (using same regex as backend)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid email format." : "تنسيق البريد الإلكتروني غير صحيح.");
        return;
      }
      
      // Call backend login API
      const response = await apiLogin(email, password, role);
      
      if (response.success && response.data) {
        // Check if password change is required
        if (response.requiresPasswordChange) {
          // Store token for password change endpoint
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          setLoading(false);
          // Redirect to password change page
          navigate('/change-password', { 
            state: { 
              message: response.message || 'Password change required',
              lang,
              dir 
            } 
          });
          return;
        }
        
        // Normal login flow
        if (response.data.token) {
          try {
            await setAuthUser(response.data.token);
            setLoading(false);
            
            // Get user role from response to redirect immediately
            // TENDER_ENGINEER must go to /erp/tender/dashboard, not /dashboard
            const userRole = response.data.user?.role || role;
            const redirectPath = getRoleRedirectPath(userRole);
            navigate(redirectPath, { state: { lang, dir } });
          } catch (err) {
            setLoading(false);
            setLoginError(lang === "en" ? "Failed to load user profile." : "فشل تحميل ملف المستخدم.");
          }
        } else {
          setLoading(false);
          setLoginError(lang === "en" ? "Invalid credentials." : "بيانات الاعتماد غير صحيحة.");
        }
      } else {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid credentials." : "بيانات الاعتماد غير صحيحة.");
      }
      } catch (error) {
        setLoading(false);
        console.error('Login error:', error);
        // If backend is not available, fallback to mock login for development
        const detect = smartDetect(userInput);
        if (
          detect.type === "username" &&
          detect.value.toLowerCase() === "admin" &&
          password === "admin123"
        ) {
          // Fallback mock login - not recommended, but kept for development
          // Note: This won't work with dynamic auth, backend should be running
          setLoginError(lang === "en" 
            ? "Backend server is not available. Please start the backend server." 
            : "الخادم غير متاح. يرجى تشغيل الخادم.");
        } else {
          setLoginError(lang === "en" 
            ? error.message || "Invalid username or password." 
            : error.message || "اسم المستخدم أو كلمة المرور غير صحيحة.");
        }
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-cyan-100 via-white to-indigo-100" dir={dir}>
      {/* Animated SVG Blob background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="loginBlobGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 400 300" to="360 400 300" dur="24s" repeatCount="indefinite" />
            <path d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z" fill="url(#loginBlobGrad)" />
          </g>
        </svg>
      </div>
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-60 z-10" />
      <div className="relative z-30 w-full max-w-3xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden glass-card animate-fade-in">
        {/* Branding Panel */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-700 to-cyan-500 text-white">
          <div className="mb-4 flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center animate-logo-glow mb-2">
              <img
                src={require("../assets/onix-logo.png")}
                alt="ONIX Engineering Consultancy"
                className="w-20 h-20 drop-shadow-lg rounded-full"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
            </div>
            <h2 className="text-2xl font-bold tracking-wide mt-2">ERP System</h2>
            <p className="text-sm mt-2 opacity-80 text-center">Integrated Solution for HR, Tasks, Leave, and More</p>
          </div>
        </div>
        {/* Login Form Panel */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white/80 relative">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLangToggle}
            className="absolute top-4 right-4 text-cyan-700 font-bold border border-cyan-700 rounded-full px-4 py-1 text-xs hover:bg-cyan-50 transition flex items-center gap-1 shadow"
            style={{ left: lang === "ar" ? 16 : "auto", right: lang === "en" ? 16 : "auto" }}
          >
            <GlobeAltIcon className="h-4 w-4" />
            {lang === "en" ? `${t.en} | ${t.ar}` : `${t.ar} | ${t.en}`}
          </button>
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <h2 className="text-2xl font-bold text-cyan-700 mb-4 text-center animate-fade-in">{t.login}</h2>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold" htmlFor="userInput">{t.username} / {t.mobile}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><UserCircleIcon className="h-5 w-5" /></span>
                  <input
                    id="userInput"
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm shadow-sm transition-all duration-200 ${errors.userInput ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
                    value={userInput}
                    onChange={handleUserInput}
                    placeholder={t.userPlaceholder}
                    dir={dir}
                    autoFocus={lang === "en"}
                  />
                </div>
                {errors.userInput && <div className="text-red-500 text-xs mt-1">{errors.userInput}</div>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold" htmlFor="password">{t.password}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><LockClosedIcon className="h-5 w-5" /></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full pl-10 pr-10 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm shadow-sm transition-all duration-200 ${errors.password ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.passPlaceholder}
                    dir={dir}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600"
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
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-bold py-2 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-lg login-pop"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : <ArrowRightOnRectangleIcon className="h-6 w-6" />}
                {t.login}
              </button>
              {loginError && <div className="text-red-500 text-xs mt-2 text-center animate-fade-in">{loginError}</div>}
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-cyan-700 hover:underline text-sm font-semibold forgot-pop"
                  onClick={() => setShowForgot(true)}
                >
                  {t.forgot}
                </button>
              </div>
            </form>
          ) : (
            <ForgotPassword lang={lang} dir={dir} onBack={() => setShowForgot(false)} />
          )}
        </div>
      </div>
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-logo-glow { animation: logoGlow 2.5s infinite alternate; }
        @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #a5b4fc33, 0 0 0 0 #67e8f933; } 100% { box-shadow: 0 0 16px 4px #a5b4fc66, 0 0 32px 8px #67e8f966; } }
        .login-pop { animation: loginPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes loginPop { from { transform: scale(0.95);} to { transform: scale(1);} }
        .forgot-pop { transition: color 0.2s, text-decoration 0.2s; }
        .forgot-pop:hover { color: #0e7490; text-decoration: underline; }
      `}</style>
    </div>
  );
} 