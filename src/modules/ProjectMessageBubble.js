import React from "react";

export default function ProjectMessageBubble({ message }) {
  const isMe = message.sender === "me"; // Replace with actual user check
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg shadow ${isMe ? "bg-indigo-100 text-right" : "bg-white text-left"} `}>
        <div className="text-sm">{message.text}</div>
        <div className="text-xs text-gray-400 mt-1 flex justify-between">
          <span>{message.sender}</span>
          <span>{message.time}</span>
        </div>
      </div>
    </div>
  );
} 