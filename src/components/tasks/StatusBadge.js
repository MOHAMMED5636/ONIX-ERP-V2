import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

// Status options for dropdown
export const STATUS_OPTIONS = [
  { value: "TO DO", label: "TO DO", color: "bg-gray-200 text-gray-700" },
  {
    value: "IN PROGRESS",
    label: "IN PROGRESS",
    color: "bg-yellow-200 text-yellow-800",
  },
  { value: "DONE", label: "DONE", color: "bg-green-200 text-green-800" },
];

const StatusBadge = ({ status, onStatusChange, itemKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    position: "below",
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const colors = {
    "TO DO": "bg-gray-200 text-gray-700",
    "IN PROGRESS": "bg-yellow-200 text-yellow-800",
    DONE: "bg-green-200 text-green-800",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0, position: "below" };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Approximate dropdown height

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let top, position;

    // If there's not enough space below but enough above, position above
    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      top = buttonRect.top - dropdownHeight;
      position = "above";
    } else {
      top = buttonRect.bottom + 2;
      position = "below";
    }

    return {
      top: top,
      left: buttonRect.left,
      position: position,
    };
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = (newStatus) => {
    onStatusChange(itemKey, newStatus);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <span
          ref={buttonRef}
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 whitespace-nowrap ${
            colors[status] || "bg-gray-100 text-gray-600"
          }`}
          onClick={handleToggleDropdown}
        >
          {status}
          <FaChevronDown
            className={`ml-1 text-xs transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {isOpen && (
        <div
          className="fixed bg-white border border-gray-300 rounded-md shadow-xl min-w-[160px] py-1"
          style={{
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center"
              onClick={() => handleStatusSelect(option.value)}
            >
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${option.color}`}
              >
                {option.label}
              </span>
            </div>
          ))}
          <hr className="my-1 border-gray-200" />
          <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-600">
            Create status
          </div>
          <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-600">
            Edit status
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBadge;
