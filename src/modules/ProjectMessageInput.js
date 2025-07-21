import React, { useState } from "react";

export default function ProjectMessageInput({ onSend }) {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (text.trim()) {
      onSend({ text, sender: "me", time: new Date().toLocaleTimeString() });
      setText("");
    }
  };
  return (
    <div className="flex items-center p-4 border-t bg-white">
      <button className="mr-2 text-xl">😊</button>
      <input
        className="flex-1 p-2 rounded border"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
      />
      <button className="ml-2 text-xl">📎</button>
      <button
        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
} 