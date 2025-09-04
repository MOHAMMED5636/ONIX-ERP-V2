import React from 'react';
import { CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableSubtaskRow from './SortableSubtaskRow';
import DraggableHeader from './DraggableHeader';

// Recursive TableRow component for Excel-like hierarchical table
const TableRow = ({ 
  row, 
  depth = 0, 
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
  isSubtask = false,
  parentTask = null
}) => {
  const hasChildren = row.subtasks && row.subtasks.length > 0;
  const isExpanded = expandedCompleted[row.id];
  const indentLevel = depth * 20; // 20px per level for clear hierarchy

  const handleCellChange = (rowId, colKey, value) => {
    if (colKey === 'delete') {
      onDelete(rowId, parentTask?.id);
    } else {
      onEdit(row, colKey, value);
    }
  };

  const handleToggleExpand = () => {
    onToggleExpand(row.id, 'completed');
  };

  return (
    <React.Fragment>
      {/* Main Excel-like Row */}
      <tr className={`bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 border-b border-green-100 ${isSubtask ? 'bg-gray-50' : ''}`}>
        {columnOrder.map((colKey, idx) => {
          const col = columns.find(c => c.key === colKey);
          if (!col) return null;
          
          return (
            <td key={col.key} className="px-4 py-4 align-middle">
              {col.key === 'task' && idx === 0 ? (
                // First column with hierarchy controls
                <div className="flex items-center gap-2 relative">
                  {/* Vertical connecting line for hierarchy visualization */}
                  {depth > 0 && (
                    <div 
                      className="absolute w-px bg-gray-300" 
                      style={{ 
                        left: `${indentLevel - 10}px`, 
                        top: '-50%', 
                        bottom: '-50%',
                        height: '200%'
                      }} 
                    />
                  )}
                  
                  {/* Expand/Collapse arrow with consistent spacing */}
                  <div className="w-6 flex justify-center">
                    {hasChildren ? (
                      <button
                        onClick={handleToggleExpand}
                        className="focus:outline-none p-1 rounded hover:bg-green-100 transition-all duration-200 relative z-10"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="w-4 h-4 text-green-600" /> : 
                          <ChevronRightIcon className="w-4 h-4 text-green-600" />
                        }
                      </button>
                    ) : (
                      <div className="w-4 h-4" /> // Consistent spacing placeholder
                    )}
                  </div>
                  
                  {/* Indentation spacer */}
                  <div style={{ width: `${indentLevel}px` }} />
                  
                  {/* Row name with click handler */}
                  <button
                    className="font-bold text-green-700 hover:text-green-800 hover:underline focus:outline-none transition-all duration-200 text-left flex-1"
                    onClick={() => { setSelectedProject(row); setShowProjectDialog(true); }}
                  >
                    {row.name}
                  </button>
                </div>
              ) : (
                // All other columns render normally without indentation
                renderMainCell(col, row, (field, value) => handleCellChange(row.id, field, value))
              )}
            </td>
          );
        })}
      </tr>
      
      {/* Recursive rendering of children with Excel-like structure */}
      {hasChildren && isExpanded && (
        <tr>
          <td colSpan={columnOrder.length + 1} className="p-0 bg-gray-50">
            <div className="relative">
              {/* Vertical connecting line for children */}
              <div 
                className="absolute w-px bg-gray-300" 
                style={{ 
                  left: `${indentLevel + 10}px`, 
                  top: '0', 
                  bottom: '0',
                  height: '100%'
                }} 
              />
              
              {/* Excel-like subtask table */}
              <table className="w-full table-auto">
                <DndContext collisionDetection={closestCenter} onDragEnd={() => {}}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    <thead>
                      <tr>
                        {columnOrder.map(colKey => {
                          const col = columns.find(c => c.key === colKey);
                          if (!col) return null;
                          return (
                            <DraggableHeader
                              key={col.key}
                              col={col}
                              colKey={col.key}
                            />
                          );
                        })}
                        <th key="add-column" className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center w-12">
                          <button
                            className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-sm flex items-center justify-center shadow"
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
                <tbody>
                  <DndContext onDragEnd={event => onSubtaskDragEnd(event, row.id)}>
                    <SortableContext items={row.subtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                      {row.subtasks.map((subtask, subIdx) => (
                        <React.Fragment key={subtask.id}>
                          {/* Recursive TableRow for subtasks */}
                          <TableRow
                            row={subtask}
                            depth={depth + 1}
                            columnOrder={columnOrder}
                            columns={columns}
                            expandedCompleted={expandedCompleted}
                            onToggleExpand={onToggleExpand}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onShowAddColumnMenu={onShowAddColumnMenu}
                            onSubtaskDragEnd={onSubtaskDragEnd}
                            renderMainCell={renderMainCell}
                            renderSubtaskCell={renderSubtaskCell}
                            setSelectedProject={setSelectedProject}
                            setShowProjectDialog={setShowProjectDialog}
                            isSubtask={true}
                            parentTask={row}
                          />
                        </React.Fragment>
                      ))}
                    </SortableContext>
                  </DndContext>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

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
  setShowProjectDialog
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

      {/* Excel-like Completed Projects Table */}
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
              <TableRow
                key={task.id}
                row={task}
                depth={0}
                columnOrder={columnOrder}
                columns={columns}
                expandedCompleted={expandedCompleted}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onShowAddColumnMenu={onShowAddColumnMenu}
                onSubtaskDragEnd={onSubtaskDragEnd}
                renderMainCell={renderMainCell}
                renderSubtaskCell={renderSubtaskCell}
                setSelectedProject={setSelectedProject}
                setShowProjectDialog={setShowProjectDialog}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CompletedProjects;