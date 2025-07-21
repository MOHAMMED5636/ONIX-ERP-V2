import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";

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
      if (!/[a-zA-Z]/.test(detect.value)) {
        errors.userInput = t.invalidUsername;
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
    const errs = validate({ userInput, password, lang });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 800)); // Simulate loading
      const detect = smartDetect(userInput);
      if (
        detect.type === "username" &&
        detect.value.toLowerCase() === "admin" &&
        password === "admin123"
      ) {
        setLoading(false);
        localStorage.setItem('isAuthenticated', 'true');
        navigate("/dashboard", { state: { lang, dir } });
      } else {
        setLoading(false);
        setLoginError(lang === "en" ? "Invalid username or password." : "اسم المستخدم أو كلمة المرور غير صحيحة.");
      } 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir={dir}>
      {/* ONIX logo as main background */}
      <img
        src={"/onix-bg.png"}
        alt="ONIX Background"
        className="absolute inset-0 w-full h-full object-contain z-0"
        style={{ opacity: 0.12 }}
      />
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-60 z-20" />
      <div className="relative z-30 w-full max-w-3xl flex flex-col md:flex-row rounded-xl shadow-lg overflow-hidden">
        {/* Branding Panel */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-700 to-cyan-500 text-white">
          <div className="mb-4 flex flex-col items-center">
            <img
              src={require("../assets/onix-logo.png")}
              alt="ONIX Engineering Consultancy"
              className="w-36 h-auto mb-4 drop-shadow-lg bg-white rounded-lg p-2"
              style={{ background: "rgba(255,255,255,0.95)" }}
            />
            <h2 className="text-2xl font-bold tracking-wide mt-2">ERP System</h2>
            <p className="text-sm mt-2 opacity-80 text-center">Integrated Solution for HR, Tasks, Leave, and More</p>
          </div>
        </div>
        {/* Login Form Panel */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white bg-opacity-90 relative">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLangToggle}
            className="absolute top-4 right-4 text-cyan-700 font-bold border border-cyan-700 rounded px-3 py-1 text-xs hover:bg-cyan-50 transition"
            style={{ left: lang === "ar" ? 16 : "auto", right: lang === "en" ? 16 : "auto" }}
          >
            {lang === "en" ? `${t.en} | ${t.ar}` : `${t.ar} | ${t.en}`}
          </button>
          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-6 mt-8">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-4 text-center">{t.login}</h2>
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="userInput">{t.username} / {t.mobile}</label>
                <input
                  id="userInput"
                  type="text"
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-gray-50 ${errors.userInput ? "border-red-400" : ""}`}
                  value={userInput}
                  onChange={handleUserInput}
                  placeholder={t.userPlaceholder}
                  dir={dir}
                  autoFocus={lang === "en"}
                />
                {errors.userInput && <div className="text-red-500 text-xs mt-1">{errors.userInput}</div>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="password">{t.password}</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-gray-50 pr-10 ${errors.password ? "border-red-400" : ""}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.passPlaceholder}
                    dir={dir}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-cyan-600"
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
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-2 rounded shadow transition flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : null}
                {t.login}
              </button>
              {loginError && <div className="text-red-500 text-xs mt-2 text-center">{loginError}</div>}
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="text-cyan-700 hover:underline text-sm"
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
    </div>
  );
} 