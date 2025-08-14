import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon } from "@heroicons/react/24/outline";

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 p-2 bg-white rounded shadow mb-1"
      {...attributes}
    >
      <span {...listeners} className="cursor-grab">
        <Bars3Icon className="w-5 h-5 text-gray-400" />
      </span>
      {children}
    </div>
  );
}

export default function ReorderableDropdown({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(options.map(opt => opt.value));
  const [localOptions, setLocalOptions] = useState(options);

  const orderedOptions = order.map(val => localOptions.find(opt => opt.value === val)).filter(Boolean);

  function handleDragEnd(event) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id === over.id) return;
    
    const oldIndex = order.indexOf(active.id);
    const newIndex = order.indexOf(over.id);
    
    // Check if both indices are valid
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    setOrder(arrayMove(order, oldIndex, newIndex));
  }

  function handleSave() {
    setLocalOptions(orderedOptions);
    setOpen(false);
  }

  return (
    <div className="relative flex items-center gap-2">
      <select
        className="border rounded px-2 py-1 text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {orderedOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button type="button" onClick={() => setOpen(true)} title="Reorder options">
        <Bars3Icon className="w-5 h-5 text-gray-400" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">Reorder {label}</h3>
            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
              <SortableContext items={order} strategy={verticalListSortingStrategy}>
                {order.map(val => {
                  const opt = localOptions.find(o => o.value === val);
                  return (
                    <SortableItem key={val} id={val}>
                      <span>{opt.label}</span>
                    </SortableItem>
                  );
                })}
              </SortableContext>
            </DndContext>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setOpen(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 