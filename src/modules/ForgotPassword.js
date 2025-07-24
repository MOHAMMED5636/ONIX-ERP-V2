import React, { useState } from "react";
import { UserCircleIcon, PhoneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const translations = {
  en: {
    forgot: "Forgot Password?",
    username: "Username",
    mobile: "Mobile Number",
    send: "Send Reset Code",
    required: "is required",
    invalidMobile: "Invalid mobile number",
    back: "Back to Login",
    userPlaceholder: "Enter your username",
    mobilePlaceholder: "Enter your mobile number",
    sent: "Reset code sent!",
  },
  ar: {
    forgot: "نسيت كلمة المرور؟",
    username: "اسم المستخدم",
    mobile: "رقم الجوال",
    send: "إرسال رمز التحقق",
    required: "مطلوب",
    invalidMobile: "رقم الجوال غير صحيح",
    back: "العودة لتسجيل الدخول",
    userPlaceholder: "ادخل اسم المستخدم",
    mobilePlaceholder: "ادخل رقم الجوال",
    sent: "تم إرسال رمز التحقق!",
  },
};

function validate({ username, mobile, lang }) {
  const t = translations[lang];
  const errors = {};
  if (!username && !mobile) {
    errors.username = t.required;
    errors.mobile = t.required;
  }
  if (username && !username.trim()) errors.username = t.required;
  if (mobile && !/^\d{8,15}$/.test(mobile)) errors.mobile = t.invalidMobile;
  return errors;
}

export default function ForgotPassword({ lang, dir, onBack }) {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const t = translations[lang];

  const handleSend = (e) => {
    e.preventDefault();
    const errs = validate({ username, mobile, lang });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto glass-card rounded-2xl shadow-2xl p-6 animate-fade-in" dir={dir}>
      <form onSubmit={handleSend} className="space-y-6 mt-2">
        <h2 className="text-2xl font-bold text-cyan-700 mb-4 text-center animate-fade-in">{t.forgot}</h2>
        <div>
          <label className="block text-gray-700 mb-1 font-semibold" htmlFor="fp-username">{t.username}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><UserCircleIcon className="h-5 w-5" /></span>
            <input
              id="fp-username"
              type="text"
              className={`w-full pl-10 pr-4 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm shadow-sm transition-all duration-200 ${errors.username ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={t.userPlaceholder}
              dir={dir}
            />
          </div>
          {errors.username && <div className="text-red-500 text-xs mt-1">{t.username} {errors.username}</div>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-semibold" htmlFor="fp-mobile">{t.mobile}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"><PhoneIcon className="h-5 w-5" /></span>
            <input
              id="fp-mobile"
              type="text"
              className={`w-full pl-10 pr-4 py-2 rounded-full border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm shadow-sm transition-all duration-200 ${errors.mobile ? "border-red-400" : "border-cyan-100 focus:border-cyan-400"}`}
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder={t.mobilePlaceholder}
              dir={dir}
            />
          </div>
          {errors.mobile && <div className="text-red-500 text-xs mt-1">{t.mobile} {errors.mobile}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-bold py-2 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-lg forgot-pop"
        >
          <ArrowPathIcon className="h-6 w-6" />
          {t.send}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full mt-2 text-cyan-700 hover:underline text-sm font-semibold forgot-pop"
        >
          {t.back}
        </button>
        {sent && <div className="text-green-600 text-center mt-2 animate-fade-in">{t.sent}</div>}
      </form>
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .forgot-pop { transition: color 0.2s, text-decoration 0.2s; }
        .forgot-pop:hover { color: #0e7490; text-decoration: underline; }
      `}</style>
    </div>
  );
} 