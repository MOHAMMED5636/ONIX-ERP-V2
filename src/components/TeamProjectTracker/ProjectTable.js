import React from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableHeader, SortableSubtaskRow } from './index';

const ProjectTable = ({
  tasks,
  columns,
  columnOrder,
  expandedActive,
  expandedCompleted,
  renderMainCell,
  renderSubtaskCell,
  handleDragEnd,
  handleSubtaskDragEnd,
  handleShowAddColumnMenu,
  toggleExpand,
  setSelectedProject,
  setShowProjectDialog,
  handleDeleteRow,
  handleEdit,
  isCompleted = false
}) => {
  const bgGradient = isCompleted 
    ? "from-green-50 to-emerald-50" 
    : "from-blue-50 to-indigo-50";
  const borderColor = isCompleted ? "border-green-200" : "border-gray-200";
  const buttonGradient = isCompleted 
    ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
    : "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600";
  const textColor = isCompleted ? "text-green-700" : "text-blue-700";
  const hoverColor = isCompleted ? "hover:text-green-800" : "hover:text-blue-800";
  const expandHoverColor = isCompleted ? "hover:bg-green-100" : "hover:bg-blue-100";
  const chevronColor = isCompleted ? "text-green-600" : "text-blue-600";
  const expandedState = isCompleted ? expandedCompleted : expandedActive;
  const type = isCompleted ? 'completed' : 'active';

  return (
    <div className={`w-full px-4 py-0 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${isCompleted ? 'mt-4' : ''}`}>
      <table className="w-full table-auto bg-white">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
            <thead className={`bg-gradient-to-r ${bgGradient} border-b ${borderColor}`}>
              <tr>
                {columnOrder.map(key => {
                  const col = columns.find(c => c.key === key);
                  if (!col) return null;
                  return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                })}
                <th key="add-column" className="px-4 py-4 text-center">
                  <button
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${buttonGradient} text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110`}
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
        <tbody className={`divide-y ${isCompleted ? 'divide-green-100' : 'divide-gray-100'}`}>
          {tasks.map(task => (
            <React.Fragment key={task.id}>
              <tr className={`bg-white hover:bg-gradient-to-r ${isCompleted ? 'hover:from-green-50 hover:to-emerald-50' : 'hover:from-blue-50 hover:to-indigo-50'} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b ${isCompleted ? 'border-green-100' : 'border-gray-100'}`}>
                {columnOrder.map((colKey, idx) => {
                  const col = columns.find(c => c.key === colKey);
                  if (!col) return null;
                  return (
                    <td key={col.key} className="px-4 py-4 align-middle">
                      {col.key === 'task' && idx === 0 ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleExpand(task.id, type)}
                            className={`focus:outline-none p-1 rounded-lg ${expandHoverColor} transition-all duration-200`}
                            title={expandedState[task.id] ? 'Collapse' : 'Expand'}
                          >
                            {expandedState[task.id] ? 
                              <ChevronDownIcon className={`w-5 h-5 ${chevronColor}`} /> : 
                              <ChevronRightIcon className={`w-5 h-5 ${chevronColor}`} />
                            }
                          </button>
                          <button
                            className={`font-bold ${textColor} ${hoverColor} hover:underline focus:outline-none transition-all duration-200`}
                            onClick={() => { setSelectedProject(task); setShowProjectDialog(true); }}
                          >
                            {task.name}
                          </button>
                        </div>
                      ) : (
                        renderMainCell(col, task, (field, value) => {
                          if (col.key === 'delete') handleDeleteRow(task.id);
                          else handleEdit(task, field, value);
                        })
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* Subtasks as subtable - only render if expanded */}
              {expandedState[task.id] && (
                <tr>
                  <td colSpan={columnOrder.length} className="p-0 bg-gray-50">
                    <table className="ml-12 table-fixed min-w-full">
                      <thead>
                        <tr>
                          {columnOrder.map(colKey => {
                            const col = columns.find(c => c.key === colKey);
                            if (!col) return null;
                            return (
                              <th key={col.key} className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase${col.key === 'delete' ? ' text-center w-12' : ''}`}>{col.label}</th>
                            );
                          })}
                          <th key="add-column" className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center w-12">
                            <button
                              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-2xl flex items-center justify-center shadow"
                              onClick={handleShowAddColumnMenu}
                              title="Add column"
                              type="button"
                            >
                              +
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                          <SortableContext items={task.subtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                            {task.subtasks.map((sub, subIdx) => (
                              <SortableSubtaskRow key={sub.id} sub={sub} subIdx={subIdx} task={task}>
                                {columnOrder.map(colKey => {
                                  const col = columns.find(c => c.key === colKey);
                                  if (!col) return null;
                                  return (
                                    <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                      {renderSubtaskCell(col, sub, task, subIdx)}
                                    </td>
                                  );
                                })}
                              </SortableSubtaskRow>
                            ))}
                          </SortableContext>
                        </DndContext>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
