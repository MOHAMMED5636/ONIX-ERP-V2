import React, { createContext, useContext, useState, useEffect } from "react";

// Translation dictionary
const translations = {
  en: {
    "Active Employees": "Active Employees",
    "Active Contracts": "Active Contracts",
    "Daily Attendance": "Daily Attendance",
    "Check-In / Check-Out": "Check-In / Check-Out",
    "Active Tasks": "Active Tasks",
    "Team Active Tasks": "Team Active Tasks",
    "Balance Sheet": "Balance Sheet",
    "Invoice Pending Payments": "Invoice Pending Payments",
    "Unusual Attendance": "Unusual Attendance",
    "No Record": "No Record",
    "View": "View",
    "Quick Links": "Quick Links",
    "Logout": "Logout",
    "Admin": "Admin",
    "Send": "Send",
    "Type a message...": "Type a message...",
    "User is typing...": "User is typing...",
    "Users": "Users",
    "Chat": "Chat",
    "Project Chat": "Project Chat"
  },
  ar: {
    "Active Employees": "الموظفين النشطين",
    "Active Contracts": "العقود النشطة",
    "Daily Attendance": "الحضور اليومي",
    "Check-In / Check-Out": "تسجيل الدخول / الخروج",
    "Active Tasks": "المهام النشطة",
    "Team Active Tasks": "مهام الفريق النشطة",
    "Balance Sheet": "الميزانية العمومية",
    "Invoice Pending Payments": "الفواتير المعلقة",
    "Unusual Attendance": "الحضور غير المعتاد",
    "No Record": "لا يوجد سجل",
    "View": "عرض",
    "Quick Links": "روابط سريعة",
    "Logout": "تسجيل الخروج",
    "Admin": "المدير",
    "Send": "إرسال",
    "Type a message...": "اكتب رسالة...",
    "User is typing...": "يكتب الآن...",
    "Users": "المستخدمون",
    "Chat": "الدردشة",
    "Project Chat": "دردشة المشروع"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "ar" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
} 