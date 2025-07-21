import React, { useState, useRef, useEffect } from "react";

const menuOptions = [
  { icon: "🧑‍🤝‍🧑", label: "View Members", description: "Shows all members in chatroom" },
  { icon: "➕", label: "Add Members", description: "Add engineers/staff to chat" },
  { icon: "✏️", label: "Edit Group Info", description: "Change chat name, description" },
  { icon: "⭐", label: "Starred Messages", description: "Shortcut to important messages" },
  { icon: "📁", label: "Shared Docs", description: "List of all files/images shared" },
  { icon: "🔕", label: "Mute Chat", description: "Disable notifications" },
  { icon: "🧨", label: "Delete Chat (admin)", description: "Remove chatroom (if no longer active)" },
];

export default function ThreeDotMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position relative to button
  const [dropdownStyle, setDropdownStyle] = useState({});
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 12,
        left: rect.right - 256, // 256px = w-64
        zIndex: 9999,
      });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open menu"
        ref={buttonRef}
      >
        <span className="text-2xl">⋮</span>
      </button>
      {open && (
        <div
          ref={menuRef}
          style={dropdownStyle}
          className="w-64 bg-white border rounded-lg shadow-lg z-50"
        >
          {menuOptions.map((option) => (
            <div
              key={option.label}
              className="flex items-start px-4 py-2 hover:bg-gray-100 cursor-pointer"
              title={option.description}
            >
              <span className="mr-3 text-xl">{option.icon}</span>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 