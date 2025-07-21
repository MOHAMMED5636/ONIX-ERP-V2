import React, { useRef, useEffect, useState } from "react";

const currentUser = "Alice";

export default function ChatRoom({ messages = [], onSendMessage }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input);
      setInput("");
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.user === "Alice";
          const isBot = msg.user === "AI Bot";
          return (
            <div
              key={idx}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[60%] ${isMe ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow border-2 border-white flex-shrink-0 ${isBot ? "ring-2 ring-purple-400" : ""}`}
                />
                {/* Message bubble */}
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} min-w-0 flex-1`}>
                  <div
                    className={`px-3 sm:px-4 py-2 rounded-2xl shadow-sm text-sm sm:text-base break-words max-w-full
                      ${isMe 
                        ? "bg-green-500 text-white rounded-br-sm" 
                        : isBot 
                          ? "bg-purple-100 text-purple-900 rounded-bl-sm border border-purple-200" 
                          : "bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
                      }
                    `}
                  >
                    {!isMe && (
                      <div className={`text-xs font-semibold mb-1 ${isBot ? "text-purple-700" : "text-gray-600"}`}>
                        {msg.user}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Box - Responsive and touch-friendly */}
      <div className="w-full bg-white border-t border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
        {/* Emoji Button */}
        <button 
          className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-lg sm:text-xl transition-colors touch-manipulation" 
          title="Emoji"
          aria-label="Add emoji"
        >
          <span role="img" aria-label="emoji">😊</span>
        </button>
        
        {/* Attachment Button */}
        <button 
          className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 transition-colors touch-manipulation" 
          title="Attach file" 
          aria-label="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.071-7.071a4 4 0 10-5.657-5.657l-8.486 8.485a6 6 0 108.485 8.486l6.364-6.364" />
          </svg>
        </button>
        
        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 shadow-sm text-sm sm:text-base transition-all"
        />
        
        {/* Send Button */}
        <button
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-semibold shadow-sm flex items-center gap-1.5 transition-all text-sm sm:text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
} 