import React from "react";
import { useLanguage } from "../LanguageContext";

export default function ChatUserList({ users, onSelect, selectedUser }) {
  const { t, lang } = useLanguage();
  return (
    <aside className="w-48 bg-gray-50 border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-4 font-bold text-gray-700 border-b">{t("Users")}</div>
      <ul className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <li
            key={user.id}
            className={`px-4 py-2 cursor-pointer hover:bg-indigo-100 ${selectedUser && selectedUser.id === user.id ? "bg-indigo-50 font-bold" : ""}`}
            onClick={() => onSelect(user)}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.online ? "bg-green-500" : "bg-gray-400"}`}></span>
            {user.name}
          </li>
        ))}
      </ul>
    </aside>
  );
} 