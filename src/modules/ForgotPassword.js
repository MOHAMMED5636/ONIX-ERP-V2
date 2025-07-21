import React, { useState } from "react";

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
    <div className="w-full max-w-xs mx-auto" dir={dir}>
      <form onSubmit={handleSend} className="space-y-6 mt-4">
        <h2 className="text-xl font-semibold text-cyan-700 mb-4 text-center">{t.forgot}</h2>
        <div>
          <label className="block text-gray-700 mb-1" htmlFor="fp-username">{t.username}</label>
          <input
            id="fp-username"
            type="text"
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-gray-50 ${errors.username ? "border-red-400" : ""}`}
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder={t.userPlaceholder}
            dir={dir}
          />
          {errors.username && <div className="text-red-500 text-xs mt-1">{t.username} {errors.username}</div>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1" htmlFor="fp-mobile">{t.mobile}</label>
          <input
            id="fp-mobile"
            type="text"
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-gray-50 ${errors.mobile ? "border-red-400" : ""}`}
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            placeholder={t.mobilePlaceholder}
            dir={dir}
          />
          {errors.mobile && <div className="text-red-500 text-xs mt-1">{t.mobile} {errors.mobile}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-2 rounded shadow transition"
        >
          {t.send}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full mt-2 text-cyan-700 hover:underline text-sm"
        >
          {t.back}
        </button>
        {sent && <div className="text-green-600 text-center mt-2">{t.sent}</div>}
      </form>
    </div>
  );
} 