import React from 'react';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableSubtaskRow from './SortableSubtaskRow';

const CompletedProjects = ({
  completedTasks,
  columnOrder,
  columns,
  expandedCompleted,
  onToggleExpand,
  onEdit,
  onDelete,
  onShowAddColumnMenu,
  onSubtaskDragEnd,
  renderMainCell,
  renderSubtaskCell,
  setSelectedProject,
  setShowProjectDialog,
  DraggableHeader
}) => {
  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <>
      {/* Completed Projects Header */}
      <div className="mt-12 flex items-center gap-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
          Completed Projects
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
      </div>

      {/* Completed Projects Table */}
      <div className="w-full px-4 py-0 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full table-auto bg-white">
          <DndContext collisionDetection={closestCenter} onDragEnd={() => {}}>
            <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <tr>
                  {columnOrder.map(key => {
                    const col = columns.find(c => c.key === key);
                    if (!col) return null;
                    return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                  })}
                  <th key="add-column" className="px-4 py-4 text-center">
                    <button
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                      onClick={onShowAddColumnMenu}
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
          <tbody className="divide-y divide-green-100">
            {completedTasks.map(task => (
              <React.Fragment key={task.id}>
                <tr className="bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-green-100">
                  {columnOrder.map((colKey, idx) => {
                    const col = columns.find(c => c.key === colKey);
                    if (!col) return null;
                    return (
                      <td key={col.key} className="px-4 py-4 align-middle">
                        {col.key === 'task' && idx === 0 ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onToggleExpand(task.id, 'completed')}
                              className="focus:outline-none p-1 rounded-lg hover:bg-green-100 transition-all duration-200"
                              title={expandedCompleted[task.id] ? 'Collapse' : 'Expand'}
                            >
                              {expandedCompleted[task.id] ? 
                                <ChevronDownIcon className="w-5 h-5 text-green-600" /> : 
                                <ChevronRightIcon className="w-5 h-5 text-green-600" />
                              }
                            </button>
                            <button
                              className="font-bold text-green-700 hover:text-green-800 hover:underline focus:outline-none transition-all duration-200"
                              onClick={() => { setSelectedProject(task); setShowProjectDialog(true); }}
                            >
                              {task.name}
                            </button>
                          </div>
                        ) : (
                          renderMainCell(col, task, (field, value) => {
                            if (col.key === 'delete') onDelete(task.id);
                            else onEdit(task, field, value);
                          })
                        )}
                      </td>
                    );
                  })}
                </tr>
                {/* Subtasks as subtable - only render if expandedCompleted[task.id] */}
                {expandedCompleted[task.id] && (
                  <tr>
                    <td colSpan={columnOrder.length} className="p-0 bg-gray-50">
                      <table className="ml-12 table-fixed min-w-full">
                        <thead>
                          <tr>
                            {columnOrder.map(colKey => {
                              const col = columns.find(c => c.key === colKey);
                              if (!col) return null;
                              return (
                                <th key={col.key} className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                  {col.label}
                                </th>
                              );
                            })}
                            <th key="add-column" className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center w-12">
                              <button
                                className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-2xl flex items-center justify-center shadow"
                                onClick={onShowAddColumnMenu}
                                title="Add column"
                                type="button"
                              >
                                +
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <DndContext onDragEnd={event => onSubtaskDragEnd(event, task.id)}>
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
    </>
  );
};

export default CompletedProjects;




