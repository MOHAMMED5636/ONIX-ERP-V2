import React, { useRef, useEffect } from "react";
import { useLanguage } from "../LanguageContext";

export default function ChatWindow({ messages, typingUser, lang }) {
  const { t } = useLanguage();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`mb-2 ${msg.lang === 'ar' ? 'text-right' : 'text-left'}`}
          dir={msg.lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <span className="font-bold">{msg.sender}</span>
          <span className="ml-2 text-xs text-gray-500">{msg.time}</span>
          <div>{msg.text}</div>
        </div>
      ))}
      {typingUser && (
        <div className="text-xs text-gray-400 italic">{t("User is typing...")}</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
} 