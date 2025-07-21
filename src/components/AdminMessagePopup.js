import React, { useEffect, useState } from "react";

export default function AdminMessagePopup({
  title = "Admin Message",
  message = "System will be down Sunday 2:00 AM"
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminMessageSeen") === "true") return;
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("adminMessageSeen", "true");
  };

  if (!visible || localStorage.getItem("adminMessageSeen") === "true") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-indigo-700 mb-2">{title}</h2>
        <div className="text-gray-700 mb-2">{message}</div>
      </div>
    </div>
  );
} 