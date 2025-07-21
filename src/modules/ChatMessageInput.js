import React, { useState } from "react";
import { useLanguage } from "../LanguageContext";

export default function ChatMessageInput({ onSend, onTyping, lang }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend({ text: message, lang });
      setMessage("");
    }
  };

  return (
    <div className="flex items-center p-2 border-t bg-gray-50">
      <input
        className="flex-1 p-2 rounded border"
        value={message}
        onChange={e => {
          setMessage(e.target.value);
          onTyping();
        }}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        placeholder={t("Type a message...")}
        dir={lang === "ar" ? "rtl" : "ltr"}
      />
      <button
        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={handleSend}
      >
        {t("Send")}
      </button>
    </div>
  );
} 