import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableHeader from './DraggableHeader';

const TableHeader = ({ 
  columnOrder, 
  columns, 
  handleShowAddColumnMenu 
}) => {
  return (
    <DndContext collisionDetection={closestCenter}>
      <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {/* Select Column Header - No checkbox */}
            <th className="px-3 py-4 text-center w-12">
              {/* Empty header for checkbox alignment */}
            </th>
            {/* Pin Column Header */}
            <th className="px-3 py-4 text-center w-12">
              <div className="flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pin</span>
              </div>
            </th>
            {columnOrder
              .filter(key => key !== 'category')
              .map(key => {
                const col = columns.find(c => c.key === key);
                if (!col) return null;
                return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
              })}
            <th key="add-column" className="px-3 py-4 text-center">
              <button
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                onClick={handleShowAddColumnMenu}
                title="Add column"
                type="button"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
      </SortableContext>
    </DndContext>
  );
};

export default TableHeader;



