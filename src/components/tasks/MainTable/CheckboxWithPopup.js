import React, { useState, useRef, useEffect } from 'react';
import { 
  EllipsisVerticalIcon,
  PencilIcon,
  ClipboardDocumentIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

const CheckboxWithPopup = ({ 
  task, 
  onEdit, 
  onDelete, 
  onCopy, 
  onPaste,
  copiedItem,
  isSubtask = false,
  parentTaskId = null 
}) => {
  const [showPopup, setShowPopup] = useState(false);
  
  // Debug popup state changes
  useEffect(() => {
    console.log('Popup state changed for', task.name || task.title, 'showPopup:', showPopup);
  }, [showPopup, task.name, task.title]);
  const [isChecked, setIsChecked] = useState(false);
  const popupRef = useRef(null);
  const checkboxRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          checkboxRef.current && !checkboxRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Checkbox clicked!', task.name || task.title, 'Current showPopup:', showPopup);
    setShowPopup(!showPopup);
    console.log('Setting showPopup to:', !showPopup);
  };

  const handleEdit = () => {
    setShowPopup(false);
    if (onEdit) {
      onEdit(task);
    } else {
      console.warn('onEdit handler not provided');
    }
  };

  const handleCopy = () => {
    setShowPopup(false);
    if (onCopy) {
      const contentToCopy = {
        name: task.name || task.title,
        referenceNumber: task.referenceNumber,
        status: task.status,
        owner: task.owner,
        priority: task.priority,
        category: task.category,
        location: task.location,
        remarks: task.remarks,
        assigneeNotes: task.assigneeNotes
      };
      onCopy(contentToCopy);
    } else {
      console.warn('onCopy handler not provided');
    }
  };

  const handleDelete = () => {
    setShowPopup(false);
    if (onDelete) {
      const taskName = task.name || task.title || 'this task';
      if (window.confirm(`Are you sure you want to delete "${taskName}"?`)) {
        onDelete(task.id, parentTaskId);
      }
    } else {
      console.warn('onDelete handler not provided');
    }
  };

  const getPopupPosition = () => {
    if (!checkboxRef.current) return {};
    const rect = checkboxRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    return {
      position: 'fixed',
      top: spaceBelow >= 120 ? rect.bottom + 5 : rect.top - 125,
      left: rect.left,
      zIndex: 9999,
      transform: spaceBelow >= 120 ? 'none' : 'translateY(-100%)'
    };
  };

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      {console.log('Rendering CheckboxWithPopup for:', task.name || task.title)}
      <div
        ref={checkboxRef}
        className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors duration-200 flex items-center justify-center bg-red-100"
        onClick={handleCheckboxClick}
        title="Click me!"
        style={{ border: '2px solid red' }}
      >
        {isChecked && (
          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {showPopup && (
        <div
          ref={popupRef}
          className="absolute z-50 bg-yellow-100 rounded-lg shadow-lg border-4 border-red-500 py-2 min-w-[160px]"
          style={getPopupPosition()}
        >
          {console.log('Rendering popup for:', task.name || task.title)}
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Copy to Clipboard
          </button>
          {onPaste && (
            <button
              onClick={() => {
                setShowPopup(false);
                onPaste(task);
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors duration-150 ${
                copiedItem ? 'text-green-700 hover:bg-green-100' : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={!copiedItem}
              title={copiedItem ? `Paste ${copiedItem.name || 'item'}` : 'No item copied'}
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              {copiedItem ? `Paste ${copiedItem.name || 'item'}` : 'Paste (No item copied)'}
            </button>
          )}
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckboxWithPopup;
