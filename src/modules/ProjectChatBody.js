import React, { useRef, useEffect } from "react";
import ProjectMessageBubble from "./ProjectMessageBubble";

export default function ProjectChatBody({ messages }) {
  const bottomRef = useRef();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {messages.map((msg, idx) => (
        <ProjectMessageBubble key={idx} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
} 