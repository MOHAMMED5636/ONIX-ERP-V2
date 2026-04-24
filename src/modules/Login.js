import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import { UserCircleIcon, LockClosedIcon, GlobeAltIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { getRoleRedirectPath } from "../utils/auth";
import { enrichUserFromToken } from "../utils/jwtPayload";
import { login as apiLogin, requestLoginOtp, verifyLoginOtp } from "../services/authAPI";
import { useAuth } from "../contexts/AuthContext";
import * as authStorage from "../utils/authStorage";

const translations = {
  en: {
    username: "Username",
    email: "Email",
    mobile: "Mobile Number",
    password: "Password",
    login: "Login",
    loginAs: "Login as",
    admin: "Admin",
    employee: "Employee",
    required: "is required",
    invalidMobile: "Invalid mobile number",
    invalidUsername: "Username must include letters",
    en: "EN",
    ar: "AR",
    userPlaceholder: "Enter your email or mobile number",
    mobilePlaceholder: "Enter your mobile number",
    passPlaceholder: "Enter your password",
    forgot: "Forgot Password?",
  },
  ar: {
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    mobile: "رقم الجوال",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    loginAs: "تسجيل الدخول كـ",
    admin: "مدير",
    employee: "موظف",
    required: "مطلوب",
    invalidMobile: "رقم الجوال غير صحيح",
    invalidUsername: "يجب أن يحتوي اسم المستخدم على أحرف",
    en: "EN",
    ar: "AR",
    userPlaceholder: "ادخل بريدك الإلكتروني أو رقم الجوال",
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
  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: setAuthUser, isAuthenticated, user } = useAuth();
  
  // Redirect if already authenticated - based on role
  React.useEffect(() => {
    if (isAuthenticated && user) {
      // Check if password change is required first
      if (user.forcePasswordChange) {
        navigate('/change-password', { state: { lang, dir }, replace: true });
        return;
      }
      
      // Redirect based on user role - TENDER_ENGINEER goes to tender dashboard
      const redirectPath = getRoleRedirectPath(user.role);
      navigate(redirectPath, { state: { lang, dir }, replace: true });
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoginError("");
    setErrors({});
    
    // Validate email input
    const detect = smartDetect(userInput);
    let email = '';
    
    if (detect.type === "username" && detect.value.includes('@')) {
      email = detect.value.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setErrors({ userInput: lang === "en" ? "Invalid email format" : "تنسيق البريد الإلكتروني غير صحيح" });
        return;
      }
    } else {
      setErrors({ userInput: lang === "en" ? "Please enter a valid email address" : "يرجى إدخال عنوان بريد إلكتروني صحيح" });
      return;
    }
    
    setOtpLoading(true);
    try {
      const response = await requestLoginOtp(email);
      if (response.success) {
        setOtpSent(true);
        setLoginError("");
        setOtp("");
      } else {
        setLoginError(lang === "en" ? response.message || "Failed to send OTP" : response.message || "فشل إرسال رمز التحقق");
      }
    } catch (error) {
      console.error('Request OTP error:', error);
      setLoginError(lang === "en" 
        ? error.message || "Failed to send OTP. Please try again." 
        : error.message || "فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoginError("");
    setErrors({});
    
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setErrors({ otp: lang === "en" ? "Please enter a valid 6-digit OTP" : "يرجى إدخال رمز تحقق مكون من 6 أرقام" });
      return;
    }
    
    const detect = smartDetect(userInput);
    const email = detect.value.includes('@') ? detect.value.trim().toLowerCase() : '';
    
    setLoading(true);
    try {
      const response = await verifyLoginOtp(email, otp);
      
      if (response.success && response.data) {
        if (response.requiresPasswordChange) {
          try {
            if (response.data.token) {
              const snapshot = enrichUserFromToken(response.data.user, response.data.token);
              await setAuthUser(response.data.token, snapshot);
            }
            setLoading(false);
            navigate('/change-password', {
              state: {
                message: response.message || 'Password change required',
                lang,
                dir,
              },
              replace: true,
            });
          } catch (err) {
            setLoading(false);
            setLoginError(lang === 'en' ? 'Failed to load user profile.' : 'فشل تحميل ملف المستخدم.');
          }
          return;
        }

        if (response.data.token) {
          try {
            const snapshot = enrichUserFromToken(response.data.user, response.data.token);
            await setAuthUser(response.data.token, snapshot);
            setLoading(false);
            const redirectPath = getRoleRedirectPath(snapshot?.role);
            navigate(redirectPath, { state: { lang, dir }, replace: true });
          } catch (err) {
            setLoading(false);
            setLoginError(lang === "en" ? "Failed to load user profile." : "فشل تحميل ملف المستخدم.");
          }
        } else {
          setLoading(false);
          setLoginError(lang === "en" ? "Invalid OTP." : "رمز التحقق غير صحيح.");
        }
      } else {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid OTP." : "رمز التحقق غير صحيح.");
      }
    } catch (error) {
      setLoading(false);
      console.error('Verify OTP error:', error);
      setLoginError(lang === "en" 
        ? error.message || "Invalid OTP. Please try again." 
        : error.message || "رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.");
    }
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
      // Determine email or mobile from userInput
      const detect = smartDetect(userInput);
      let emailOrMobile = '';
      
      if (detect.type === "username") {
        if (detect.value.includes('@')) {
          emailOrMobile = detect.value.trim().toLowerCase();
        } else {
          const username = detect.value.toLowerCase();
          if (username === "admin") {
            emailOrMobile = "admin@onixgroup.ae";
          } else if (username === "engineer" || username.includes("engineer")) {
            emailOrMobile = "engineer@onixgroup.ae";
          } else {
            emailOrMobile = `${detect.value}@onixgroup.ae`;
          }
        }
      } else if (detect.type === "mobile") {
        // Mobile number - send directly to backend (backend now supports mobile login)
        emailOrMobile = detect.value.trim();
      } else {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid input format." : "تنسيق الإدخال غير صحيح.");
        return;
      }
      
      // Unified login - no role selection needed
      const response = await apiLogin(emailOrMobile, password);
      
      if (response.success && response.data) {
        if (response.requiresPasswordChange) {
          try {
            if (response.data.token) {
              const snapshot = enrichUserFromToken(response.data.user, response.data.token);
              await setAuthUser(response.data.token, snapshot);
            }
            setLoading(false);
            navigate('/change-password', {
              state: {
                message: response.message || 'Password change required',
                lang,
                dir,
              },
              replace: true,
            });
          } catch (err) {
            setLoading(false);
            setLoginError(lang === 'en' ? 'Failed to load user profile.' : 'فشل تحميل ملف المستخدم.');
          }
          return;
        }

        if (response.data.token) {
          try {
            const snapshot = enrichUserFromToken(response.data.user, response.data.token);
            await setAuthUser(response.data.token, snapshot);
            setLoading(false);
            const redirectPath = getRoleRedirectPath(snapshot?.role);
            navigate(redirectPath, { state: { lang, dir }, replace: true });
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
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-x-hidden bg-gradient-to-br from-cyan-100 via-white to-indigo-100 py-4 sm:py-6 px-3 sm:px-4" dir={dir}>
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
      <div className="relative z-30 w-full max-w-[calc(100%-1.5rem)] sm:max-w-md md:max-w-2xl lg:max-w-3xl flex flex-col md:flex-row rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden glass-card animate-fade-in">
        {/* Branding Panel - compact on mobile */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-5 sm:p-6 md:p-8 bg-gradient-to-br from-cyan-700 to-cyan-500 text-white">
          <div className="mb-2 sm:mb-4 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-white shadow-lg flex items-center justify-center animate-logo-glow mb-2">
              <img
                src={require("../assets/onix-logo.png")}
                alt="ONIX Engineering Consultancy"
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 drop-shadow-lg rounded-full"
                style={{ background: "rgba(255,255,255,0.95)" }}
              />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide mt-1 sm:mt-2">ERP System</h2>
            <p className="text-xs sm:text-sm mt-1 sm:mt-2 opacity-80 text-center max-w-[200px] sm:max-w-none">Integrated Solution for HR, Tasks, Leave, and More</p>
          </div>
        </div>
        {/* Login Form Panel */}
        <div className="md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-center bg-white/80 relative min-w-0">
          {/* Language Toggle - touch-friendly, doesn't overlap on small screens */}
          <button
            type="button"
            onClick={handleLangToggle}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center sm:justify-start text-cyan-700 font-bold border border-cyan-700 rounded-full px-3 sm:px-4 py-2 sm:py-1 text-xs hover:bg-cyan-50 transition gap-1 shadow"
            style={{ left: lang === "ar" ? 12 : "auto", right: lang === "en" ? 12 : "auto" }}
            aria-label="Toggle language"
          >
            <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{lang === "en" ? `${t.en} | ${t.ar}` : `${t.ar} | ${t.en}`}</span>
          </button>
          {!showForgot ? (
            <form onSubmit={loginMethod === "otp" ? (otpSent ? handleVerifyOtp : handleRequestOtp) : handleLogin} className="space-y-4 sm:space-y-5 md:space-y-6 mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-700 mb-2 text-center animate-fade-in">{t.login}</h2>
              
              {/* Login Method Toggle: Password / OTP */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-gray-600">{lang === "en" ? "Login with:" : "تسجيل الدخول بـ:"}</span>
                <div className="inline-flex rounded-full bg-gray-100 p-1 border border-gray-200 login-toggle-track w-full sm:w-auto justify-center">
                  <button
                    type="button"
                    onClick={() => { 
                      setLoginMethod("password"); 
                      setOtpSent(false);
                      setOtp("");
                      setLoginError(""); 
                    }}
                    className={`login-toggle-btn flex-1 sm:flex-none min-h-[44px] px-3 sm:px-4 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-out touch-manipulation ${loginMethod === "password" ? "login-toggle-active bg-cyan-600 text-white shadow-md scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200/60"}`}
                  >
                    {lang === "en" ? "Password" : "كلمة المرور"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setLoginMethod("otp"); 
                      setOtpSent(false);
                      setOtp("");
                      setPassword("");
                      setLoginError(""); 
                    }}
                    className={`login-toggle-btn flex-1 sm:flex-none min-h-[44px] px-3 sm:px-4 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-out touch-manipulation ${loginMethod === "otp" ? "login-toggle-active bg-cyan-600 text-white shadow-md scale-105" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200/60"}`}
                  >
                    {lang === "en" ? "Email OTP" : "رمز البريد الإلكتروني"}
                  </button>
                </div>
              </div>
              
              <div key={loginMethod} className="animate-toggle-change">
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold text-sm sm:text-base" htmlFor="userInput">
                    {loginMethod === "otp" ? t.email : `${t.email} / ${t.mobile}`}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none"><UserCircleIcon className="h-5 w-5" /></span>
                    <input
                      id="userInput"
                      type={loginMethod === "otp" ? "email" : "text"}
                      inputMode={loginMethod === "otp" ? "email" : "email"}
                      autoComplete="username"
                      className={`w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base sm:text-sm min-h-[48px] touch-manipulation shadow-sm transition-all duration-200 ${errors.userInput ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
                      value={userInput}
                      onChange={handleUserInput}
                      placeholder={loginMethod === "otp" ? (lang === "en" ? "Enter your email address" : "أدخل عنوان بريدك الإلكتروني") : t.userPlaceholder}
                      dir={dir}
                      autoFocus={lang === "en"}
                      disabled={otpSent}
                    />
                  </div>
                  {errors.userInput && <div className="text-red-500 text-xs mt-1">{errors.userInput}</div>}
                </div>

                {loginMethod === "otp" ? (
                  <>
                    {!otpSent ? (
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 active:from-cyan-700 active:to-indigo-700 text-white font-bold py-3 sm:py-2.5 rounded-xl sm:rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px] touch-manipulation login-pop"
                        disabled={otpLoading}
                      >
                        {otpLoading ? (
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        )}
                        {otpLoading ? (lang === "en" ? "Sending..." : "جاري الإرسال...") : (lang === "en" ? "Send OTP" : "إرسال رمز التحقق")}
                      </button>
                    ) : (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                          <p className="text-sm text-green-800 text-center">
                            {lang === "en" 
                              ? "✓ OTP sent to your email. Please check your inbox and enter the 6-digit code below." 
                              : "✓ تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد وإدخال الرمز المكون من 6 أرقام أدناه."}
                          </p>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 font-semibold text-sm sm:text-base" htmlFor="otp">
                            {lang === "en" ? "Enter OTP Code" : "أدخل رمز التحقق"}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </span>
                            <input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              maxLength="6"
                              autoComplete="one-time-code"
                              className={`w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl sm:rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-center text-2xl font-bold tracking-widest text-base sm:text-sm min-h-[48px] touch-manipulation shadow-sm transition-all duration-200 ${errors.otp ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
                              value={otp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtp(value);
                                if (errors.otp) setErrors({ ...errors, otp: null });
                              }}
                              placeholder="000000"
                              dir="ltr"
                              autoFocus
                            />
                          </div>
                          {errors.otp && <div className="text-red-500 text-xs mt-1">{errors.otp}</div>}
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtp("");
                              setLoginError("");
                            }}
                            className="text-cyan-700 hover:underline text-xs sm:text-sm mt-2 w-full text-center"
                          >
                            {lang === "en" ? "← Change email or resend OTP" : "← تغيير البريد الإلكتروني أو إعادة إرسال الرمز"}
                          </button>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 active:from-cyan-700 active:to-indigo-700 text-white font-bold py-3 sm:py-2.5 rounded-xl sm:rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px] touch-manipulation login-pop"
                          disabled={loading || otp.length !== 6}
                        >
                          {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          ) : <ArrowRightOnRectangleIcon className="h-6 w-6" />}
                          {lang === "en" ? "Verify & Login" : "التحقق وتسجيل الدخول"}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold text-sm sm:text-base" htmlFor="password">{t.password}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none"><LockClosedIcon className="h-5 w-5" /></span>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className={`w-full pl-10 pr-12 sm:pr-10 py-3 sm:py-2.5 rounded-xl sm:rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-base sm:text-sm min-h-[48px] touch-manipulation shadow-sm transition-all duration-200 ${errors.password ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={t.passPlaceholder}
                          dir={dir}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-cyan-600 touch-manipulation"
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
                      className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 active:from-cyan-700 active:to-indigo-700 text-white font-bold py-3 sm:py-2.5 rounded-xl sm:rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px] touch-manipulation login-pop"
                      disabled={loading}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      ) : <ArrowRightOnRectangleIcon className="h-6 w-6" />}
                      {t.login}
                    </button>
                    {loginError && <div className="text-red-500 text-xs sm:text-sm mt-2 text-center animate-fade-in px-1">{loginError}</div>}
                    <div className="text-center mt-3 sm:mt-4">
                      <button
                        type="button"
                        className="text-cyan-700 hover:underline text-sm font-semibold forgot-pop min-h-[44px] inline-flex items-center justify-center touch-manipulation"
                        onClick={() => setShowForgot(true)}
                      >
                        {t.forgot}
                      </button>
                    </div>
                  </>
                )}
                
                {loginMethod === "otp" && loginError && <div className="text-red-500 text-xs sm:text-sm mt-2 text-center animate-fade-in px-1">{loginError}</div>}
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
        .login-toggle-track { transition: box-shadow 0.3s ease; }
        .login-toggle-track:hover { box-shadow: 0 2px 8px rgba(6, 182, 212, 0.15); }
        .login-toggle-btn { transform-origin: center; }
        .login-toggle-active { animation: togglePulse 0.4s ease-out; }
        @keyframes togglePulse { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1.05); } }
        .animate-toggle-change { animation: toggleChange 0.35s ease-out; }
        @keyframes toggleChange { from { opacity: 0.6; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
} 