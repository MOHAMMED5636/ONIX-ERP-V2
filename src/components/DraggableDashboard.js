import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';

// Draggable Dashboard Card Component
function DraggableDashboardCard({ 
  id, 
  title, 
  value, 
  icon, 
  accent, 
  gradient, 
  shadow, 
  children, 
  className = "",
  isDragging = false 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dragging,
  } = useSortable({ id, animateLayoutChanges: () => false });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: dragging ? undefined : (transition || 'transform 200ms cubic-bezier(.2,.8,.2,1)'),
    willChange: 'transform',
    zIndex: dragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl shadow-md p-4 sm:p-5 lg:p-7 flex flex-col items-start border border-gray-100 glass-card transition-all duration-300 animate-fade-in ${gradient} ${shadow} hover:scale-[1.04] hover:shadow-2xl group ${className} ${
        dragging ? 'opacity-70 scale-105 shadow-2xl cursor-grabbing' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 rounded-full"
        title="Drag to reorder"
      >
        <Bars3Icon className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-3 mb-2 w-full">
        {icon && (
          <span className="flex items-center justify-center rounded-full p-2 bg-white/40 shadow-md mr-2">
            {icon}
          </span>
        )}
        <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate drop-shadow">{title}</span>
        {accent && (
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-white/70 text-indigo-600 shadow badge-pop">{accent}</span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 w-full animate-bounce-in flex items-center gap-2">{value}</div>
      {children}
    </div>
  );
}

// Enhanced Widget Box Component (for right sidebar widgets)
function DraggableWidgetBox({ id, children, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dragging,
  } = useSortable({ id, animateLayoutChanges: () => false });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: dragging ? undefined : (transition || 'transform 200ms cubic-bezier(.2,.8,.2,1)'),
    willChange: 'transform',
    zIndex: dragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${dragging ? 'opacity-70 scale-105 shadow-2xl cursor-grabbing' : ''}`}
    >
      {/* Drag Handle for Widget Box */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 rounded-full z-10"
        title="Drag to reorder"
      >
        <Bars3Icon className="h-4 w-4 text-gray-400" />
      </div>
      {children}
    </div>
  );
}

// Main Draggable Dashboard Component
export default function DraggableDashboard({ children }) {
  // State for widget order
  const [widgetOrder, setWidgetOrder] = useState([
    'active-employees',
    'active-contracts', 
    'attendance',
    'active-tasks',
    'team-progress'
  ]);

  const [sidebarWidgetOrder, setSidebarWidgetOrder] = useState([
    'quick-links',
    'calendar'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Check if it's a main widget or sidebar widget
      if (widgetOrder.includes(active.id)) {
        setWidgetOrder((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else if (sidebarWidgetOrder.includes(active.id)) {
        setSidebarWidgetOrder((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  }

  // Save widget order to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  useEffect(() => {
    localStorage.setItem('dashboard-sidebar-order', JSON.stringify(sidebarWidgetOrder));
  }, [sidebarWidgetOrder]);

  // Load widget order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('dashboard-widget-order');
    if (savedOrder) {
      setWidgetOrder(JSON.parse(savedOrder));
    }

    const savedSidebarOrder = localStorage.getItem('dashboard-sidebar-order');
    if (savedSidebarOrder) {
      setSidebarWidgetOrder(JSON.parse(savedSidebarOrder));
    }
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-screen w-full bg-white flex flex-col items-stretch justify-start">
        {/* Faded watermark overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10" />
        
        {/* Animated SVG Blob background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 400 300" to="360 400 300" dur="24s" repeatCount="indefinite" />
              <path d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z" fill="url(#blobGrad)" />
            </g>
          </svg>
        </div>

        {children}

        {/* CSS for animations */}
        <style>{`
          .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
          .animate-countup { transition: color 0.3s, transform 0.3s; }
          .ripple { position: relative; overflow: hidden; }
          .ripple:after { content: ''; position: absolute; left: 50%; top: 50%; width: 0; height: 0; background: rgba(59,130,246,0.15); border-radius: 100%; transform: translate(-50%, -50%); transition: width 0.4s, height 0.4s; z-index: 0; }
          .ripple:active:after { width: 200px; height: 200px; }
          .bounce { animation: bounce 1.2s infinite alternate; }
          @keyframes bounce { 0% { transform: translateY(0);} 100% { transform: translateY(-6px);} }
          .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
          @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
          .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
          .progress-ring { transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1); }
          .badge-pop { animation: badgePop 0.7s cubic-bezier(.4,0,.2,1); }
          @keyframes badgePop { from { transform: scale(0.7);} to { transform: scale(1);} }
          .animate-bounce-in { animation: bounceIn 0.7s cubic-bezier(.4,0,.2,1); }
          @keyframes bounceIn { 0% { transform: scale(0.7); opacity: 0;} 80% { transform: scale(1.1); opacity: 1;} 100% { transform: scale(1); } }
          .animate-progress-bar { animation: progressBar 1.2s cubic-bezier(.4,0,.2,1); }
          @keyframes progressBar { from { width: 0; } to { width: 80%; } }
          .cursor-grab { cursor: grab; }
          .cursor-grabbing { cursor: grabbing; }
        `}</style>
      </div>
    </DndContext>
  );
}

export { DraggableDashboardCard, DraggableWidgetBox };
