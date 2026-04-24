import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusIcon,
  MapPinIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon,
  PaperClipIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { addDays, differenceInCalendarDays, isValid } from 'date-fns';
import MapPicker from '../../modules/WorkingLocations.js';

// Import extracted components
import ProjectRow from "./MainTable/ProjectRow";
import SortableProjectRow from "./MainTable/SortableProjectRow";
import CompletedProjects from "./MainTable/CompletedProjects";
import Filters from "./MainTable/Filters";
import TimelineCell from "./MainTable/TimelineCell";
import DraggableHeader from "./MainTable/DraggableHeader";
import SortableSubtaskRow from "./MainTable/SortableSubtaskRow";
import GoogleMapPickerDemo from "./MainTable/GoogleMapPickerDemo";
import CellRenderer from "./MainTable/CellRenderer";
import Modals from "./MainTable/Modals";
import CheckboxWithPopup from "./MainTable/CheckboxWithPopup";
import MultiSelectCheckbox from "./MainTable/MultiSelectCheckbox";
import ColumnSettingsDropdown from "./MainTable/ColumnSettingsDropdown";
import SubtaskCheckbox from "./MainTable/SubtaskCheckbox";
import BulkActionBar from "./MainTable/BulkActionBar";
import BulkEditDrawer from "./MainTable/BulkEditDrawer";
import BulkViewDrawer from "./MainTable/BulkViewDrawer";
import BulkPasteModal from "./MainTable/BulkPasteModal";
import ExportModal from "./MainTable/ExportModal";
import TruncatedTextCell from "./MainTable/TruncatedTextCell";
import ChecklistModal from "./modals/ChecklistModal";
import QuestionnaireModal from "./modals/QuestionnaireModal";
import QuestionnaireResponseModal from "./modals/QuestionnaireResponseModal";
import AttachmentsModal from "./modals/AttachmentsModal";
import ContractLoadOutModal from "./modals/ContractLoadOutModal";
import Toast from "./MainTable/Toast";
import TaskDetailsDrawer from "../TaskDetailsDrawer";
import ChatDrawer from "./ChatDrawer";
import useSocket from "../../hooks/useSocket";
import { MessageCircle } from 'lucide-react';
import EngineerInviteModal from "./MainTable/EngineerInviteModal";
import { sendTenderInvitations } from "../../services/tenderAPI";
import { createProject, getProjects, deleteProject, updateProject } from "../../services/projectsAPI";
import { getEmployees } from "../../services/employeeAPI";


// Import utilities
import {
  INITIAL_COLUMNS,
  calculateTaskTimelines,
  filterCompletedTasks,
  getDefaultColumnOrder,
  getSubtaskColumnOrder,
  getMainTaskColumnOrder,
  getHierarchicalAutoNumber,
  loadColumnOrderFromStorage,
  saveColumnOrderToStorage,
  getMissingColumns,
  validateTask,
  generateTaskId,
  createNewTask,
  createNewSubtask,
  calculateTaskProgress,
  areAllSubtasksComplete,
  createNewColumn,
  addColumnToTasks,
  formatLocationString,
  statusColors,
  updateTaskReferenceNumber,
  updateSubtaskReferenceNumber,
  resetReferenceTracker,
  calculateTotalPlanDaysFromSubtasks
} from "./utils/tableUtils";
import { getTaskCategories } from "./modular/constants";
import { deleteTask as deleteTaskApi } from "../../services/tasksAPI";

// Import shared search and filter hook
import { useSearchAndFilters } from './hooks/useSearchAndFilters';

// Import undo functionality
import UndoToast from '../common/UndoToast';
import useUndoManager from '../../hooks/useUndoManager';
import { filterActiveItems, applySoftDelete, applyRestore } from '../../utils/softDeleteUtils';
import { useAuth } from '../../contexts/AuthContext';

const initialTasks = [];





export default function MainTable() {
  const { user } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = !isEmployee; // Admin is anyone who is not an employee
  const isManager = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'MANAGER'].includes(user?.role);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Inline edit state and handlers for Project Name (move to top)
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [selectedProjectForSummary, setSelectedProjectForSummary] = useState(null);
  
  // Task Details Drawer state
  const [drawerTask, setDrawerTask] = useState(null);
  
  // Chat state
  const [chatProject, setChatProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatType, setChatType] = useState('project');
  
  // Tender confirmation modal state
  const [showTenderConfirmation, setShowTenderConfirmation] = useState(false);
  const [tenderProject, setTenderProject] = useState(null);
  const [selectedEngineerIds, setSelectedEngineerIds] = useState(new Set());
  
  // Available engineers (only whitelisted should be selectable)
  const availableEngineers = [
    {
      id: "anas",
      name: "Anas",
      specialty: "Structural Engineering",
      rating: "A+",
      status: "Available",
      engineerListing: "Whitelisted",
      email: "anas@example.com",
      phone: "+971 50 234 5678",
    },
  ];
  
  // Copy/Paste state
  const [copiedTask, setCopiedTask] = useState(null);
  const [copiedSubtask, setCopiedSubtask] = useState(null);
  const [copiedChildTask, setCopiedChildTask] = useState(null);
  
  // Bulk Copy/Paste state
  const [bulkCopiedItems, setBulkCopiedItems] = useState({
    tasks: [],
    subtasks: [],
    childTasks: []
  });
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [pasteTarget, setPasteTarget] = useState(null);
  
  // Socket.IO integration
  const { socket, isConnected } = useSocket();

  // Undo functionality
  const undoManager = useUndoManager();

  // Handle undo restoration
  const handleUndoRestore = (deletedItems) => {
    const projectItems = deletedItems.filter(item => !item.subtaskId);
    const subtaskItems = deletedItems.filter(item => item.subtaskId);
    
    if (projectItems.length > 0) {
      setTasks(tasks => {
        const updatedTasks = applyRestore(tasks, projectItems);
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      });
    }
    
    if (subtaskItems.length > 0) {
      setTasks(tasks => {
        const updatedTasks = tasks.map(task => {
          if (task.subtasks) {
            const updatedSubtasks = task.subtasks.map(subtask => {
              const subtaskToRestore = subtaskItems.find(item => item.id === subtask.id);
              if (subtaskToRestore) {
                return { ...subtask, is_deleted: false, deleted_at: null };
              }
              
              // Check if this subtask has child subtasks that need restoration
              if (subtask.childSubtasks) {
                const updatedChildSubtasks = subtask.childSubtasks.map(childSubtask => {
                  const childSubtaskToRestore = subtaskItems.find(item => 
                    item.id === childSubtask.id && item.parentSubtaskId === subtask.id
                  );
                  if (childSubtaskToRestore) {
                    return { ...childSubtask, is_deleted: false, deleted_at: null };
                  }
                  return childSubtask;
                });
                return { ...subtask, childSubtasks: updatedChildSubtasks };
              }
              
              return subtask;
            });
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      });
    }
  };

  const handleProjectNameClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };
  const handleProjectNameDoubleClick = (task) => {
    setSelectedProjectForSummary(task);
  };
  
  // Handle opening task details drawer
  const handleOpenTaskDrawer = (task) => {
    setDrawerTask(task);
  };
  const handleProjectNameChange = (e) => setEditingTaskName(e.target.value);
  const handleProjectNameBlur = (task) => {
    if (editingTaskName.trim() !== "") {
      handleEdit(task, 'name', editingTaskName);
    }
    setEditingTaskId(null);
  };
  const handleProjectNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      if (editingTaskName.trim() !== "") {
        handleEdit(task, 'name', editingTaskName);
      }
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };
  const closeProjectSummary = () => setSelectedProjectForSummary(null);
  
  // Helper function to format subtasks for backend
  // Also injects a simple execution order (taskOrder) based on current row position
  // IMPORTANT: resolves predecessors like "1-1" into real predecessorId UUIDs.
  const formatSubtasksForBackend = (task, projectIndex) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return [];
    }

    // Use DB-backed projectNumber when available to keep predecessor mapping stable
    // even if the visible list is filtered/sorted.
    const stableProjectIndex =
      Number.isFinite(Number(task?.projectNumber)) && Number(task.projectNumber) > 0
        ? Number(task.projectNumber) - 1
        : projectIndex;

    // Build a lookup from UI auto-number (e.g. "1-1", "1-2-1") -> DB task id
    const idByAuto = new Map();
    task.subtasks
      .filter(sub => !sub.is_deleted)
      .forEach((subtask, subIndex) => {
        const key = getHierarchicalAutoNumber(stableProjectIndex, subIndex, null);
        if (subtask?.id) idByAuto.set(key, subtask.id);
        (subtask.childSubtasks || [])
          .filter(child => !child.is_deleted)
          .forEach((child, childIndex) => {
            const childKey = getHierarchicalAutoNumber(stableProjectIndex, subIndex, childIndex);
            if (child?.id) idByAuto.set(childKey, child.id);
          });
      });

    const resolvePredecessorId = (row) => {
      // If already set, keep it
      if (row.predecessorId) return row.predecessorId;
      const raw = row.predecessors != null ? String(row.predecessors) : '';
      const tokens = raw
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(Boolean);
      if (tokens.length === 0) return null;
      // For strict sequential workflow we use the first predecessor token
      const token = tokens[0];
      return idByAuto.get(token) || null;
    };

    return task.subtasks
      .filter(sub => !sub.is_deleted) // Filter out deleted subtasks
      .map((subtask, subIndex) => {
        const subAssigneeId = subtask.assignedEmployeeId || (subtask.assignedEmployee?.id) || (typeof subtask.assignedEmployee === 'string' ? subtask.assignedEmployee : null) || null;
        const formattedSubtask = {
          id: subtask.id,
          name: subtask.name || '',
          title: subtask.name || '',
          status: subtask.status || 'not started',
          priority: subtask.priority || 'Low',
          category: subtask.category || null,
          referenceNumber: subtask.referenceNumber || null,
          planDays: subtask.planDays || null,
          remarks: subtask.remarks || null,
          assigneeNotes: subtask.assigneeNotes || null,
          assignedEmployee: subAssigneeId,
          assignedEmployeeId: subAssigneeId,
          assignedEmployeeData: subtask.assignedEmployee || null, // Store full employee object for display
          location: subtask.location || null,
          makaniNumber: subtask.makaniNumber || null,
          plotNumber: subtask.plotNumber || null,
          community: subtask.community || null,
          projectType: subtask.projectType || null,
          projectFloor: subtask.projectFloor || null,
          developerProject: subtask.developerProject || null,
          description: subtask.description || subtask.remarks || null,
          tags: Array.isArray(subtask.tags) ? subtask.tags : [],
          createdBy: subtask.createdBy || null,
          predecessors: subtask.predecessors || null,
          predecessorId: resolvePredecessorId(subtask),
          // Simple execution order for this subtask within its parent project row
          taskOrder: typeof subtask.taskOrder === 'number'
            ? subtask.taskOrder
            : subIndex + 1,
        };

        // Handle timeline/dates
        if (subtask.timeline && Array.isArray(subtask.timeline) && subtask.timeline.length >= 2) {
          formattedSubtask.timeline = subtask.timeline;
          formattedSubtask.startDate = subtask.timeline[0] ? new Date(subtask.timeline[0]).toISOString() : null;
          formattedSubtask.endDate = subtask.timeline[1] ? new Date(subtask.timeline[1]).toISOString() : null;
        } else if (subtask.startDate || subtask.endDate) {
          formattedSubtask.startDate = subtask.startDate ? new Date(subtask.startDate).toISOString() : null;
          formattedSubtask.endDate = subtask.endDate ? new Date(subtask.endDate).toISOString() : null;
        }

        // Format child subtasks
        if (subtask.childSubtasks && subtask.childSubtasks.length > 0) {
          formattedSubtask.childSubtasks = subtask.childSubtasks
            .filter(child => !child.is_deleted)
            .map((childSubtask, childIndex) => {
                const assigneeId = childSubtask.assignedEmployeeId || (childSubtask.assignedEmployee?.id) || (typeof childSubtask.assignedEmployee === 'string' ? childSubtask.assignedEmployee : null) || null;
              const formattedChild = {
                id: childSubtask.id,
                name: childSubtask.name || '',
                title: childSubtask.name || '',
                status: childSubtask.status || 'not started',
                priority: childSubtask.priority || 'Low',
                category: childSubtask.category || null,
                referenceNumber: childSubtask.referenceNumber || null,
                planDays: childSubtask.planDays || null,
                remarks: childSubtask.remarks || null,
                assigneeNotes: childSubtask.assigneeNotes || null,
                assignedEmployee: assigneeId,
                assignedEmployeeId: assigneeId,
                assignedEmployeeData: childSubtask.assignedEmployee || null, // Store full employee object for display
                location: childSubtask.location || null,
                makaniNumber: childSubtask.makaniNumber || null,
                plotNumber: childSubtask.plotNumber || null,
                community: childSubtask.community || null,
                projectType: childSubtask.projectType || null,
                projectFloor: childSubtask.projectFloor || null,
                developerProject: childSubtask.developerProject || null,
                description: childSubtask.description || childSubtask.remarks || null,
                tags: Array.isArray(childSubtask.tags) ? childSubtask.tags : [],
                createdBy: childSubtask.createdBy || null,
                predecessors: childSubtask.predecessors || null,
                predecessorId: resolvePredecessorId(childSubtask),
                // Simple execution order for child tasks within their subtask
                taskOrder: typeof childSubtask.taskOrder === 'number'
                  ? childSubtask.taskOrder
                  : childIndex + 1,
              };

              // Handle timeline/dates for child subtasks
              if (childSubtask.timeline && Array.isArray(childSubtask.timeline) && childSubtask.timeline.length >= 2) {
                formattedChild.timeline = childSubtask.timeline;
                formattedChild.startDate = childSubtask.timeline[0] ? new Date(childSubtask.timeline[0]).toISOString() : null;
                formattedChild.endDate = childSubtask.timeline[1] ? new Date(childSubtask.timeline[1]).toISOString() : null;
              } else if (childSubtask.startDate || childSubtask.endDate) {
                formattedChild.startDate = childSubtask.startDate ? new Date(childSubtask.startDate).toISOString() : null;
                formattedChild.endDate = childSubtask.endDate ? new Date(childSubtask.endDate).toISOString() : null;
              }

              return formattedChild;
            });
        }

        return formattedSubtask;
      });
  };
  
  // Chat handlers
  // Handle Tender button click - show confirmation modal
  const handleTenderClick = (task) => {
    setTenderProject(task);
    setSelectedEngineerIds(new Set()); // Reset selection
    setShowTenderConfirmation(true);
  };
  
  // Toggle engineer selection (only whitelisted)
  const toggleEngineerSelection = (engineerId) => {
    const engineer = availableEngineers.find(e => e.id === engineerId);
    if (!engineer || engineer.engineerListing !== "Whitelisted") {
      return; // Only allow selection of whitelisted engineers
    }
    
    setSelectedEngineerIds((prev) => {
      const next = new Set(prev);
      if (next.has(engineerId)) {
        next.delete(engineerId);
      } else {
        next.add(engineerId);
      }
      return next;
    });
  };

  // Handle Tender confirmation - send tender (no navigation)
  const handleTenderConfirm = async () => {
    if (tenderProject) {
      if (selectedEngineerIds.size === 0) {
        alert("Please select at least one engineer.");
        return;
      }
      
      const selectedEngineers = availableEngineers.filter(
        (e) => selectedEngineerIds.has(e.id) && e.engineerListing === "Whitelisted"
      );
      
      // Show loading state
      const loadingMessage = `Sending tender invitations to ${selectedEngineers.length} engineer(s)...`;
      console.log(loadingMessage);
      
      try {
        // Send tender invitations via email
        const result = await sendTenderInvitations(tenderProject, selectedEngineers);
        
        if (result.success) {
          // Success: Emails sent via API
          alert(
            `✓ Tender invitations sent successfully!\n\n` +
            `Project: ${tenderProject.name}\n` +
            `Reference: ${tenderProject.referenceNumber || 'N/A'}\n` +
            `Sent to: ${result.sentCount} engineer(s)\n\n` +
            `Tender Link: ${result.tenderLink}\n\n` +
            `All selected engineers have been notified via email with the tender invitation link.`
          );
        } else if (result.fallback) {
          // Fallback: Show mailto links if API fails
          const engineerList = selectedEngineers.map(e => `  • ${e.name} (${e.email})`).join('\n');
          const mailtoInfo = result.mailtoLinks.map(link => 
            `  ${link.name}: ${link.mailto}`
          ).join('\n');
          
          const userChoice = window.confirm(
            `⚠ Email API is not available. Would you like to send invitations manually?\n\n` +
            `Selected Engineers:\n${engineerList}\n\n` +
            `Tender Link: ${result.tenderLink}\n\n` +
            `Click OK to open email clients, or Cancel to copy the link.`
          );
          
          if (userChoice) {
            // Open mailto links for each engineer
            result.mailtoLinks.forEach((link, index) => {
              setTimeout(() => {
                window.location.href = link.mailto;
              }, index * 500); // Stagger the opens
            });
          } else {
            // Copy link to clipboard
            navigator.clipboard.writeText(result.tenderLink).then(() => {
              alert(
                `Tender link copied to clipboard!\n\n` +
                `Link: ${result.tenderLink}\n\n` +
                `You can share this link with the selected engineers manually.`
              );
            }).catch(() => {
              alert(
                `Tender Link:\n${result.tenderLink}\n\n` +
                `Please share this link with the selected engineers:\n${engineerList}`
              );
            });
          }
        }
      } catch (error) {
        console.error('Error sending tender invitations:', error);
        alert(
          `Error sending tender invitations: ${error.message}\n\n` +
          `Please try again or contact support.`
        );
        return; // Don't close modal on error
      }
      
      // Close modal and reset state on success
      setShowTenderConfirmation(false);
      setTenderProject(null);
      setSelectedEngineerIds(new Set());
    }
  };

  // Handle Tender confirmation cancel
  const handleTenderCancel = () => {
    setShowTenderConfirmation(false);
    setTenderProject(null);
    setSelectedEngineerIds(new Set());
  };

  const handleOpenChat = (item, type = 'project') => {
    setChatProject(item);
    setChatType(type);
    setIsChatOpen(true);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setChatProject(null);
  };

  // Handle engineer invitation
  const handleInviteEngineer = (inviteData) => {
    console.log('Inviting engineer:', inviteData);
    // Here you would typically send an API request to invite the engineer
    // For now, we'll just show a success message
    alert(`Engineer ${inviteData.engineerName} has been invited to work on "${inviteData.taskName}"!`);
    
    // You could also update the task's assignee here
    // setTasks(prevTasks => 
    //   prevTasks.map(task => 
    //     task.id === inviteData.taskId 
    //       ? { ...task, owner: inviteData.engineerId }
    //       : task
    //   )
    // );
  };

  // Copy/Paste handlers
  const handleCopyTask = (task) => {
    if (!task) {
      setToast({ message: 'Error: Invalid task', type: 'error' });
      return;
    }
    setCopiedTask(task);
    setToast({ message: `Task "${task.name}" copied to clipboard`, type: 'success' });
  };

  const handleCopySubtask = (subtask, parentTask) => {
    if (!subtask || !parentTask) {
      setToast({ message: 'Error: Invalid subtask or parent task', type: 'error' });
      return;
    }
    setCopiedSubtask({ ...subtask, parentTaskId: parentTask.id, parentTaskName: parentTask.name });
    setToast({ message: `Subtask "${subtask.name}" copied to clipboard`, type: 'success' });
  };

  const handleCopyChildTask = (childTask, parentSubtask, parentTask) => {
    if (!childTask || !parentSubtask || !parentTask) {
      setToast({ message: 'Error: Invalid child task, parent subtask, or parent task', type: 'error' });
      return;
    }
    setCopiedChildTask({ 
      ...childTask, 
      parentSubtaskId: parentSubtask.id, 
      parentSubtaskName: parentSubtask.name,
      parentTaskId: parentTask.id,
      parentTaskName: parentTask.name 
    });
    setToast({ message: `Child task "${childTask.name}" copied to clipboard`, type: 'success' });
  };

  const handlePasteTask = (targetTask) => {
    if (!copiedTask) {
      setToast({ message: 'No task copied to clipboard', type: 'error' });
      return;
    }
    if (!targetTask) {
      setToast({ message: 'Error: Invalid target task', type: 'error' });
      return;
    }

    // Create a new task based on the copied task
    const newTask = {
      ...copiedTask,
      id: Date.now(),
      name: `${copiedTask.name} (Copy)`,
      referenceNumber: `REF-${Date.now()}`,
      subtasks: copiedTask.subtasks.map(subtask => ({
        ...subtask,
        id: Date.now() + Math.random(),
        name: `${subtask.name} (Copy)`
      }))
    };

    // Add the new task to the tasks array
    setTasks(prevTasks => [...prevTasks, newTask]);
    setToast({ message: `Task "${newTask.name}" pasted successfully`, type: 'success' });
  };

  const handlePasteSubtask = (targetTask) => {
    if (!copiedSubtask) {
      setToast({ message: 'No subtask copied to clipboard', type: 'error' });
      return;
    }
    if (!targetTask) {
      setToast({ message: 'Error: Invalid target task', type: 'error' });
      return;
    }

    // Create a new subtask based on the copied subtask
    const newSubtask = {
      ...copiedSubtask,
      id: Date.now(),
      name: `${copiedSubtask.name} (Copy)`,
      childSubtasks: copiedSubtask.childSubtasks?.map(child => ({
        ...child,
        id: Date.now() + Math.random(),
        name: `${child.name} (Copy)`
      })) || []
    };

    // Add the new subtask to the target task
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === targetTask.id 
          ? { ...task, subtasks: [...task.subtasks, newSubtask] }
          : task
      )
    );
    setToast({ message: `Subtask "${newSubtask.name}" pasted to "${targetTask.name}"`, type: 'success' });
  };

  const handlePasteChildTask = (targetSubtask, targetTask) => {
    if (!copiedChildTask) {
      setToast({ message: 'No child task copied to clipboard', type: 'error' });
      return;
    }
    if (!targetSubtask || !targetTask) {
      setToast({ message: 'Error: Invalid target subtask or task', type: 'error' });
      return;
    }

    // Create a new child task based on the copied child task
    const newChildTask = {
      ...copiedChildTask,
      id: Date.now(),
      name: `${copiedChildTask.name} (Copy)`
    };

    // Add the new child task to the target subtask
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === targetTask.id 
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === targetSubtask.id
                  ? { ...subtask, childSubtasks: [...(subtask.childSubtasks || []), newChildTask] }
                  : subtask
              )
            }
          : task
      )
    );
    setToast({ message: `Child task "${newChildTask.name}" pasted to "${targetSubtask.name}"`, type: 'success' });
  };

  // Bulk Copy/Paste handlers
  const handleBulkCopy = () => {
    const selectedTasks = tasks.filter(task => selectedTaskIds.has(task.id));
    const selectedSubtasks = [];
    const selectedChildTasks = [];

    // Collect selected subtasks and child tasks
    tasks.forEach(task => {
      if (task.subtasks) {
        task.subtasks.forEach(subtask => {
          if (selectedSubtaskIds.has(subtask.id)) {
            selectedSubtasks.push({
              ...subtask,
              parentTaskId: task.id,
              parentTaskName: task.name
            });
          }
          
          // Collect child tasks
          if (subtask.childSubtasks) {
            subtask.childSubtasks.forEach(childTask => {
              if (selectedSubtaskIds.has(childTask.id)) {
                selectedChildTasks.push({
                  ...childTask,
                  parentSubtaskId: subtask.id,
                  parentSubtaskName: subtask.name,
                  parentTaskId: task.id,
                  parentTaskName: task.name
                });
              }
            });
          }
        });
      }
    });

    // Remove duplicates from selectedTasks to prevent multiple copies
    const uniqueTasks = selectedTasks.filter((task, index, self) => 
      index === self.findIndex(t => t.id === task.id)
    );

    console.log('Copy operation - Selected tasks:', selectedTasks.map(t => ({ id: t.id, name: t.name })));
    console.log('Copy operation - Unique tasks:', uniqueTasks.map(t => ({ id: t.id, name: t.name })));

    setBulkCopiedItems({
      tasks: uniqueTasks,
      subtasks: selectedSubtasks,
      childTasks: selectedChildTasks
    });

    const totalItems = uniqueTasks.length + selectedSubtasks.length + selectedChildTasks.length;
    setToast({ 
      message: `${totalItems} items copied to clipboard (${uniqueTasks.length} tasks, ${selectedSubtasks.length} subtasks, ${selectedChildTasks.length} child tasks)`, 
      type: 'success' 
    });
  };

  const handleBulkPaste = () => {
    if (bulkCopiedItems.tasks.length === 0 && bulkCopiedItems.subtasks.length === 0 && bulkCopiedItems.childTasks.length === 0) {
      setToast({ message: 'No items copied to clipboard', type: 'error' });
      return;
    }

    setShowBulkPasteModal(true);
  };

  const executeBulkPaste = (targetTask) => {
    console.log('executeBulkPaste called with:', { targetTask, bulkCopiedItems });
    
    // Prevent multiple executions - check if there's anything to paste
    if (bulkCopiedItems.tasks.length === 0 && bulkCopiedItems.subtasks.length === 0 && bulkCopiedItems.childTasks.length === 0) {
      console.log('No items to paste, skipping');
      return;
    }
    
    // Check if paste is already in progress
    if (isPasteInProgress.current) {
      console.log('Paste already in progress, skipping');
      return;
    }
    
    // Set paste in progress flag
    isPasteInProgress.current = true;
    
    const newTasks = [];
    const newSubtasks = [];
    const newChildTasks = [];

    // Handle project duplication (when targetTask is null)
    if (!targetTask && bulkCopiedItems.tasks.length > 0) {
      console.log('Duplicating projects...');
      
      // Copy tasks (projects) - create new independent projects
      // Use a Set to track unique projects to avoid duplicates
      const processedTaskIds = new Set();
      
      console.log('Processing tasks:', bulkCopiedItems.tasks.map(t => ({ id: t.id, name: t.name })));
      
      bulkCopiedItems.tasks.forEach(task => {
        // Skip if we've already processed this task (avoid duplicates)
        if (processedTaskIds.has(task.id)) {
          console.log('Skipping duplicate task:', task.id, task.name);
          return;
        }
        processedTaskIds.add(task.id);
        console.log('Processing task:', task.id, task.name);
        
        const newTask = {
          ...task,
          id: Date.now() + Math.random(),
          name: `${task.name} (Copy)`,
          referenceNumber: `REF-${Date.now()}`,
          subtasks: task.subtasks?.map(subtask => ({
            ...subtask,
            id: Date.now() + Math.random(),
            name: `${subtask.name} (Copy)`,
            childSubtasks: subtask.childSubtasks?.map(child => ({
              ...child,
              id: Date.now() + Math.random(),
              name: `${child.name} (Copy)`
            })) || []
          })) || []
        };
        newTasks.push(newTask);
      });

      // Add new projects to the tasks list (at the beginning)
      if (newTasks.length > 0) {
        console.log('Adding new tasks to list:', newTasks.map(t => ({ id: t.id, name: t.name })));
        setTasks(prev => {
          console.log('Previous tasks count:', prev.length);
          console.log('Previous tasks:', prev.map(t => ({ id: t.id, name: t.name })));
          const updated = [...newTasks, ...prev];
          console.log('Updated tasks count:', updated.length);
          console.log('Updated tasks:', updated.map(t => ({ id: t.id, name: t.name })));
          return updated;
        });
      }
    }

    // Copy subtasks to target task
    if (targetTask && bulkCopiedItems.subtasks.length > 0) {
      const targetTaskIndex = tasks.findIndex(t => t.id === targetTask.id);
      if (targetTaskIndex !== -1) {
        const updatedTasks = [...tasks];
        bulkCopiedItems.subtasks.forEach(subtask => {
          const newSubtask = {
            ...subtask,
            id: Date.now() + Math.random(),
            name: `${subtask.name} (Copy)`,
            childSubtasks: subtask.childSubtasks?.map(child => ({
              ...child,
              id: Date.now() + Math.random(),
              name: `${child.name} (Copy)`
            })) || []
          };
          updatedTasks[targetTaskIndex].subtasks.push(newSubtask);
        });
        setTasks(updatedTasks);
      }
    }

    // Copy child tasks to target subtask
    if (targetTask && bulkCopiedItems.childTasks.length > 0) {
      const targetTaskIndex = tasks.findIndex(t => t.id === targetTask.id);
      if (targetTaskIndex !== -1) {
        const updatedTasks = [...tasks];
        bulkCopiedItems.childTasks.forEach(childTask => {
          const targetSubtask = updatedTasks[targetTaskIndex].subtasks.find(s => s.id === childTask.parentSubtaskId);
          if (targetSubtask) {
            const newChildTask = {
              ...childTask,
              id: Date.now() + Math.random(),
              name: `${childTask.name} (Copy)`
            };
            if (!targetSubtask.childSubtasks) {
              targetSubtask.childSubtasks = [];
            }
            targetSubtask.childSubtasks.push(newChildTask);
          }
        });
        setTasks(updatedTasks);
      }
    }

    // Note: newTasks are already added above at line 496, no need to add again

    const totalPasted = newTasks.length + bulkCopiedItems.subtasks.length + bulkCopiedItems.childTasks.length;
    
    // Show appropriate success message
    if (newTasks.length > 0) {
      setToast({
        message: `${newTasks.length} project(s) duplicated successfully`,
        type: 'success'
      });
    } else if (targetTask && (bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0)) {
      const transferredCount = bulkCopiedItems.subtasks.length + bulkCopiedItems.childTasks.length;
      setToast({
        message: `${transferredCount} task(s)/subtask(s) transferred to "${targetTask.name}" successfully`,
        type: 'success'
      });
    }

    // Clear the clipboard after paste to prevent multiple pastes
    setBulkCopiedItems({
      tasks: [],
      subtasks: [],
      childTasks: []
    });

    setShowBulkPasteModal(false);
    setPasteTarget(null);
    
    // Reset paste in progress flag
    isPasteInProgress.current = false;
  };

  const closeBulkPasteModal = () => {
    setShowBulkPasteModal(false);
    setPasteTarget(null);
  };

  // Enhanced filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Export functionality
  const handleExport = () => {
    // Get the current filtered tasks (excluding soft-deleted items)
    const activeTasks = filterActiveItems(getFilteredTasks());
    
    if (activeTasks.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for export
    const exportData = activeTasks.map(task => ({
      'Project Name': task.name,
      'Reference Number': task.referenceNumber || '',
      'Category': task.category || '',
      'Status': task.status,
      'Owner': task.owner,
      'Start Date': task.timeline[0] ? task.timeline[0].toLocaleDateString() : '',
      'End Date': task.timeline[1] ? task.timeline[1].toLocaleDateString() : '',
      'Plan Days': task.planDays || 0,
      'Priority': task.priority,
      'Progress': `${task.progress || 0}%`,
      'Location': task.location || '',
      'Plot Number': task.plotNumber || '',
      'Community': task.community || '',
      'Project Type': task.projectType || '',
      'Project Floor': task.projectFloor || '',
      'Developer Project': task.developerProject || '',
      'Remarks': task.remarks || '',
      'Assignee Notes': task.assigneeNotes || '',
      'Rating': task.rating || 0,
      'Checklist': task.checklist ? 'Yes' : 'No',
      'Pinned': task.pinned ? 'Yes' : 'No',
      'Subtasks Count': task.subtasks ? task.subtasks.filter(sub => !sub.is_deleted).length : 0
    }));

    // Store export data and show modal
    setExportData(exportData);
    setShowExportModal(true);
  };



  // Load projects from backend API
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [employees, setEmployees] = useState([]);
  
  // Ref to hold latest tasks state for async persistence
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  
  // Fetch projects from backend API on mount and when employee deep-links ?projectId= (My Projects → My Tasks)
  useEffect(() => {
    loadProjectsFromAPI();
  }, [location.search, location.pathname]);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Fetch employees for assigned employee dropdown
  const loadEmployees = async () => {
    try {
      console.log('📡 Loading employees for assignment dropdown...');
      // Pass forTaskAssignment=true so managers only see their team members
      const response = await getEmployees({ forTaskAssignment: true });
      if (response.success && response.data) {
        // Ensure response.data is an array
        const employeesList = Array.isArray(response.data) ? response.data : [];
        setEmployees(employeesList);
        console.log(`✅ Loaded ${employeesList.length} employees for assignment dropdown`);
        
        if (employeesList.length === 0) {
          console.warn('⚠️  No employees found. The dropdown will be empty.');
        }
      } else {
        console.error('❌ Failed to load employees:', response.message || 'Unknown error');
        setEmployees([]);
      }
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      setEmployees([]);
    }
  };

  const loadProjectsFromAPI = async () => {
    try {
      setLoadingProjects(true);
      console.log('📡 Fetching projects from backend API...');
      
      const response = await getProjects();
      
      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.length} projects from API`);
        
        // Helper function to map backend Task to frontend subtask/child format
        const mapBackendTaskToSubtask = (t) => ({
          id: t.id,
          name: t.title || '',
          referenceNumber: t.referenceNumber || null,
          category: t.category || 'Design',
          status: t.status === 'PENDING' ? 'not started' :
                  t.status === 'IN_PROGRESS' ? 'working' :
                  t.status === 'COMPLETED' ? 'done' :
                  t.status === 'CANCELLED' ? 'cancelled' :
                  t.status === 'ON_HOLD' ? 'on hold' : 'not started',
          priority: t.priority === 'LOW' ? 'Low' :
                    t.priority === 'HIGH' ? 'High' :
                    t.priority === 'MEDIUM' ? 'Medium' :
                    t.priority === 'URGENT' ? 'Urgent' : 'Medium',
          owner: '',
          assignedEmployee: t.assignedEmployeeId || (t.assignedEmployee?.id) || (typeof t.assignedEmployee === 'string' ? t.assignedEmployee : null) || null,
          assignedEmployeeData: t.assignedEmployee || null, // Store full employee object for display
          timeline: [
            t.startDate ? new Date(t.startDate) : null,
            t.dueDate ? new Date(t.dueDate) : null
          ],
          planDays: t.planDays || 0,
          remarks: t.remarks || '',
          assigneeNotes: t.assigneeNotes || '',
          attachments: [],
          location: t.location || '',
          makaniNumber: t.makaniNumber || null,
          plotNumber: t.plotNumber || null,
          community: t.community || null,
          projectType: t.projectType || null,
          projectFloor: t.projectFloor || null,
          developerProject: t.developerProject || null,
          description: t.description || '',
          notes: t.description || '',
          predecessors: t.predecessors || '',
          predecessorId: t.predecessorId || null,
          workflowStatus: t.workflowStatus || 'NOT_STARTED',
          checklist: false,
          checklistItems: [],
          link: '',
          rating: 0,
          tags: [],
          childSubtasks: (t.subtasks || []).map(mapBackendTaskToSubtask), // Recursive mapping for nested child tasks
        });
        
        // Map backend projects to frontend task format
        const mappedTasks = response.data.map(project => {
          // Get the primary contract (most recent one)
          const primaryContract = project.contracts && project.contracts.length > 0 
            ? project.contracts[0] 
            : null;
          
          // Map backend tasks to frontend subtasks
          const subtasks = (project.tasks || []).map(mapBackendTaskToSubtask);
          console.log(`📋 Project ${project.id} (${project.name}): ${subtasks.length} subtasks loaded`);
          
          return {
            id: project.id,
            projectNumber: project.projectNumber ?? null,
            name: project.name || 'Untitled Project',
            // Use contract reference number if available (from Load Out), otherwise use project reference number
            referenceNumber: primaryContract?.referenceNumber || project.referenceNumber || '',
            pin: project.pin || '',
            client: project.client?.name || '',
            clientId: project.clientId || null,
            owner: project.projectManager || '', // Map backend projectManager (string) to frontend owner field
            category: 'General',
            status: project.status === 'OPEN' ? 'Pending' : 
                    project.status === 'IN_PROGRESS' ? 'In Progress' :
                    project.status === 'COMPLETED' ? 'Done' :
                    project.status === 'CANCELLED' ? 'Cancelled' :
                    project.status === 'ON_HOLD' ? 'Suspended' : 'Pending',
            timeline: [
              project.startDate ? new Date(project.startDate) : null,
              project.endDate ? new Date(project.endDate) : null
            ],
            planDays: project.planDays || 0,
            remarks: project.remarks || '',
            assigneeNotes: project.assigneeNotes || '',
            attachments: [],
            priority: 'Low',
            // Use project data first (from Load Out), then fall back to contract data
            location: project.location || '',
            plotNumber: project.plotNumber || primaryContract?.plotNumber || '',
            community: project.community || primaryContract?.community || '',
            projectType: project.projectType || primaryContract?.contractType || 'Residential',
            projectFloor: project.projectFloor || primaryContract?.numberOfFloors?.toString() || '',
            developerProject: project.developerProject || primaryContract?.developerName || '',
            // Store original project reference number (may differ from contract reference if conflict occurred)
            contractReferenceNumber: primaryContract?.referenceNumber || '',
            contractId: primaryContract?.id || null,
            contracts: project.contracts || [], // Store all contracts
            notes: project.description || '',
            autoNumber: 0,
            predecessors: project.predecessors || '',
            checklist: false,
            checklistItems: [],
            link: '',
            rating: 0,
            progress: 0,
            color: '#60a5fa',
            subtasks: subtasks, // Use mapped subtasks from project.tasks
            expanded: false,
            createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
          };
        });

        // Keep projects in stable numeric order so "AUTO #" doesn't swap
        // when a new project is added (newest-first ordering causes index-based numbering to shift).
        mappedTasks.sort((a, b) => {
          const ap = Number.isFinite(Number(a.projectNumber)) ? Number(a.projectNumber) : null;
          const bp = Number.isFinite(Number(b.projectNumber)) ? Number(b.projectNumber) : null;
          if (ap != null && bp != null) return ap - bp;
          if (ap != null) return -1;
          if (bp != null) return 1;
          return (a.createdAt?.getTime?.() ?? 0) - (b.createdAt?.getTime?.() ?? 0);
        });

        // Derive workflowStatus for subtasks based on predecessors and auto-number sequence.
        // This ensures that when a predecessor row (e.g. 1-1) is marked "done",
        // its dependents (e.g. 1-2) move from WAITING_FOR_PREDECESSOR to NOT_STARTED/IN_PROGRESS
        // for the next employee.
        const tasksWithWorkflow = mappedTasks.map((projectTask, projectIndex) => {
          const subtasks = Array.isArray(projectTask.subtasks) ? projectTask.subtasks : [];
          if (subtasks.length === 0) {
            return projectTask;
          }

          // Prefer DB-backed projectNumber for stable hierarchical keys.
          const stableProjectIndex =
            Number.isFinite(Number(projectTask.projectNumber)) && Number(projectTask.projectNumber) > 0
              ? Number(projectTask.projectNumber) - 1
              : projectIndex;

          // Build lookup of predecessor auto numbers → completion status
          const statusByAutoKey = new Map();
          subtasks.forEach((sub, subIndex) => {
            const autoKey = getHierarchicalAutoNumber(stableProjectIndex, subIndex, null);
            const statusLower = (sub.status || '').toString().toLowerCase();
            const isDone = statusLower === 'done' || statusLower === 'completed';
            statusByAutoKey.set(autoKey, isDone);
          });

          const updatedSubtasks = subtasks.map((sub, subIndex) => {
            const autoKey = getHierarchicalAutoNumber(stableProjectIndex, subIndex, null);
            const rawPredecessors = sub.predecessors != null ? String(sub.predecessors) : '';
            const tokens = rawPredecessors
              .split(/[,\s]+/)
              .map(t => t.trim())
              .filter(Boolean);

            let isWaitingForPredecessor = false;
            if (tokens.length > 0) {
              for (const token of tokens) {
                const predIsDone = statusByAutoKey.get(token);
                if (predIsDone === false) {
                  isWaitingForPredecessor = true;
                  break;
                }
              }
            }

            const statusLower = (sub.status || '').toString().toLowerCase();
            let workflowStatus;
            if (isWaitingForPredecessor) {
              workflowStatus = 'WAITING_FOR_PREDECESSOR';
            } else if (statusLower === 'done' || statusLower === 'completed') {
              workflowStatus = 'COMPLETED';
            } else if (statusLower === 'working' || statusLower === 'in progress') {
              workflowStatus = 'IN_PROGRESS';
            } else {
              workflowStatus = 'NOT_STARTED';
            }

            return {
              ...sub,
              autoNumber: autoKey,
              workflowStatus,
            };
          });

          return {
            ...projectTask,
            subtasks: updatedSubtasks,
          };
        });

        // Employee ERP: My Projects → /employee/tasks?projectId=… shows only that project
        const qs = new URLSearchParams(location.search || "");
        const filterProjectId = isEmployee ? qs.get("projectId") : null;
        const finalTasks =
          filterProjectId
            ? tasksWithWorkflow.filter((t) => String(t.id) === String(filterProjectId))
            : tasksWithWorkflow;

        setTasks(finalTasks);

        // Also save to localStorage for backward compatibility
        try {
          localStorage.setItem("projectTasks", JSON.stringify(finalTasks));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      } else {
        console.warn('⚠️ No projects returned from API');
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error loading projects from API:', error);
      
      // Fallback to localStorage if API fails
      try {
        const savedTasks = localStorage.getItem('projectTasks');
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          const mapped = parsed.map(task => ({
            ...task,
            timeline: task.timeline ? task.timeline.map(date => date ? new Date(date) : null) : null,
            subtasks: task.subtasks ? task.subtasks.map(subtask => ({
              ...subtask,
              timeline: subtask.timeline ? subtask.timeline.map(date => date ? new Date(date) : null) : null
            })) : []
          }));
          setTasks(mapped);
          console.log('📦 Loaded projects from localStorage as fallback');
        } else {
          setTasks(initialTasks);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setTasks(initialTasks);
      }
    } finally {
      setLoadingProjects(false);
    }
  };
  
  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('projectTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);
  
  // Sync drawerTask with updated task from main table
  useEffect(() => {
    if (drawerTask && tasks) {
      const updatedTask = tasks.find(t => t.id === drawerTask.id);
      if (updatedTask && updatedTask !== drawerTask) {
        setDrawerTask(updatedTask);
        console.log('Drawer task synced with main table:', updatedTask);
      }
    }
  }, [tasks, drawerTask]);
  
  // Use shared search and filter hook
  const {
    search,
    setSearch,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    isSearching,
    clearAllFilters,
    filterTasks,
    getFilteredTasks,
    getActiveFilterCount,
    hasActiveFilters,
  } = useSearchAndFilters(tasks);

  // Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [selectedSubtaskIds, setSelectedSubtaskIds] = useState(new Set());
  const [showBulkEditDrawer, setShowBulkEditDrawer] = useState(false);
  const [showBulkViewDrawer, setShowBulkViewDrawer] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Initialize reference tracker when component mounts
  useEffect(() => {
    // Import and initialize reference tracker
    import('./utils/referenceNumberGenerator').then(({ initializeReferenceTracker }) => {
      initializeReferenceTracker(tasks);
    });
  }, [tasks]); // Add tasks as dependency

  // Function to manually initialize reference tracker (useful for debugging)
  const initializeReferenceTracker = () => {
    import('./utils/referenceNumberGenerator').then(({ initializeReferenceTracker: initTracker }) => {
      initTracker(tasks);
    });
  };

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [showNewTask, setShowNewTask] = useState(false);
  // Add state for subtask form
  const [showSubtaskForm, setShowSubtaskForm] = useState(null); // taskId or null
  const [newSubtask, setNewSubtask] = useState(createNewSubtask());
  // Add state for editing subtasks
  const [editingSubtask, setEditingSubtask] = useState({}); // {subId_colKey: true}
  const [editSubValue, setEditSubValue] = useState("");
  const [showAddColumnDropdown, setShowAddColumnDropdown] = useState(false);
  // Add two separate expanded state objects
  const [expandedActive, setExpandedActive] = useState({}); // For active projects - start with no projects expanded
  const [expandedCompleted, setExpandedCompleted] = useState({}); // For completed projects
  // Track a single expanded project id for conditional headers
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [newTask, setNewTask] = useState(null);
  // Add a state for rating prompt
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // { type: 'main'|'sub'|'completed', taskId, subId }
  const [mapPickerCoords, setMapPickerCoords] = useState({ lat: null, lng: null });
  // Add GoogleMapPicker demo modal
  const [googleMapPickerOpen, setGoogleMapPickerOpen] = useState(false);
  const [projectStartDate, setProjectStartDate] = useState(new Date()); // Add project start date state
  
  // Checklist modal state
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [checklistModalTarget, setChecklistModalTarget] = useState(null); // { type: 'main'|'sub'|'child', taskId, subId }
  const [checklistModalItems, setChecklistModalItems] = useState([]);
  
  // Questionnaire modal state
  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const [questionnaireResponseModalOpen, setQuestionnaireResponseModalOpen] = useState(false);
  const [questionnaireModalTarget, setQuestionnaireModalTarget] = useState(null); // { projectId, taskId, subtaskId }
  
  // Attachments modal state
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [attachmentsModalTarget, setAttachmentsModalTarget] = useState(null); // { type: 'main'|'sub'|'child', taskId, subId }
  const [attachmentsModalItems, setAttachmentsModalItems] = useState([]);
  
  // Engineer invite modal state
  const [engineerInviteModalOpen, setEngineerInviteModalOpen] = useState(false);
  const [engineerInviteTarget, setEngineerInviteTarget] = useState(null); // { taskId, taskName, currentAssignee }
  
  // Contract Load Out modal state
  const [contractLoadOutModalOpen, setContractLoadOutModalOpen] = useState(false);
  
  

  // --- SVG ARROW CONNECTION LOGIC ---
  const mainTaskRefs = useRef({}); // {taskId: ref}
  const subTableRefs = useRef({}); // {taskId: ref}
  const [arrowPos, setArrowPos] = useState({}); // {taskId: {x1, y1, x2, y2}}
  // Add a ref for the main task name span
  const mainTaskNameRefs = useRef({}); // {taskId: ref}
  // Add a ref to track if paste operation is in progress
  const isPasteInProgress = useRef(false);

  useLayoutEffect(() => {
    const newArrowPos = {};
    tasks.forEach(task => {
      if (
        task.expanded &&
        task.subtasks.length > 0 &&
        mainTaskNameRefs.current[task.id] &&
        subTableRefs.current[task.id]
      ) {
        const nameRect = mainTaskNameRefs.current[task.id].getBoundingClientRect();
        const subRect = subTableRefs.current[task.id].getBoundingClientRect();
        // Adjust for scroll position
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        newArrowPos[task.id] = {
          x1: nameRect.right - scrollX,
          y1: nameRect.top + nameRect.height / 2 - scrollY,
          x2: subRect.left - scrollX,
          y2: subRect.top + 24 - scrollY // 24px down from top of subtable
        };
      }
    });
    setArrowPos(newArrowPos);
  }, [tasks, showSubtaskForm, search]);

  function handleToggleExpand(taskId) {
    setTasks(tasks =>
      tasks.map(t =>
        t.id === taskId ? { ...t, expanded: !t.expanded } : t
      )
    );
  }
  function handleMarkSubtaskComplete(taskId, subId) {
    setTasks(tasks =>
      tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(s =>
          s.id === subId ? { ...s, status: "done", completed: true } : s
        );
        // Check if all subtasks are done
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.status === 'done');
        return {
          ...t,
          subtasks: updatedSubtasks,
          status: allDone ? 'done' : t.status
        };
      })
    );
  }
  async function handleCreateTask() {
    if (!newTask) {
      return;
    }
    
    // Validate required fields
    // Project name validation removed - name is now optional
    // const errors = validateTask(newTask);
    const errors = []; // Skip name validation - allow saving with reference number only
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    try {
      // IMPORTANT: Save project to database via API
      // Map frontend status to backend enum values
      const statusMap = {
        'To Do': 'OPEN',
        'to do': 'OPEN',
        'ToDo': 'OPEN',
        'Pending': 'OPEN',
        'pending': 'OPEN',
        'not started': 'OPEN',
        'Not Started': 'OPEN',
        'In Progress': 'IN_PROGRESS',
        'in progress': 'IN_PROGRESS',
        'Done': 'COMPLETED',
        'done': 'COMPLETED',
        'Completed': 'COMPLETED',
        'completed': 'COMPLETED',
        'Cancelled': 'CANCELLED',
        'cancelled': 'CANCELLED',
        'Suspended': 'ON_HOLD',
        'suspended': 'ON_HOLD',
        'On Hold': 'ON_HOLD',
        'on hold': 'ON_HOLD',
      };
      
      // Map status: if status is "Done" or "Completed", use COMPLETED (won't count as active)
      // Otherwise default to OPEN (will count as active)
      const backendStatus = statusMap[newTask.status] || 'OPEN';
      
      // Validate that reference number is provided (required field)
      if (!newTask.referenceNumber || newTask.referenceNumber.trim() === '') {
        showToast('Reference number is required. Please enter a reference number before saving.', 'error');
        return;
      }

      // Map newTask to API format
      // Auto-generate project name if not provided
      let projectName = newTask.name && newTask.name.trim() !== '' 
        ? newTask.name.trim() 
        : (newTask.contractTitle || `Project ${newTask.referenceNumber.trim()}`);
      
      const projectData = {
        name: projectName,
        referenceNumber: newTask.referenceNumber.trim(),
        pin: newTask.pin || null,
        clientId: newTask.clientId || null,
        owner: newTask.owner || null,
        description: newTask.description || newTask.notes || null,
        status: backendStatus, // Use mapped enum value (OPEN, IN_PROGRESS, etc.)
        projectManager: newTask.owner || null, // Map frontend owner to backend projectManager (string)
        startDate: newTask.startDate || (newTask.timeline && newTask.timeline[0] ? new Date(newTask.timeline[0]) : null),
        endDate: newTask.endDate || (newTask.timeline && newTask.timeline[1] ? new Date(newTask.timeline[1]) : null),
        deadline: newTask.deadline || null,
        planDays: newTask.planDays ? parseInt(newTask.planDays, 10) : null,
        remarks: newTask.remarks || null,
        assigneeNotes: newTask.assigneeNotes || null,
      };
      
      // Include subtasks and childSubtasks in the payload
      if (newTask.subtasks && newTask.subtasks.length > 0) {
        const projectIndex = tasks.findIndex(t => t.id === newTask.id);
        projectData.subtasks = formatSubtasksForBackend(newTask, projectIndex);
      }
      
      console.log('📝 Creating project via API:', projectData);
      
      // Call backend API to create project
      const response = await createProject(projectData);
      
      if (response.success && response.data) {
        console.log('✅ Project created successfully in database:', response.data);
        
        // Create the task with data from API response
        const taskToAdd = {
          ...newTask,
          id: response.data.id || generateTaskId(), // Use ID from database
          referenceNumber: response.data.referenceNumber,
          status: response.data.status,
          expanded: false
        };
        
        // Update local state with the created project
        setTasks(tasks => {
          const updatedTasks = [...tasks, taskToAdd];
          return calculateTaskTimelines(updatedTasks, projectStartDate);
        });
        
        // Set flag to refresh dashboard immediately
        // This ensures Active Projects/Tasks counts are updated
        localStorage.setItem('dashboardNeedsRefresh', 'true');
        
        // Also trigger a custom event for real-time dashboard refresh
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        
        console.log('✅ Project created - Dashboard refresh triggered');
        
        // Show success message
        setToast({
          message: 'Project created successfully! Dashboard will update automatically.',
          type: 'success'
        });
        
        // Clear the new task form
        setNewTask(null);
        setShowNewTask(false);
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      
      // Show error message
      setToast({
        message: error.message || 'Failed to create project. Please try again.',
        type: 'error'
      });
      
      // Don't update local state if API call failed
      // This ensures UI and database stay in sync
    }
  }

  // Keyboard handlers for input fields
  const handleNewTaskKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      // Do NOT auto-create task on Enter; only the explicit
      // "Save" / "Create Task" button should trigger creation.
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setNewTask(null);
      setShowNewTask(false);
    }
  };

  const handleSubtaskKeyDown = (e, taskId) => {
    if (e.key === "Enter") {
      const tag = (e.target && e.target.tagName) ? String(e.target.tagName).toLowerCase() : '';
      // Allow multiline entry in textareas with normal Enter/Shift+Enter
      if (tag === 'textarea') {
        return;
      }
      // Shift+Enter should not submit/add (keeps future multiline patterns safe)
      if (e.shiftKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      // When the "new subtask" row is open, Enter should add/save it.
      if (showSubtaskForm === taskId) {
        handleAddSubtask(taskId);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowSubtaskForm(null);
      setNewSubtask(createNewSubtask());
    }
  };

  const handleChildSubtaskKeyDown = (e, taskId, parentSubtaskId) => {
    if (e.key === "Enter") {
      const tag = (e.target && e.target.tagName) ? String(e.target.tagName).toLowerCase() : '';
      if (tag === 'textarea') {
        return;
      }
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      // When the "new child task" row is open, Enter should add/save it.
      if (showChildSubtaskForm === parentSubtaskId) {
        handleAddChildSubtask(taskId, parentSubtaskId);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowChildSubtaskForm(null);
      setNewChildSubtask({
        name: "",
        referenceNumber: "",
        category: "Design",
        status: "not started",
        owner: "",
        assignedEmployee: "",
        timeline: [null, null],
        planDays: 0,
        remarks: "",
        assigneeNotes: "",
        attachments: [],
        priority: "Low",
        location: "",
        plotNumber: "",
        community: "",
        projectType: "Residential",
        projectFloor: "",
        developerProject: "",
        notes: "",
        predecessors: "",
        checklist: false,
        link: "",
        rating: 0
      });
    }
  };

  // Checkbox column handlers
  const handleEditTask = (task) => {
    // Open edit modal or inline edit for the task
    setSelectedProjectForSummary(task);
    setShowProjectDialog(true);
  };

  const handleDeleteTask = (taskId, parentTaskId = null) => {
    if (parentTaskId) {
      // Delete subtask
      setTasks(tasks => tasks.map(task => 
        task.id === parentTaskId 
          ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== taskId) }
          : task
      ));
    } else {
      // Delete main task
      setTasks(tasks => tasks.filter(task => task.id !== taskId));
    }
  };


  // Multi-select handlers
  const handleTaskSelection = (taskId, isChecked) => {
    console.log('handleTaskSelection called:', { taskId, isChecked });
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      console.log('Updated selectedTaskIds:', Array.from(newSet));
      return newSet;
    });
  };

  // Subtask selection handler
  const handleSubtaskSelection = (subtaskId, isChecked) => {
    console.log('handleSubtaskSelection called:', { subtaskId, isChecked });
    setSelectedSubtaskIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(subtaskId);
      } else {
        newSet.delete(subtaskId);
      }
      console.log('Updated selectedSubtaskIds:', Array.from(newSet));
      return newSet;
    });
  };

  // Handle select all projects
  const handleSelectAll = () => {
    const allFilteredTaskIds = filteredTasks.map(task => task.id);
    const allSelected = allFilteredTaskIds.length > 0 && allFilteredTaskIds.every(id => selectedTaskIds.has(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        allFilteredTaskIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        allFilteredTaskIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };

  const handleBulkEdit = (selectedTasks, selectedSubtasks = []) => {
    console.log('Bulk edit called with:', { selectedTasks, selectedSubtasks });
    setShowBulkEditDrawer(true);
  };

  const handleBulkDelete = (selectedTasks, selectedSubtasks = []) => {
    console.log('Bulk delete called with:', { selectedTasks, selectedSubtasks });
    
    let deletedItems = [];
    let itemType = '';
    let message = '';

    // --- Permission guard for EMPLOYEES ---
    if (isEmployee) {
      // Employees must never delete whole projects
      if (selectedTasks.length > 0) {
        showToast('Employees cannot delete projects. Please contact a project manager.', 'error');
        return;
      }

      // Filter subtasks/child tasks to only those the employee is allowed to delete
      const permittedSubtasks = selectedSubtasks.filter(sub => {
        const isChildTask = !!sub.parentSubtaskId;

        // Employees can ALWAYS delete CHILD tasks (indented rows)
        if (isChildTask) return true;

        // For SUBTASKS (non-indented), keep strict rules
        return (
          getCreatorId(sub.createdBy) === String(user?.id ?? '') ||
          (!sub.createdBy && sub.assignedEmployeeId === user?.id)
        );
      });

      if (permittedSubtasks.length === 0) {
        showToast('You do not have permission to delete the selected subtasks.', 'error');
        return;
      }

      // Use only the permitted subset for deletion
      selectedSubtasks = permittedSubtasks;
    }
    
    // Delete selected tasks from backend (only managers/admins reach this block for projects)
    if (selectedTasks.length > 0) {
      const deletePromises = selectedTasks.map(task => deleteProject(task.id));
      
      Promise.all(deletePromises)
        .then(() => {
          setTasks(tasks => {
            const taskIdsToDelete = new Set(selectedTasks.map(t => t.id));
            const updatedTasks = tasks.filter(t => !taskIdsToDelete.has(t.id));
            return calculateTaskTimelines(updatedTasks, projectStartDate);
          });
          
          deletedItems = [...deletedItems, ...selectedTasks];
          itemType = 'project';
          message = `${selectedTasks.length} project${selectedTasks.length > 1 ? 's' : ''} deleted`;
          
          console.log(`✅ ${selectedTasks.length} project(s) deleted successfully`);
        })
        .catch((error) => {
          console.error('❌ Error deleting projects:', error);
          alert(`Failed to delete some projects: ${error.message || 'Unknown error'}`);
        });
      
      return; // Exit early since we're handling deletion asynchronously
    }
    
    // Soft delete selected subtasks (including child tasks) and persist to backend
    if (selectedSubtasks.length > 0) {
      const timestamp = Date.now();
      const selectedIds = new Set(selectedSubtasks.map(s => s.id));

      const applySoftDelete = (taskList) =>
        taskList.map(task => {
          if (!task.subtasks) return task;
          const updatedSubtasks = task.subtasks.map(subtask => {
            const isSubtaskSelected = selectedSubtasks.some(s => s.id === subtask.id && !s.parentSubtaskId);
            const updatedChildSubtasks = (subtask.childSubtasks || []).map(child =>
              selectedIds.has(child.id) ? { ...child, is_deleted: true, deleted_at: timestamp } : child
            );
            const withChildren = updatedChildSubtasks.length ? { ...subtask, childSubtasks: updatedChildSubtasks } : subtask;
            return isSubtaskSelected ? { ...withChildren, is_deleted: true, deleted_at: timestamp } : withChildren;
          });
          return { ...task, subtasks: updatedSubtasks };
        });

      setTasks(tasks => calculateTaskTimelines(applySoftDelete(tasks), projectStartDate));

      const taskIdsToPersist = [...new Set(selectedSubtasks.map(s => s.parentTaskId).filter(Boolean))];
      const updatedTasksForPayload = applySoftDelete(tasks);
      taskIdsToPersist.forEach(taskId => {
        const task = updatedTasksForPayload.find(t => t.id === taskId);
        if (task) {
          const projectIndex = tasks.findIndex(t => t.id === task.id);
          const payload = { subtasks: formatSubtasksForBackend(task, projectIndex) };
          updateProject(taskId, payload)
            .then(() => loadProjectsFromAPI())
            .catch((err) => {
              console.error('Failed to persist bulk subtask/child deletion:', err);
              setToast({ type: 'error', message: err?.message || 'Failed to delete.' });
            });
        }
      });

      deletedItems = selectedSubtasks.map(s => ({ ...s, subtaskId: true, parentTaskId: s.parentTaskId, parentSubtaskId: s.parentSubtaskId }));
      itemType = 'subtask';
      message = `${selectedSubtasks.length} item${selectedSubtasks.length > 1 ? 's' : ''} deleted`;
    }

    if (deletedItems.length > 0) {
      undoManager.showUndoToast(deletedItems, itemType, message);
    }

    setSelectedTaskIds(new Set());
    setSelectedSubtaskIds(new Set());
  };

  // handleBulkCopy removed - replaced with new copy-paste functionality

  const handleBulkView = (selectedTasks, selectedSubtasks = []) => {
    console.log('Bulk view called with:', { selectedTasks, selectedSubtasks });
    setShowBulkViewDrawer(true);
  };

  // Handle pasted tasks from copy-paste functionality
  const handleTasksPasted = (pastedTasks) => {
    setTasks(prevTasks => [...prevTasks, ...pastedTasks]);
    
    // Show success message
    showToast(`Successfully pasted ${pastedTasks.length} task(s)`, 'success');
    
    // Clear selection after paste
    setSelectedTaskIds(new Set());
    setSelectedSubtaskIds(new Set());
  };

  const handleBulkSave = (selectedTasks, formData) => {
    setTasks(tasks => tasks.map(task => {
      if (selectedTasks.some(selectedTask => selectedTask.id === task.id)) {
        const updatedTask = { ...task };
        Object.keys(formData).forEach(field => {
          if (formData[field] !== '') {
            updatedTask[field] = formData[field];
          }
        });
        return updatedTask;
      }
      return task;
    }));
  };

  const handleClearSelection = () => {
    setSelectedTaskIds(new Set());
    setSelectedSubtaskIds(new Set());
  };

  // Helper function to get all selected subtasks
  const getAllSelectedSubtasks = () => {
    const selectedSubtasks = [];
    tasks.forEach(task => {
      if (task.subtasks) {
        task.subtasks.forEach(subtask => {
          if (selectedSubtaskIds.has(subtask.id)) {
            selectedSubtasks.push({ ...subtask, parentTaskId: task.id });
          }
          if (subtask.childSubtasks) {
            subtask.childSubtasks.forEach(childSubtask => {
              if (selectedSubtaskIds.has(childSubtask.id)) {
                selectedSubtasks.push({ ...childSubtask, parentTaskId: task.id, parentSubtaskId: subtask.id });
              }
            });
          }
        });
      }
    });
    return selectedSubtasks;
  };
  
  // Toast handler
  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };
  
  const hideToast = () => {
    setToast(null);
  };

  function handleAddSubtask(taskId) {
    // Find the parent task to get its reference number
    const parentTask = tasks.find(t => t.id === taskId);
    if (!parentTask) {
      console.error('❌ Parent task not found:', taskId);
      return;
    }
    
    // Create subtask with auto-generated reference number based on parent
    const newSubtaskData = {
      ...createNewSubtask(parentTask.referenceNumber),
      ...newSubtask
    };
    
    // Build updated task with new subtask
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? { ...t, subtasks: [...(t.subtasks || []), newSubtaskData] }
        : t
    );
    const withTimeline = calculateTaskTimelines(updatedTasks, projectStartDate);
    const updatedTask = withTimeline.find(t => t.id === taskId);

    // Update local state
    setTasks(() => withTimeline);
    setShowSubtaskForm(null);
    setNewSubtask(createNewSubtask());

    // CRITICAL: Persist to backend immediately
    const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
    const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
    console.log('💾 Saving subtask to backend:', { 
      taskId, 
      subtaskName: newSubtaskData.name,
      totalSubtasks: payload.subtasks.length,
      payload: JSON.stringify(payload, null, 2)
    });
    
    updateProject(taskId, payload)
      .then((response) => {
        console.log('✅ Subtask saved successfully:', response);
        localStorage.setItem('dashboardNeedsRefresh', 'true');
        // Reload from API to get real IDs
        loadProjectsFromAPI();
      })
      .catch((err) => {
        console.error('❌ Failed to save subtask:', err);
        console.error('Error details:', err.response?.data || err.message);
        setToast({ 
          type: 'error', 
          message: err?.response?.data?.message || err?.message || 'Failed to save subtask. Please try again.' 
        });
      });
  }

  function handleEditSubtask(taskId, subId, col, value) {
    console.log('=== HANDLE EDIT SUBTASK CALLED ===');
    console.log('handleEditSubtask called with:', { taskId, subId, col, value });
    
    // Handle engineer invite modal opening
    if (col === 'inviteEngineer') {
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === subId);
      setEngineerInviteTarget({
        taskId: subtask.id,
        taskName: subtask.name,
        currentAssignee: subtask.owner
      });
      setEngineerInviteModalOpen(true);
      return;
    }
    
    // Handle checklist modal opening
    if (col === 'openChecklistModal') {
      setChecklistModalTarget({ type: 'sub', taskId, subId });
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === subId);
      setChecklistModalItems(subtask?.checklistItems || []);
      setChecklistModalOpen(true);
      return;
    }
    
    // Handle attachments modal opening
    if (col === 'openAttachmentsModal') {
      setAttachmentsModalTarget({ type: 'sub', taskId, subId });
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === subId);
      setAttachmentsModalItems(subtask?.attachments || []);
      setAttachmentsModalOpen(true);
      return;
    }

    // Handle delete case
    if (col === 'delete') {
      handleDeleteRow(subId, taskId);
      return;
    }

    setTasks(tasks => {
      let updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        const idx = t.subtasks.findIndex(sub => sub.id === subId);
        let updatedSubtasks = t.subtasks.map(sub => ({ ...sub }));
        // Update the changed subtask
        updatedSubtasks[idx] = (() => {
          if (col === 'timeline') {
            const [start, end] = value;
            let planDays = 0;
            if (isValid(start) && isValid(end)) {
              planDays = differenceInCalendarDays(end, start) + 1;
            }
            return { ...updatedSubtasks[idx], timeline: value, planDays };
          } else if (col === 'planDays') {
            const [start, end] = updatedSubtasks[idx].timeline || [];
            if (isValid(start) && value > 0) {
              const newEnd = addDays(new Date(start), value - 1);
              return { ...updatedSubtasks[idx], planDays: value, timeline: [start, newEnd] };
            }
            return { ...updatedSubtasks[idx], planDays: value };
          } else if (col === 'category') {
            // Apply category value, then auto-update reference number when category changes
            const withCategory = { ...updatedSubtasks[idx], category: value };
            const parentTask = tasks.find(t => t.id === taskId);
            const updatedSubtask = updateSubtaskReferenceNumber(withCategory, parentTask?.referenceNumber, t.subtasks);
            return updatedSubtask;
          } else if (col === 'status') {
            // When status is changed to done by employee, force progress to 100%
            const isDone = value === 'done' || value === 'Done' || value === 'DONE';
            const nextProgress = isDone ? 100 : (updatedSubtasks[idx].progress ?? 0);
            return {
              ...updatedSubtasks[idx],
              status: value,
              progress: nextProgress,
            };
          } else {
            return { ...updatedSubtasks[idx], [col]: value };
          }
        })();
        
        // If all subtasks are done, set main task status to 'done'
        const allDone = areAllSubtasksComplete(updatedSubtasks);
        // Calculate progress of subtasks (forces 100% when all done)
        const avgProgress = calculateTaskProgress(updatedSubtasks);
        return {
          ...t,
          subtasks: updatedSubtasks,
          status: allDone ? 'done' : t.status,
          progress: allDone ? 100 : avgProgress,
        };
      });
      
      // If predecessors, timeline, or planDays changed, recalculate all timelines
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });

    // CRITICAL: Persist changes to backend after state update
    setTimeout(() => {
      const currentTasks = tasksRef.current;
      const updatedTask = currentTasks.find(t => t.id === taskId);
      if (!updatedTask) {
        console.error('❌ Task not found for persistence:', taskId);
        return;
      }
      
      const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
      const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
      console.log('💾 Persisting subtask edit to backend:', { taskId, subId, col, value, payload });
      
      updateProject(taskId, payload)
        .then((response) => {
          console.log('✅ Subtask edit saved successfully:', response);
        })
        .catch((err) => {
          console.error('❌ Failed to save subtask edit:', err);
          console.error('Error details:', err.response?.data || err.message);
        });
    }, 200);
  }

  function handleSaveSubtaskRow(subId, taskId) {
    try {
      const currentTasks = tasksRef.current;
      const updatedTask = currentTasks.find(t => t.id === taskId);
      if (!updatedTask) {
        console.error('❌ Task not found for manual subtask save:', taskId);
        return;
      }

      const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
      const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
      console.log('💾 Manually saving subtask row to backend:', { taskId, subId, payload });

      updateProject(taskId, payload)
        .then((response) => {
          console.log('✅ Subtask row manually saved successfully:', response);
          setToast({
            type: 'success',
            message: 'Subtask changes saved.',
          });
        })
        .catch((err) => {
          console.error('❌ Failed to manually save subtask row:', err);
          console.error('Error details:', err.response?.data || err.message);
          setToast({
            type: 'error',
            message: err?.response?.data?.message || err?.message || 'Failed to save subtask. Please try again.',
          });
        });
    } catch (error) {
      console.error('❌ Unexpected error in handleSaveSubtaskRow:', error);
    }
  }

  function startEditSubtask(subId, colKey, value) {
    setEditingSubtask({ [`${subId}_${colKey}`]: true });
    setEditSubValue(value);
  }

  // Update toggleExpand to accept a type (active/completed) and control single expanded project
  function toggleExpand(taskId, type = 'active') {
    if (type === 'active') {
      setExpandedProjectId(prevId => {
        const nextId = prevId === taskId ? null : taskId;
        // Sync expandedActive so only the selected project is expanded
        setExpandedActive(() => {
          const newState = {};
          tasks.forEach(t => {
            newState[t.id] = nextId !== null && t.id === nextId;
          });
          return newState;
        });
        return nextId;
      });
    } else {
      setExpandedCompleted(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    }
  }

  function handleDeleteRow(id, parentTaskId = null) {
    if (parentTaskId) {
      // Handle subtask deletion
      const task = tasks.find(t => t.id === parentTaskId);
      const subtask = task?.subtasks.find(sub => sub.id === id);
      
      if (subtask) {
        const timestamp = Date.now();
        setTasks(tasks => {
          const updatedTasks = tasks.map(t => {
            if (t.id === parentTaskId) {
              const updatedSubtasks = t.subtasks.map(sub => 
                sub.id === id 
                  ? { ...sub, is_deleted: true, deleted_at: timestamp }
                  : sub
              );
              return { ...t, subtasks: updatedSubtasks };
            }
            return t;
          });
          return calculateTaskTimelines(updatedTasks, projectStartDate);
        });
        
        // Show undo toast for subtask - add subtaskId to identify it as a subtask
        const subtaskWithId = { ...subtask, subtaskId: true, parentTaskId };
        undoManager.showUndoToast([subtaskWithId], 'subtask', `Subtask "${subtask.name}" deleted`);

        // CRITICAL: Persist deletion to backend
        setTimeout(() => {
          const currentTasks = tasksRef.current;
          const updatedTask = currentTasks.find(t => t.id === parentTaskId);
          if (!updatedTask) {
            console.error('❌ Task not found for deletion persistence:', parentTaskId);
            return;
          }
          
          const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
          const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
          console.log('💾 Persisting subtask deletion to backend:', { parentTaskId, subtaskId: id, payload });
          
          updateProject(parentTaskId, payload)
            .then((response) => {
              console.log('✅ Subtask deletion saved successfully:', response);
            })
            .catch((err) => {
              console.error('❌ Failed to save subtask deletion:', err);
              console.error('Error details:', err.response?.data || err.message);
            });
        }, 200);
      }
    } else {
      // Handle main task deletion
      const taskToDelete = tasks.find(t => t.id === id);
      
      if (taskToDelete) {
        // Call backend API to delete the project
        deleteProject(id)
          .then(() => {
            // Remove from local state after successful deletion
            setTasks(tasks => {
              const updatedTasks = tasks.filter(t => t.id !== id);
              return calculateTaskTimelines(updatedTasks, projectStartDate);
            });
            
            console.log(`✅ Project "${taskToDelete.name}" deleted successfully`);
          })
          .catch((error) => {
            console.error('❌ Error deleting project:', error);
            alert(`Failed to delete project: ${error.message || 'Unknown error'}`);
            // Optionally restore the project in the UI if deletion failed
          });
      }
    }
  }

  function handleAddNewTask() {
    // Open Contract Load Out modal instead of directly creating a project
    setContractLoadOutModalOpen(true);
  }

  function handleContractLoadOutSuccess(createdProjects) {
    // Refresh the project list after successful load out
    loadProjectsFromAPI();
    // Show success message
    if (createdProjects && createdProjects.length > 0) {
      showToast(`Successfully created ${createdProjects.length} project(s) from contract(s)`, 'success');
    } else {
      showToast('Projects created successfully. Refreshing list...', 'success');
    }
  }

  function handleEdit(task, col, value) {
    // Handle checklist modal opening
    if (col === 'openChecklistModal') {
      setChecklistModalTarget({ type: 'main', taskId: task.id, subId: null });
      setChecklistModalItems(task.checklistItems || []);
      setChecklistModalOpen(true);
      return;
    }
    
    // Handle attachments modal opening
    if (col === 'openAttachmentsModal') {
      setAttachmentsModalTarget({ type: 'main', taskId: task.id, subId: null });
      setAttachmentsModalItems(task.attachments || []);
      setAttachmentsModalOpen(true);
      return;
    }

    // Check if status is being updated (affects Active Tasks count)
    const isStatusUpdate = col === 'status';
    const statusValues = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'pending', 'In Progress', 'Done', 'Cancelled', 'Suspended'];
    const isStatusChange = isStatusUpdate && statusValues.includes(value);

    // Fields that should be saved to backend when changed
    const backendFields = ['name', 'referenceNumber', 'pin', 'status', 'owner', 'projectType', 
                           'plotNumber', 'community', 'projectFloor', 'developerProject', 
                           'location', 'makaniNumber', 'planDays', 'remarks', 'assigneeNotes',
                           'startDate', 'endDate', 'deadline'];
    
    // Check if this is a field that should be saved to backend
    const shouldSaveToBackend = backendFields.includes(col) && task.id;

    setTasks(tasks => {
      const idx = tasks.findIndex(t => t.id === task.id);
      let updatedTasks = tasks.map(t => ({ ...t }));
      // Update the changed task
      updatedTasks[idx] = (() => {
        if (col === 'timeline') {
          const [start, end] = value;
          let planDays = 0;
          if (isValid(start) && isValid(end)) {
            planDays = differenceInCalendarDays(end, start) + 1;
          }
          return { ...updatedTasks[idx], timeline: value, planDays };
        } else if (col === 'planDays') {
          // For project-level tasks, only update planDays without changing timeline
          // Timeline updates should only happen for tasks and subtasks, not projects
          return { ...updatedTasks[idx], planDays: value };
        } else if (col === 'category') {
          // Auto-update reference number when category changes
          const updatedTask = updateTaskReferenceNumber(updatedTasks[idx], value, tasks);
          return updatedTask;
        } else {
          return { ...updatedTasks[idx], [col]: value };
        }
      })();
      
      // If predecessors or timeline changed, recalculate all timelines
      // Note: planDays changes at project level no longer trigger timeline recalculation
      if (col === 'predecessors' || col === 'timeline') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
    
    // Save to backend if this is a backend field
    if (shouldSaveToBackend) {
      // Map frontend field names to backend field names
      const backendPayload = {};
      
      // Map status from frontend to backend enum
      if (col === 'status') {
        const statusMap = {
          'Pending': 'OPEN',
          'In Progress': 'IN_PROGRESS',
          'Done': 'COMPLETED',
          'Cancelled': 'CANCELLED',
          'Suspended': 'ON_HOLD'
        };
        backendPayload.status = statusMap[value] || value;
      } else if (col === 'owner') {
        // Map owner to projectManager in backend
        backendPayload.projectManager = value || null;
      } else if (col === 'timeline') {
        // Map timeline to startDate and endDate
        const [start, end] = value;
        backendPayload.startDate = start ? new Date(start).toISOString() : null;
        backendPayload.endDate = end ? new Date(end).toISOString() : null;
      } else {
        // Direct mapping for other fields
        const fieldMap = {
          'projectType': 'projectType',
          'plotNumber': 'plotNumber',
          'community': 'community',
          'projectFloor': 'projectFloor',
          'developerProject': 'developerProject',
          'location': 'location',
          'makaniNumber': 'makaniNumber',
          'planDays': 'planDays',
          'remarks': 'remarks',
          'assigneeNotes': 'assigneeNotes',
          'name': 'name',
          'referenceNumber': 'referenceNumber',
          'pin': 'pin'
        };
        
        if (fieldMap[col]) {
          backendPayload[fieldMap[col]] = value || null;
        }
      }
      
      // Include subtasks and childSubtasks in the payload
      const updatedTask = tasks.find(t => t.id === task.id);
      if (updatedTask) {
        const projectIndex = tasks.findIndex(t => t.id === task.id);
        backendPayload.subtasks = formatSubtasksForBackend(updatedTask, projectIndex);
      }
      
      // Save to backend
      updateProject(task.id, backendPayload)
        .then(response => {
          console.log('✅ Project updated successfully:', response);
        })
        .catch(error => {
          console.error('❌ Error updating project:', error);
          // Optionally show error message to user
        });
    }
    
    // Set flag to refresh dashboard when status changes (affects Active Tasks count)
    if (isStatusChange) {
      localStorage.setItem('dashboardNeedsRefresh', 'true');
    }
  }

  function handleOpenMapPicker(type, taskId, subId, latLngStr) {
    setMapPickerTarget({ type, taskId, subId });
    setGoogleMapPickerOpen(true);
  }
  function handlePickLocation(lat, lng) {
    if (!mapPickerTarget) return;
    const value = formatLocationString(lat, lng);
    if (mapPickerTarget.type === 'main') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, location: value } : t));
    } else if (mapPickerTarget.type === 'sub') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === mapPickerTarget.subId ? { ...s, location: value } : s) } : t));
    }
    setGoogleMapPickerOpen(false);
  }

  // Handle project start date changes and recalculate all timelines
  function handleProjectStartDateChange(newStartDate) {
    setProjectStartDate(newStartDate);
    // Timeline recalculation will be handled by the useEffect that watches projectStartDate
  }

  // Handle pin/unpin functionality
  function handleTogglePin(taskId) {
    setTasks(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, pinned: !task.pinned } : task
    ));
  }



  // Recalculate timelines whenever tasks or projectStartDate change
  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

  // Cleanup undo manager on unmount
  useEffect(() => {
    return () => {
      undoManager.cleanup();
    };
  }, [undoManager]);

  // Filter and sort tasks - pinned tasks first, then by existing sorting
  // Also filter out soft-deleted items
  const filteredTasks = filterActiveItems(getFilteredTasks()).sort((a, b) => {
    // First sort by pinned status (pinned tasks first)
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then maintain existing order within each group
    return 0;
  });

  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  // Column visibility state - all columns visible by default
  const [visibleColumns, setVisibleColumns] = useState(() => 
    INITIAL_COLUMNS.map(col => col.key)
  );

  // Store column order in state
  const defaultColumnOrder = getDefaultColumnOrder(columns);
  const [columnOrder, setColumnOrder] = useState(() => {
    return loadColumnOrderFromStorage(defaultColumnOrder);
  });
  useEffect(() => {
    saveColumnOrderToStorage(columnOrder);
  }, [columnOrder]);

  // Force refresh column order when component mounts to include new fields
  useEffect(() => {
    const currentOrder = columnOrder;
    const allColumns = getDefaultColumnOrder(columns);
    const missingColumns = getMissingColumns(currentOrder, allColumns);
    
    if (missingColumns.length > 0) {
      const newOrder = [...currentOrder, ...missingColumns];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    }
  }, [columns]);

  // Ensure checkbox column is always first
  useEffect(() => {
    console.log('Current columnOrder:', columnOrder);
    if (!columnOrder.includes('checkbox')) {
      console.log('Adding checkbox column to columnOrder');
      const newOrder = ['checkbox', ...columnOrder];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    } else if (columnOrder[0] !== 'checkbox') {
      console.log('Moving checkbox column to first position');
      const newOrder = ['checkbox', ...columnOrder.filter(col => col !== 'checkbox')];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    }
  }, [columnOrder]);

  const completedTasks = filterCompletedTasks(tasks);







  // Add handleDragEnd function
  function handleDragEnd(event) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        
        // Check if both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // Add state for add column menu
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const [addColumnMenuPos, setAddColumnMenuPos] = useState({ x: 0, y: 0 });
  const [addColumnSearch, setAddColumnSearch] = useState('');

  function handleShowAddColumnMenu(e) {
    const rect = e.target.getBoundingClientRect();
    const dropdownWidth = 288; // w-72 in px
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 16; // 16px margin from right
      if (left < 0) left = 0;
    }
    setAddColumnMenuPos({ x: left, y: rect.bottom });
    setShowAddColumnMenu(true);
  }
  function handleAddColumn(type) {
    const newCol = createNewColumn(type);
    setColumns(cols => [...cols, newCol]);
    setColumnOrder(order => [...order, newCol.key]);
    setTasks(ts => addColumnToTasks(ts, newCol.key));
    setShowAddColumnMenu(false);
    setAddColumnSearch('');
  }

  // Column visibility functions
  const handleToggleColumn = (columnKey) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnKey)) {
        // Hide column
        return prev.filter(key => key !== columnKey);
      } else {
        // Show column
        return [...prev, columnKey];
      }
    });
  };

  const handleResetColumns = () => {
    setVisibleColumns(INITIAL_COLUMNS.map(col => col.key));
  };
  const filteredColumnOptions = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ].filter(opt => opt.label.toLowerCase().includes(addColumnSearch.toLowerCase()));

  // Function to reset column order to include all columns
  function resetColumnOrder() {
    const allColumns = getDefaultColumnOrder(columns);
    console.log('Resetting column order. All columns:', allColumns);
    setColumnOrder(allColumns);
    saveColumnOrderToStorage(allColumns);
  }

  // Add the handler for subtask drag end
  function handleSubtaskDragEnd(event, taskId) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id === over.id) return;
    
    setTasks(tasks =>
      tasks.map(task => {
        if (task.id !== taskId) return task;
        const oldIndex = task.subtasks.findIndex(sub => sub.id === active.id);
        const newIndex = task.subtasks.findIndex(sub => sub.id === over.id);
        
        // Check if both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return task;
        }
        
        return {
          ...task,
          subtasks: arrayMove(task.subtasks, oldIndex, newIndex)
        };
      })
    );
  }

  // Add the handler for project reordering
  function handleProjectDragEnd(event) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id === over.id) return;
    
    setTasks(tasks => {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);
      
      // Check if both indices are valid
      if (oldIndex === -1 || newIndex === -1) {
        return tasks;
      }
      
      return arrayMove(tasks, oldIndex, newIndex);
    });
  }

  // Add state for child subtask form
  const [showChildSubtaskForm, setShowChildSubtaskForm] = useState(null); // subId or null
  const [newChildSubtask, setNewChildSubtask] = useState({
    name: "",
    referenceNumber: "",
    category: "Design",
    status: "not started",
    owner: "",
    assignedEmployee: "",
    timeline: [null, null],
    planDays: 0,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: "",
    plotNumber: "",
    community: "",
    projectType: "Residential",
    projectFloor: "",
    developerProject: "",
    notes: "",
    predecessors: "",
    checklist: false,
    checklistItems: [],
    link: "",
    rating: 0
  });

  function handleAddChildSubtask(taskId, parentSubtaskId) {
    const parentTask = tasks.find(t => t.id === taskId);
    if (!parentTask) {
      console.error('❌ Parent task not found:', taskId);
      return;
    }
    
    const parentSubtask = parentTask.subtasks?.find(s => s.id === parentSubtaskId);
    if (!parentSubtask) {
      console.error('❌ Parent subtask not found:', parentSubtaskId);
      return;
    }

    const newChildSubtaskData = {
      ...createNewSubtask(),
      ...newChildSubtask,
      id: generateTaskId() // Ensure unique ID
    };
    
    // Build updated task with new child subtask
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? {
          ...t,
          subtasks: (t.subtasks || []).map(sub =>
            sub.id === parentSubtaskId
              ? {
                ...sub,
                childSubtasks: [
                  ...(sub.childSubtasks || []),
                  newChildSubtaskData
                ]
              }
              : sub
          )
        }
        : t
    );
    const withTimeline = calculateTaskTimelines(updatedTasks, projectStartDate);
    const updatedTask = withTimeline.find(t => t.id === taskId);

    // Update local state
    setTasks(() => withTimeline);
    setShowChildSubtaskForm(null);
    setNewChildSubtask({
      name: "",
      referenceNumber: "",
      category: "Design",
      status: "not started",
      owner: "",
      timeline: [null, null],
      planDays: 0,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      priority: "Low",
      location: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      notes: "",
      predecessors: "",
      checklist: false,
      checklistItems: [],
      link: "",
      rating: 0
    });

    // CRITICAL: Persist to backend immediately
    const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
    const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
    console.log('💾 Saving child subtask to backend:', { 
      taskId, 
      parentSubtaskId,
      childSubtaskName: newChildSubtaskData.name,
      totalSubtasks: payload.subtasks.length,
      payload: JSON.stringify(payload, null, 2)
    });
    
    updateProject(taskId, payload)
      .then((response) => {
        console.log('✅ Child subtask saved successfully:', response);
        localStorage.setItem('dashboardNeedsRefresh', 'true');
        // Reload from API to get real IDs
        loadProjectsFromAPI();
      })
      .catch((err) => {
        console.error('❌ Failed to save child subtask:', err);
        console.error('Error details:', err.response?.data || err.message);
        setToast({ 
          type: 'error', 
          message: err?.response?.data?.message || err?.message || 'Failed to save child subtask. Please try again.' 
        });
      });
  }

    function handleEditChildSubtask(taskId, parentSubtaskId, childSubtaskId, col, value) {
    // Handle checklist modal opening
    if (col === 'openChecklistModal') {
      setChecklistModalTarget({ type: 'child', taskId, subId: parentSubtaskId, childSubId: childSubtaskId });
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === parentSubtaskId);
      const childSubtask = subtask?.childSubtasks?.find(c => c.id === childSubtaskId);
      setChecklistModalItems(childSubtask?.checklistItems || []);
      setChecklistModalOpen(true);
      return;
    }
    
    // Handle attachments modal opening
    if (col === 'openAttachmentsModal') {
      setAttachmentsModalTarget({ type: 'child', taskId, subId: parentSubtaskId, childSubId: childSubtaskId });
      const task = tasks.find(t => t.id === taskId);
      const subtask = task?.subtasks?.find(s => s.id === parentSubtaskId);
      const childSubtask = subtask?.childSubtasks?.find(c => c.id === childSubtaskId);
      setAttachmentsModalItems(childSubtask?.attachments || []);
      setAttachmentsModalOpen(true);
      return;
    }

    setTasks(tasks => {
      const updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        
        const updatedSubtasks = t.subtasks.map(sub => {
          if (sub.id !== parentSubtaskId) return sub;
          
          const updatedChildSubtasks = sub.childSubtasks.map(child => {
            if (child.id !== childSubtaskId) return child;
            
            if (col === 'timeline') {
              const [start, end] = value;
              let planDays = 0;
              if (isValid(start) && isValid(end)) {
                planDays = differenceInCalendarDays(end, start) + 1;
              }
              return { ...child, timeline: value, planDays };
            } else if (col === 'planDays') {
              const [start, end] = child.timeline || [];
              if (isValid(start) && value > 0) {
                const newEnd = addDays(new Date(start), value - 1);
                return { ...child, planDays: value, timeline: [start, newEnd] };
            }
              return { ...child, planDays: value };
            } else {
              return { ...child, [col]: value };
            }
          });
          
          // If all child subtasks are done, set parent subtask status to 'done'
          const allDone = updatedChildSubtasks.length > 0 && updatedChildSubtasks.every(child => child.status === 'done');
          
          return {
            ...sub,
            childSubtasks: updatedChildSubtasks
          };
        });
        
        return {
          ...t,
          subtasks: updatedSubtasks
        };
      });
      
      // If timeline or planDays changed, recalculate all timelines
      if (col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });

    // CRITICAL: Persist changes to backend after state update
    setTimeout(() => {
      const currentTasks = tasksRef.current;
      const updatedTask = currentTasks.find(t => t.id === taskId);
      if (!updatedTask) {
        console.error('❌ Task not found for persistence:', taskId);
        return;
      }
      
      const projectIndex = tasks.findIndex(t => t.id === updatedTask.id);
      const payload = { subtasks: formatSubtasksForBackend(updatedTask, projectIndex) };
      console.log('💾 Persisting child subtask edit to backend:', { taskId, parentSubtaskId, childSubtaskId, col, value, payload });
      
      updateProject(taskId, payload)
        .then((response) => {
          console.log('✅ Child subtask edit saved successfully:', response);
        })
        .catch((err) => {
          console.error('❌ Failed to save child subtask edit:', err);
          console.error('Error details:', err.response?.data || err.message);
        });
    }, 200);
  }

  // Handle checklist modal save
  function handleChecklistSave(items) {
    if (!checklistModalTarget) return;
    
    const { type, taskId, subId, childSubId } = checklistModalTarget;
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        
        if (type === 'main') {
          // Update main task checklist
          return { ...t, checklistItems: items };
        } else if (type === 'sub') {
          // Update subtask checklist
          const updatedSubtasks = t.subtasks.map(sub => {
            if (sub.id !== subId) return sub;
            return { ...sub, checklistItems: items };
          });
          return { ...t, subtasks: updatedSubtasks };
        } else if (type === 'child') {
          // Update child subtask checklist
          const updatedSubtasks = t.subtasks.map(sub => {
            if (sub.id !== subId) return sub;
            const updatedChildSubtasks = sub.childSubtasks.map(child => {
              if (child.id !== childSubId) return child;
              return { ...child, checklistItems: items };
            });
            return { ...sub, childSubtasks: updatedChildSubtasks };
          });
          return { ...t, subtasks: updatedSubtasks };
        }
        
        return t;
      });
      
      return updatedTasks;
    });
  }
  
  // Handle attachments modal save
  function handleAttachmentsSave(attachments) {
    if (!attachmentsModalTarget) return;
    
    const { type, taskId, subId, childSubId } = attachmentsModalTarget;
    
    if (type === 'new') {
      // For new main tasks, update the newTask state
      setNewTask(nt => ({ ...nt, attachments: attachments }));
      return;
    }
    
    if (type === 'newSubtask') {
      // For new subtasks, update the newSubtask state
      setNewSubtask(nt => ({ ...nt, attachments: attachments }));
      return;
    }
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        
        if (type === 'main') {
          // Update main task attachments
          return { ...t, attachments: attachments };
        } else if (type === 'sub') {
          // Update subtask attachments
          const updatedSubtasks = t.subtasks.map(sub => {
            if (sub.id !== subId) return sub;
            return { ...sub, attachments: attachments };
          });
          return { ...t, subtasks: updatedSubtasks };
        } else if (type === 'child') {
          // Update child subtask attachments
          const updatedSubtasks = t.subtasks.map(sub => {
            if (sub.id !== subId) return sub;
            const updatedChildSubtasks = sub.childSubtasks.map(child => {
              if (child.id !== childSubId) return child;
              return { ...child, attachments: attachments };
            });
            return { ...sub, childSubtasks: updatedChildSubtasks };
          });
          return { ...t, subtasks: updatedSubtasks };
        }
        
        return t;
      });
      
      return updatedTasks;
    });
  }

  function startEditChildSubtask(childSubtaskId, colKey, value) {
    setEditingSubtask({ [`${childSubtaskId}_${colKey}`]: true });
    setEditSubValue(value);
  }

  function handleDeleteChildSubtask(taskId, parentSubtaskId, childSubtaskId) {
    // Find the child subtask to delete
    const task = tasks.find(t => t.id === taskId);
    const parentSubtask = task?.subtasks.find(sub => sub.id === parentSubtaskId);
    const childSubtask = parentSubtask?.childSubtasks.find(child => child.id === childSubtaskId);
    
    if (childSubtask) {
      const timestamp = Date.now();
      setTasks(tasks => {
        const updatedTasks = tasks.map(t => {
          if (t.id !== taskId) return t;
          
          const updatedSubtasks = t.subtasks.map(sub => {
            if (sub.id !== parentSubtaskId) return sub;
            
            const updatedChildSubtasks = sub.childSubtasks.map(child => 
              child.id === childSubtaskId 
                ? { ...child, is_deleted: true, deleted_at: timestamp }
                : child
            );
            
            // If all active child subtasks are done, set parent subtask status to 'done'
            const activeChildSubtasks = updatedChildSubtasks.filter(child => !child.is_deleted);
            const allDone = activeChildSubtasks.length > 0 && activeChildSubtasks.every(child => child.status === 'done');
            
            return {
              ...sub,
              childSubtasks: updatedChildSubtasks,
              status: allDone ? 'done' : sub.status
            };
          });
          
          return {
            ...t,
            subtasks: updatedSubtasks
          };
        });
        
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      });
      
      // Show undo toast for child subtask
      const childSubtaskWithId = { ...childSubtask, subtaskId: true, parentTaskId: taskId, parentSubtaskId };
      undoManager.showUndoToast([childSubtaskWithId], 'subtask', `Child subtask "${childSubtask.name}" deleted`);

      // CRITICAL: Persist deletion to backend using dedicated task delete API
      console.log('💾 Deleting child subtask from backend via /tasks/:id', {
        childSubtaskId,
        taskId,
        parentSubtaskId,
      });

      deleteTaskApi(childSubtaskId)
        .then((response) => {
          console.log('✅ Child subtask deletion saved successfully:', response);
          // Reload from API to ensure local state matches backend
          loadProjectsFromAPI();
        })
        .catch((err) => {
          console.error('❌ Failed to delete child subtask from backend:', err);
          setToast({
            type: 'error',
            message: err?.message || 'Failed to delete child task.',
          });
        });
    }
  }

  const getCreatorId = (createdBy) => {
    if (!createdBy) return null;
    if (typeof createdBy === 'string' || typeof createdBy === 'number') return String(createdBy);
    // common backend shapes
    if (createdBy.id != null) return String(createdBy.id);
    if (createdBy._id != null) return String(createdBy._id);
    if (createdBy.userId != null) return String(createdBy.userId);
    return null;
  };

  // Create a context-aware wrapper for child subtasks
  const createChildSubtaskEditHandler = (parentSubtaskId) => {
    return (taskId, childSubtaskId, col, value) => {
      handleEditChildSubtask(taskId, parentSubtaskId, childSubtaskId, col, value);
    };
  };

  // Direct wrapper for child subtask timeline editing
  const handleChildSubtaskTimelineEdit = (parentSubtaskId) => {
    return (val) => {
      // This is called by TimelineCell with just the value
      // We need to find the current context
      console.log('Timeline edit called with:', val, 'for parent subtask:', parentSubtaskId);
    };
  };

  // Custom cell renderer for child subtasks (projectIndex, subtaskIndex used for hierarchical auto-number)
  const renderChildSubtaskCell = (col, childSub, task, parentSubtaskId, childIdx, projectIndex, subtaskIndex) => {
    const isPrivileged = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'MANAGER'].includes(user?.role);
    const isCreator = getCreatorId(childSub.createdBy) === String(user?.id ?? '');
    const assigneeId = childSub.assignedEmployeeId ?? childSub.assignedEmployee ?? (childSub.assignedEmployeeData?.id);
    const isAssignee = !!assigneeId && assigneeId === user?.id;
    const canEditMainFields = isPrivileged || isCreator;
    const canEditAssigneeFields = isPrivileged || isCreator || isAssignee;

    switch (col.key) {
      case "task":
      case "project name":
        if (!canEditMainFields) {
          return (
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-xs">└─</span>
              <span className="text-xs font-bold text-gray-900 flex-1">{childSub.name || "—"}</span>
              <button onClick={() => handleOpenChat(childSub, 'child-task')} className="p-1 rounded-full hover:bg-gray-200" title="Open Chat">💬</button>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">└─</span>
            <input
              className="border rounded px-1 py-1 text-xs font-bold text-gray-900 flex-1"
              value={childSub.name}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "name", e.target.value)}
              onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
              placeholder="Task Name"
            />
            <button onClick={() => handleOpenChat(childSub, 'child-task')} className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center" title="Open Chat">💬</button>
          </div>
        );
      case "category":
      case "task category": {
        const catOpts = getTaskCategories();
        const val = childSub.category || catOpts[0] || "Design";
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{val}</span>;
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={val}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "category", e.target.value)}
          >
            {catOpts.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      case "referenceNumber":
      case "reference number":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.referenceNumber || "—"}</span>;
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.referenceNumber || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
        if (!canEditAssigneeFields) {
          const statusLabel = childSub.status === 'done' ? 'Done' : childSub.status === 'working' ? 'Working' : childSub.status === 'stuck' ? 'Stuck' : 'Not Started';
          return <span className={`inline-flex px-1 py-1 text-xs font-bold rounded ${statusColors[childSub.status] || 'bg-gray-200 text-gray-700'}`}>{statusLabel}</span>;
        }
        return (
          <select
            className={`border rounded px-1 py-1 text-xs font-bold w-full ${statusColors[childSub.status] || 'bg-gray-200 text-gray-700'}`}
            value={childSub.status}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "status", e.target.value)}
          >
            <option value="done">Done</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="not started">Not Started</option>
          </select>
        );
      case "owner":
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Child task employee badge clicked for invite:', childSub.owner);
              // Handle engineer invite for child task
              setEngineerInviteTarget({
                taskId: childSub.id,
                taskName: childSub.name,
                currentAssignee: childSub.owner
              });
              setEngineerInviteModalOpen(true);
            }}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm hover:bg-pink-300 transition-colors cursor-pointer"
            title={`Click to invite engineer to ${childSub.name}`}
          >
            {childSub.owner}
          </button>
        );
      case "timeline":
        const childTimelineHasPredecessors = childSub.predecessors && childSub.predecessors.toString().trim() !== '';
        if (!canEditMainFields) {
          const tl = childSub.timeline;
          const text = Array.isArray(tl) && tl.length >= 2 ? `${tl[0] ? new Date(tl[0]).toLocaleDateString() : '—'} – ${tl[1] ? new Date(tl[1]).toLocaleDateString() : '—'}` : '—';
          return <span className="text-xs text-gray-700">{text}</span>;
        }
        return (
          <TimelineCell 
            value={childSub.timeline} 
            onChange={val => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "timeline", val)} 
            hasPredecessors={childTimelineHasPredecessors} 
          />
        );
      case "priority": {
        const priorityValue = childSub.priority || "Low";
        if (!canEditMainFields) {
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">{priorityValue}</span>;
        }
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={priorityValue}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      }
      case "planDays":
        // Display child subtask's own planDays (will be summed in parent task)
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-1 py-1 text-xs w-16 text-center bg-gray-100 cursor-not-allowed"
            value={childSub.planDays || 0}
            readOnly={true}
            disabled={true}
            placeholder="Days"
            title="Plan days is not editable"
          />
        );
      case "remarks":
        if (!canEditAssigneeFields) return <span className="text-xs text-gray-700 block px-1 py-1 whitespace-pre-wrap">{childSub.remarks || "—"}</span>;
        return (
          <textarea
            className="border rounded px-1 py-1 text-xs w-full resize-none"
            value={childSub.remarks || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "remarks", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Remarks"
            rows={2}
          />
        );
      case "assigneeNotes":
        if (!canEditAssigneeFields) return <span className="text-xs text-gray-700 block px-1 py-1 whitespace-pre-wrap">{childSub.assigneeNotes || "—"}</span>;
        return (
          <textarea
            className="border rounded px-1 py-1 text-xs w-full resize-none"
            value={childSub.assigneeNotes || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "assigneeNotes", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Assignee notes"
            rows={2}
          />
        );
      case "assignedEmployee": {
        const rawChildAssignee =
          (childSub.assignedEmployeeId ?? childSub.assignedEmployee) ||
          (childSub.assignedEmployeeData?.id) ||
          (typeof childSub.assignedEmployee === 'string' ? childSub.assignedEmployee : null) ||
          '';
        const employeesListForChild = Array.isArray(employees) ? employees : [];
        const resolvedChildAssigneeId =
          employeesListForChild.find((emp) => emp?.id && (emp.id === rawChildAssignee || emp.email === rawChildAssignee))?.id ||
          (typeof rawChildAssignee === 'string' ? rawChildAssignee : '');
        const childEmployeeId = resolvedChildAssigneeId;
        let childEmployeeDisplayName = '';
        if (childSub.assignedEmployeeData) {
          childEmployeeDisplayName = `${childSub.assignedEmployeeData.firstName || ''} ${childSub.assignedEmployeeData.lastName || ''}`.trim() || childSub.assignedEmployeeData.email || '';
        } else if (childEmployeeId) {
          const foundEmployee = employeesListForChild.find(emp => emp.id === childEmployeeId || emp.email === childEmployeeId);
          if (foundEmployee) childEmployeeDisplayName = `${foundEmployee.firstName || ''} ${foundEmployee.lastName || ''}`.trim() || foundEmployee.email || '';
        }
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1" title={childEmployeeDisplayName}>{childEmployeeDisplayName || "—"}</span>;
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childEmployeeId}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "assignedEmployee", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            title={childEmployeeDisplayName || 'Select Employee'}
          >
            <option value="">{childEmployeeDisplayName || 'Select Employee'}</option>
            {employeesListForChild.length > 0 ? (
              employeesListForChild.map(emp => {
                const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.email || 'Unknown';
                if (!emp.id) return null;
                return <option key={emp.id} value={emp.id}>{empName}</option>;
              })
            ) : (
              <option value="" disabled>No employees available</option>
            )}
          </select>
        );
      }
      case "attachments":
        if (!canEditAssigneeFields) {
          return (
            <div className="text-xs text-gray-600">
              {childSub.attachments && childSub.attachments.length > 0 ? `${childSub.attachments.length} file(s)` : "—"}
            </div>
          );
        }
        return (
          <div>
            <button
              type="button"
              onClick={() => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "openAttachmentsModal", true)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
            >
              <PaperClipIcon className="w-3 h-3" />
              {childSub.attachments && childSub.attachments.length > 0 
                ? `${childSub.attachments.length} file(s)` 
                : 'Add files'
              }
            </button>
            {childSub.attachments && childSub.attachments.length > 0 && (
              <ul className="mt-1 text-xs text-gray-600">
                {childSub.attachments.slice(0, 2).map((file, idx) => (
                  <li key={idx} className="truncate">
                    {file.fileName || file.name || (typeof file === 'string' ? file : '')}
                  </li>
                ))}
                {childSub.attachments.length > 2 && (
                  <li className="text-gray-500">+{childSub.attachments.length - 2} more</li>
                )}
              </ul>
            )}
          </div>
        );
      case "location":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.location || "—"}</span>;
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-1 py-1 text-xs flex-1"
              value={childSub.location || ""}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "location", e.target.value)}
              placeholder="Location"
            />
            <button type="button" onClick={() => handleOpenMapPicker('child', task.id, childSub.id, childSub.location)} title="Pick on map" className="text-blue-500 hover:text-blue-700">
              <MapPinIcon className="w-4 h-4" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full bg-gray-50 cursor-not-allowed"
            value={childSub.plotNumber || ""}
            readOnly
            placeholder="—"
          />
        );
      case "community":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.community || "—"}</span>;
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.community || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "community", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Community"
          />
        );
      case "projectType":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.projectType || "—"}</span>;
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.projectType || "Residential"}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "projectType", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        );
      case "projectFloor":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.projectFloor || "—"}</span>;
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.projectFloor || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "projectFloor", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Floor"
          />
        );
      case "developerProject":
        if (!canEditMainFields) return <span className="text-xs text-gray-700 block px-1 py-1">{childSub.developerProject || "—"}</span>;
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.developerProject || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "developerProject", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Developer"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.notes || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "notes", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Notes"
          />
        );
      case "autoNumber":
        return <span className="text-xs text-gray-600">{typeof projectIndex === 'number' && typeof subtaskIndex === 'number'
          ? getHierarchicalAutoNumber(projectIndex, subtaskIndex, childIdx)
          : (childSub.autoNumber || childSub.id)}</span>;
      case "predecessors":
        // For child tasks we do not use predecessors; show read-only placeholder
        return (
          <span className="text-xs text-gray-400">—</span>
        );
      case "checklist":
        const childChecklistItems = childSub.checklistItems || [];
        const childHasChecklist = childChecklistItems.length > 0;
        
        // Determine which modal to open based on user role
        const handleChildChecklistClick = () => {
          if (isManager) {
            // Managers open questionnaire management modal for child sub-task
            setQuestionnaireModalTarget({
              projectId: task.id,
              taskId: null,
              subtaskId: childSub.id, // Use child sub-task ID
            });
            setQuestionnaireModalOpen(true);
          } else {
            // Employees open response modal for child sub-task
            setQuestionnaireModalTarget({
              projectId: task.id,
              taskId: null,
              subtaskId: childSub.id, // Use child sub-task ID
            });
            setQuestionnaireResponseModalOpen(true);
          }
        };
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={handleChildChecklistClick}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                childHasChecklist 
                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
              title={isManager ? 'Manage Questionnaire (Managers)' : 'Answer Questionnaire (Employees)'}
            >
              {childHasChecklist ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {childChecklistItems.length} items
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isManager ? 'Manage Checklist' : 'Answer Checklist'}
                </>
              )}
            </button>
          </div>
        );
      case "link":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.link || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "link", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Link"
          />
        );
      case "rating":
        const childRating = childSub.rating || 0;
        if (!canEditAssigneeFields) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${i <= childRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= childRating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <StarIcon
                key={i}
                className={`w-4 h-4 cursor-pointer transition ${i <= childRating ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => {
                  const next = childRating === i ? 0 : i;
                  handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "rating", next);
                }}
                fill={i <= childRating ? '#facc15' : 'none'}
              />
            ))}
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{childSub[col.key] || ""}</span>;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
      <style>{`
        .project-row { 
          background-color: #ffffff !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .project-row:hover { 
          background-color: #e6f4ff !important; 
        }
        .subtask-row { 
          background-color: #faf8f5 !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .subtask-row:hover { 
          background-color: #fff3cd !important; 
        }
        .childtask-row { 
          background-color: #f0f8ff !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .childtask-row:hover { 
          background-color: #e6f4ff !important; 
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        /* Ensure table fits full width */
        table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: auto !important;
        }
        /* Ensure table container scrolls properly */
        .table-scroll-container {
          overflow-x: auto !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
        }
        .table-scroll-container::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .table-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        /* Prevent white space on sides */
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        /* Ensure Filters component doesn't overflow */
        .filters-container {
          overflow-x: auto;
          overflow-y: visible;
        }
        .filters-container::-webkit-scrollbar {
          height: 4px;
        }
        .filters-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .filters-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 2px;
        }
        .filters-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      {/* Main Content - 2cm gap on right side to prevent cutoff */}
      <main className="flex flex-col flex-1 min-h-0 overflow-hidden pl-4 sm:pl-6 pr-[2cm]" style={{ width: '100%', maxWidth: '100%' }}>
        <div className="w-full pt-0 pb-0 flex-shrink-0">
                    <Filters
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            clearAllFilters={clearAllFilters}
            isSearching={isSearching}
            getActiveFilterCount={getActiveFilterCount}
            handleAddNewTask={handleAddNewTask}
            handleExport={handleExport}
            resetColumnOrder={resetColumnOrder}
            showAddColumnMenu={showAddColumnMenu}
            setShowAddColumnMenu={setShowAddColumnMenu}
            addColumnMenuPos={addColumnMenuPos}
            addColumnSearch={addColumnSearch}
            setAddColumnSearch={setAddColumnSearch}
            filteredColumnOptions={filteredColumnOptions}
            handleAddColumn={handleAddColumn}
            handleShowAddColumnMenu={handleShowAddColumnMenu}
            selectedTaskIds={selectedTaskIds}
            tasks={tasks}
            employees={employees}
          />
          
          {/* Search Results Counter */}
          {hasActiveFilters && hasActiveFilters() && (
            <div className="px-2 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Found <strong>{filteredTasks.length}</strong> task{filteredTasks.length !== 1 ? 's' : ''} 
                  {search && ` matching "${search}"`}
                  {getActiveFilterCount && getActiveFilterCount() > 0 && ' with applied filters'}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
            
            {/* Enhanced Table Container - Scrollable */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="w-full pl-0 pr-[2cm] py-0 bg-white flex-1 table-scroll-container" style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'auto', position: 'relative', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 'max-content', width: '100%', display: 'inline-block' }}>
                <table className="table-auto bg-white border-collapse border border-gray-200" style={{ width: '100%', minWidth: 'max-content', tableLayout: 'auto', display: 'table' }}>
                {/* Enhanced Table header - show Project Header only when no project is expanded */}
                {expandedProjectId === null && (
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      <thead className="sticky top-0 bg-gray-50 z-10 border-b-2 border-gray-300">
                        <tr>
                          {/* Drag Handle Column Header */}
                          <th className="px-2 py-3 text-center w-16 border border-gray-200 bg-gray-50 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            <div className="flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">↕</span>
                            </div>
                          </th>
                          {/* Select Column Header - Select All Checkbox */}
                          <th className="px-3 py-3 text-center w-12 border border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={filteredTasks.length > 0 && filteredTasks.every(task => selectedTaskIds.has(task.id))}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                title="Select all projects"
                              />
                            </div>
                          </th>
                          {/* Pin Column Header */}
                          <th className="px-3 py-3 text-center w-12 border border-gray-200 bg-gray-50 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            <div className="flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pin</span>
                            </div>
                          </th>
                          {columnOrder
                            .filter(key => key !== 'category' && visibleColumns.includes(key)) // Remove TASK CATEGORY header for main tasks and filter by visible columns
                            .map(key => {
                              const col = columns.find(c => c.key === key);
                              if (!col) return null;
                              return <DraggableHeader key={col.key} col={col} colKey={col.key} onRemoveColumn={handleToggleColumn} />;
                            })}
                          <th key="column-settings" className="px-3 py-3 text-center border border-gray-200 bg-gray-50 min-w-[3.5rem] w-14">
                            <ColumnSettingsDropdown
                              columns={columns}
                              visibleColumns={visibleColumns}
                              onToggleColumn={handleToggleColumn}
                              onResetColumns={handleResetColumns}
                            />
                          </th>
                        </tr>
                      </thead>
                    </SortableContext>
                  </DndContext>
                )}
                <tbody className="bg-white" style={{ overflow: 'visible' }}>
                  {/* No Results Message */}
                  {filteredTasks.length === 0 && !newTask && (
                    <tr>
                                              <td colSpan={columnOrder.length + 4} className="px-6 py-12 text-center border border-gray-200">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-600">
                              Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                          </div>
                          <button
                            onClick={clearAllFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {newTask && (
                    <tr className="bg-blue-50/50 hover:bg-blue-50 transition-all duration-200" style={{ overflow: 'visible' }}>
                      {/* Drag Handle Column for New Task */}
                      <td className="px-2 py-3 align-middle text-center w-16 border border-gray-200">
                        <div className="w-6 h-6 text-gray-300 flex items-center justify-center">
                          <Bars3Icon className="w-4 h-4" />
                        </div>
                      </td>
                      {/* Multi-select Checkbox Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center border border-gray-200">
                        <MultiSelectCheckbox
                          task={newTask}
                          isChecked={false}
                          onToggle={() => {}} // No-op for new task
                        />
                      </td>
                      {/* Pin Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center border border-gray-200">
                        <button
                          onClick={() => setNewTask({ ...newTask, pinned: !newTask.pinned })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                            newTask.pinned 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                          title={newTask.pinned ? "Unpin task" : "Pin task"}
                        >
                          📌
                        </button>
                      </td>
                      {columnOrder
                        .filter(colKey => visibleColumns.includes(colKey))
                        .map((colKey, idx) => {
                        const col = columns.find(c => c.key === colKey);
                        if (!col) return null;
                        return (
                          <td key={col.key} className={`px-3 py-3 align-middle border border-gray-200 ${
                            col.key === 'referenceNumber' ? 'w-32 min-w-32' : ''
                          } ${
                            col.key === 'remarks' || col.key === 'assigneeNotes' ? 'w-48 min-w-48' : ''
                          } ${
                            col.key === 'plotNumber' || col.key === 'community' || col.key === 'projectType' ? 'w-40 min-w-40' : ''
                          } ${
                            col.key === 'projectFloor' || col.key === 'developerProject' ? 'w-40 min-w-40' : ''
                          } ${
                            col.key === 'owner' ? 'w-36 min-w-36' : ''
                          }`}>
                            {col.key === "task" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.name}
                                onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                                autoFocus
                              />
                            ) : col.key === "referenceNumber" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.referenceNumber || ""}
                                onChange={e => setNewTask({ ...newTask, referenceNumber: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter reference number (required)"
                                required
                              />
                            ) : col.key === "client" ? (
                              <span className="px-3 py-2 text-sm w-full block text-gray-700">
                                {newTask.client || "—"}
                              </span>
                            ) : col.key === "category" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.category || getTaskCategories()[0]}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                {getTaskCategories().map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : col.key === "status" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.status}
                                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="Pending">pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            ) : col.key === "owner" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.owner}
                                onChange={e => setNewTask({ ...newTask, owner: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="MN">MN</option>
                                <option value="SA">SA</option>
                                <option value="AH">AH</option>
                                <option value="MA">MA</option>
                              </select>
                            ) : col.key === "timeline" ? (
                              <TimelineCell
                                value={newTask.timeline}
                                onChange={(timeline) => setNewTask({ ...newTask, timeline })}
                              />
                            ) : col.key === "planDays" ? (
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.planDays || ""}
                                onChange={e => setNewTask({ ...newTask, planDays: parseInt(e.target.value) || 0 })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "remarks" ? (
                              <textarea
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full resize-none"
                                value={newTask.remarks}
                                onChange={e => setNewTask({ ...newTask, remarks: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                                rows={2}
                                placeholder="Enter remarks"
                              />
                            ) : col.key === "assigneeNotes" ? (
                              <textarea
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full resize-none"
                                value={newTask.assigneeNotes}
                                onChange={e => setNewTask({ ...newTask, assigneeNotes: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                                rows={2}
                                placeholder="Enter assignee notes"
                              />
                            ) : col.key === "attachments" ? (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // For new tasks, we'll open the modal with empty attachments
                                    setAttachmentsModalTarget({ type: 'new', taskId: null, subId: null });
                                    setAttachmentsModalItems([]);
                                    setAttachmentsModalOpen(true);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm w-full"
                                >
                                  <PaperClipIcon className="w-4 h-4" />
                                  {newTask.attachments && newTask.attachments.length > 0 
                                    ? `${newTask.attachments.length} file(s)` 
                                    : 'Add files'
                                  }
                                </button>
                                {newTask.attachments && newTask.attachments.length > 0 && (
                                  <ul className="mt-2 text-xs text-gray-600">
                                    {newTask.attachments.slice(0, 2).map((file, idx) => (
                                      <li key={idx} className="truncate">
                                        {file.fileName || file.name || (typeof file === 'string' ? file : '')}
                                      </li>
                                      ))}
                                    {newTask.attachments.length > 2 && (
                                      <li className="text-gray-500">+{newTask.attachments.length - 2} more</li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            ) : col.key === "priority" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            ) : col.key === "location" ? (
                              <div className="flex items-center gap-2">
                                <input
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 flex-1"
                                  value={newTask.location}
                                  onChange={e => setNewTask({ ...newTask, location: e.target.value })}
                                  onKeyDown={handleNewTaskKeyDown}
                                  placeholder="Enter location or pick on map"
                                />
                                <button type="button" onClick={() => handleOpenMapPicker('main', newTask.id, null, newTask.location)} title="Pick on map" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                                  <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                </button>
                              </div>
                            ) : col.key === "plotNumber" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-gray-50 cursor-not-allowed"
                                value={newTask.plotNumber || ""}
                                readOnly
                                placeholder="—"
                              />
                            ) : col.key === "community" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.community || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, community: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter community"
                              />
                            ) : col.key === "projectType" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.projectType || "Residential"}
                                onChange={e => setNewTask(nt => ({ ...nt, projectType: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Mixed Use">Mixed Use</option>
                                <option value="Infrastructure">Infrastructure</option>
                              </select>
                            ) : col.key === "projectFloor" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.projectFloor || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, projectFloor: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter project floor"
                              />
                            ) : col.key === "developerProject" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.developerProject || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, developerProject: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter developer project"
                              />
                            ) : col.key === "notes" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.notes}
                                onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "autoNumber" ? (
                              <span className="text-gray-600 font-medium">{getHierarchicalAutoNumber(filteredTasks.length, null, null)}</span>
                            ) : col.key === "predecessors" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-24"
                                    value={newTask.predecessors || ""}
                                    onChange={e => setNewTask(nt => ({ ...nt, predecessors: e.target.value }))}
                                    onKeyDown={handleNewTaskKeyDown}
                                    placeholder="Task IDs"
                                  />
                            ) : col.key === "checklist" ? (
                              <input
                                type="checkbox"
                                checked={!!newTask.checklist}
                                onChange={e => setNewTask(nt => ({ ...nt, checklist: e.target.checked }))}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            ) : col.key === "link" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.link || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, link: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter link"
                              />
                            ) : col.key === "rating" ? (
                              <span className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <StarIcon
                                    key={i}
                                    className={`w-5 h-5 cursor-pointer transition ${i <= (newTask.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    onClick={() => setNewTask(nt => ({ ...nt, rating: i }))}
                                    fill={i <= (newTask.rating || 0) ? '#facc15' : 'none'}
                                  />
                                ))}
                              </span>
                            ) : null}
                            {idx === columnOrder.filter(colKey => visibleColumns.includes(colKey)).length - 1 && (
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg font-medium"
                                  onClick={handleCreateTask}
                                  title="Save new project"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="px-4 py-2 bg-red-600 text-gray-700 text-sm rounded-lg hover:bg-gray-100"
                                  onClick={() => setNewTask(null)}
                                  title="Cancel new project"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        );
                                                                      })}
                    </tr>
                  )}
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                    <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                      {filteredTasks.map((task, taskIdx) => (
                        <React.Fragment key={task.id}>
                          {/* Main Task Row */}
                          <SortableProjectRow
                            key={task.id}
                            task={task}
                            projectIndex={taskIdx}
                            columnOrder={getMainTaskColumnOrder(columnOrder.filter(colKey => visibleColumns.includes(colKey)))}
                            columns={columns}
                            expandedActive={expandedActive}
                            editingTaskId={editingTaskId}
                            editingTaskName={editingTaskName}
                            onToggleExpand={toggleExpand}
                            onProjectNameClick={handleProjectNameClick}
                            onProjectNameDoubleClick={handleProjectNameDoubleClick}
                            onOpenTaskDrawer={handleOpenTaskDrawer}
                            onProjectNameChange={handleProjectNameChange}
                            onProjectNameBlur={handleProjectNameBlur}
                            onProjectNameKeyDown={handleProjectNameKeyDown}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRow}
                            onShowAddColumnMenu={handleShowAddColumnMenu}
                            onTogglePin={handleTogglePin}
                            onAddSubtask={handleAddSubtask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            onCopyTask={handleCopyTask}
                            onPasteTask={handlePasteTask}
                            copiedTask={copiedTask}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelection={handleTaskSelection}
                            showSubtaskForm={showSubtaskForm}
                            setShowSubtaskForm={setShowSubtaskForm}
                            newSubtask={newSubtask}
                            setNewSubtask={setNewSubtask}
                            handleSubtaskKeyDown={handleSubtaskKeyDown}
                            onOpenAttachmentsModal={(type) => {
                              if (type === 'subtask') {
                                setAttachmentsModalTarget({ type: 'newSubtask', taskId: null, subId: null });
                                setAttachmentsModalItems(newSubtask.attachments || []);
                              } else {
                                setAttachmentsModalTarget({ type: 'new', taskId: null, subId: null });
                                setAttachmentsModalItems([]);
                              }
                              setAttachmentsModalOpen(true);
                            }}
                            onOpenChat={handleOpenChat}
                            onTenderClick={handleTenderClick}
                            visibleColumns={visibleColumns}
                            onToggleColumn={handleToggleColumn}
                            onResetColumns={handleResetColumns}
                            onOpenQuestionnaireModal={(target) => {
                              setQuestionnaireModalTarget(target);
                              setQuestionnaireModalOpen(true);
                            }}
                            onOpenQuestionnaireResponseModal={(target) => {
                              setQuestionnaireModalTarget(target);
                              setQuestionnaireResponseModalOpen(true);
                            }}
                          />
                      {/* Subtasks as separate table with aligned headers */}
                      {expandedActive[task.id] && (
                        <tr>
                                                     <td colSpan={columnOrder.length + 5} className="p-0 bg-gray-50/30 border-l border-r border-b border-gray-200">
                            <div className="max-h-[400px] overflow-y-auto">
                              <table className="w-full table-auto border-collapse border border-gray-200 bg-white">
                              <thead className="sticky top-0 bg-gray-50 z-10 border-b-2 border-gray-300">
                                <tr>
                                  {/* Drag Handle Header Column for Subtasks */}
                                  <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase text-center w-16 border border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-center">
                                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">↕</span>
                                    </div>
                                  </th>
                                  {/* Checkbox Header Column */}
                                  <th className="px-3 py-2 text-xs font-bold text-gray-600 uppercase text-center w-12 border border-gray-200 bg-gray-50">
                                    {/* Empty header for checkbox alignment */}
                                  </th>
                                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={getSubtaskColumnOrder(columnOrder)} strategy={horizontalListSortingStrategy}>
                                      {getSubtaskColumnOrder(columnOrder)
                                        .filter(colKey => visibleColumns.includes(colKey))
                                        .map(colKey => {
                                        const col = columns.find(c => c.key === colKey);
                                        if (!col) return null;
                                        return (
                                          <DraggableHeader
                                            key={col.key}
                                            col={col}
                                            colKey={col.key}
                                            isSubtaskTable={true}
                                            onRemoveColumn={handleToggleColumn}
                                          />
                                        );
                                      })}
                                    </SortableContext>
                                  </DndContext>
                                  <th className="px-2 py-2 text-xs font-bold text-gray-600 uppercase text-center w-20 min-w-[5rem] border border-gray-200 bg-gray-50">
                                    Delete
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white">
                                <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                                  {(() => {
                                    const activeSubtasks = filterActiveItems(task.subtasks);
                                    // Determine next executable subtask based on visual order and completion
                                    let nextExecutableId = null;
                                    for (let i = 0; i < activeSubtasks.length; i++) {
                                      const s = activeSubtasks[i];
                                      const statusLower = (s.status || '').toString().toLowerCase();
                                      const allPrevDone = activeSubtasks
                                        .slice(0, i)
                                        .every(prev => {
                                          const sl = (prev.status || '').toString().toLowerCase();
                                          return sl === 'done' || sl === 'completed';
                                        });
                                      if (allPrevDone && statusLower !== 'done' && statusLower !== 'completed') {
                                        nextExecutableId = s.id;
                                        break;
                                      }
                                    }

                                    return (
                                      <SortableContext items={activeSubtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                        {activeSubtasks.map((sub, subIdx) => (
                                          <React.Fragment key={sub.id}>
                                            <SortableSubtaskRow sub={sub} subIdx={subIdx} task={task} isNextExecutable={sub.id === nextExecutableId}>
                                              {/* Checkbox Column for Subtask */}
                                              <td className="px-3 py-2 align-middle text-center w-12 border border-gray-200">
                                                <div className="flex items-center justify-center">
                                                  <input
                                                    type="checkbox"
                                                    checked={selectedSubtaskIds.has(sub.id)}
                                                    onChange={(e) => handleSubtaskSelection(sub.id, e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                    title={`Select ${sub.name || 'task'}`}
                                                  />
                                                </div>
                                              </td>
                                              {getSubtaskColumnOrder(columnOrder)
                                                .filter(colKey => visibleColumns.includes(colKey))
                                                .map(colKey => {
                                                  const col = columns.find(c => c.key === colKey);
                                                  if (!col) return null;
                                                  return (
                                                    <td
                                                      key={col.key}
                                                      className={`px-3 py-2 align-middle border border-gray-200${col.key === 'delete' ? ' text-center w-12' : ''} ${
                                                        col.key === 'referenceNumber' ? 'w-32 min-w-32' : ''
                                                      } ${
                                                        col.key === 'remarks' || col.key === 'assigneeNotes' ? 'w-48 min-w-48' : ''
                                                      } ${
                                                        col.key === 'plotNumber' || col.key === 'community' || col.key === 'projectType' ? 'w-40 min-w-40' : ''
                                                      } ${
                                                        col.key === 'projectFloor' || col.key === 'developerProject' ? 'w-40 min-w-40' : ''
                                                      }`}
                                                    >
                                                      {col.key === 'autoNumber'
                                                        ? (
                                                          <span className="text-sm text-gray-600 font-medium">
                                                            {getHierarchicalAutoNumber(taskIdx, subIdx, null)}
                                                          </span>
                                                        )
                                                        : (() => {
                                                            const isPrivileged = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'MANAGER'].includes(user?.role);
                                                            const isCreator = getCreatorId(sub.createdBy) === String(user?.id ?? '');
                                                            const assigneeId = sub.assignedEmployeeId ?? sub.assignedEmployee ?? (sub.assignedEmployeeData?.id);
                                                            const isAssignee = !!assigneeId && assigneeId === user?.id;
                                                            const canEditMainFields = isPrivileged || isCreator;
                                                            const canEditAssigneeFields = isPrivileged || isCreator || isAssignee;
                                                            return CellRenderer.renderSubtaskCell(
                                                              col,
                                                              sub,
                                                              task,
                                                              subIdx,
                                                              handleEditSubtask,
                                                              isAdmin,
                                                              (e) => handleSubtaskKeyDown(e, task.id),
                                                              handleEditTask,
                                                              handleDeleteTask,
                                                              handleOpenChat,
                                                              setAttachmentsModalTarget,
                                                              handleOpenMapPicker,
                                                              setAttachmentsModalItems,
                                                              setAttachmentsModalOpen,
                                                              (target) => { setQuestionnaireModalTarget(target); setQuestionnaireModalOpen(true); },
                                                              (target) => { setQuestionnaireModalTarget(target); setQuestionnaireResponseModalOpen(true); },
                                                              isManager,
                                                              employees,
                                                              getTaskCategories(),
                                                              user,
                                                              isEmployee,
                                                              canEditMainFields,
                                                              canEditAssigneeFields
                                                            );
                                                          })()}
                                                    </td>
                                                  );
                                                })}
                                              <td className="px-2 py-2 text-center border border-gray-200 w-32 min-w-[7rem] align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleSaveSubtaskRow(sub.id, task.id)}
                                                    className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 hover:text-green-800 transition-colors"
                                                    title="Save subtask changes"
                                                  >
                                                    Save
                                                  </button>
                                                  {(
                                                    // Managers/admins: always can delete
                                                    !isEmployee ||
                                                    // Employees: can delete if they are the creator
                                                    sub.createdBy === user?.id ||
                                                    // Backward-compatibility: for older records where createdBy is null,
                                                    // allow delete only if the task is assigned to the current employee
                                                    (!sub.createdBy && sub.assignedEmployeeId === user?.id)
                                                  ) && (
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDeleteRow(sub.id, task.id)}
                                                      className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                                                      title="Delete subtask"
                                                    >
                                                      <span aria-hidden>×</span> Delete
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                            </SortableSubtaskRow>
                                                                         {/* Child Subtasks */}
                                            {sub.childSubtasks && filterActiveItems(sub.childSubtasks).map((childSub, childIdx) => (
                                       <tr key={childSub.id} className="childtask-row bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                                         {/* Drag Handle Column for Child Subtask */}
                                         <td className="px-2 py-2 align-middle text-center w-16 border border-gray-200">
                                           <div className="w-6 h-6 text-blue-400 flex items-center justify-center">
                                             <Bars3Icon className="w-4 h-4" />
                                           </div>
                                         </td>
                                         {/* Checkbox Column for Child Subtask */}
                                         <td className="px-3 py-2 align-middle text-center w-12 border border-gray-200">
                                          <div className="flex items-center justify-center">
                                            <input
                                              type="checkbox"
                                              checked={selectedSubtaskIds.has(childSub.id)}
                                              onChange={(e) => handleSubtaskSelection(childSub.id, e.target.checked)}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                              title={`Select ${childSub.name || 'child task'}`}
                                            />
                                          </div>
                                        </td>
                                        {getSubtaskColumnOrder(columnOrder)
                                          .filter(colKey => visibleColumns.includes(colKey))
                                          .map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <td key={col.key} className={`px-3 py-2 align-middle text-sm border border-gray-200${col.key === 'delete' ? ' text-center w-12' : ''} ${
                                              col.key === 'referenceNumber' ? 'w-32 min-w-32' : ''
                                            } ${
                                              col.key === 'remarks' || col.key === 'assigneeNotes' ? 'w-48 min-w-48' : ''
                                            } ${
                                              col.key === 'plotNumber' || col.key === 'community' || col.key === 'projectType' ? 'w-40 min-w-40' : ''
                                            } ${
                                              col.key === 'projectFloor' || col.key === 'developerProject' ? 'w-40 min-w-40' : ''
                                            }`}>
                                              {renderChildSubtaskCell(col, childSub, task, sub.id, childIdx, taskIdx, subIdx)}
                                            </td>
                                          );
                                        })}
                                        <td className="px-2 py-2 text-center border border-gray-200 w-20 min-w-[5rem] align-middle">
                                          {/* All roles (including employees) can delete child tasks */}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteChildSubtask(task.id, sub.id, childSub.id)}
                                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 transition-colors"
                                            title="Delete child task"
                                          >
                                            <span aria-hidden>×</span> Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    
                                                                         {/* Add Child Subtask Button */}
                                     <tr>
                                       <td colSpan={columnOrder.length + 3} className="px-4 py-1">
                                        {showChildSubtaskForm === sub.id ? (
                                          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <form
                                              className="flex flex-wrap gap-2 items-center"
                                              onSubmit={e => {
                                                e.preventDefault();
                                                handleAddChildSubtask(task.id, sub.id);
                                              }}
                                            >
                                              {getSubtaskColumnOrder(columnOrder)
                                                .filter(colKey => visibleColumns.includes(colKey))
                                                .filter(colKey => ['task', 'category', 'status', 'assignedEmployee', 'priority'].includes(colKey))
                                                .map(colKey => {
                                                const col = columns.find(c => c.key === colKey);
                                                if (!col) return null;
                                                return (
                                                  <div key={col.key} className="flex-1 min-w-0">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">{col.key === 'task' ? 'TASK NAME' : col.label}:</label>
                                                    {col.key === "task" || col.key === "project name" ? (
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-gray-400 text-xs">└─</span>
                                                        <input
                                                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 flex-1"
                                                          value={newChildSubtask.name}
                                                          onChange={e => setNewChildSubtask({ ...newChildSubtask, name: e.target.value })}
                                                          onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                          placeholder="Task Name"
                                                          autoFocus
                                                        />
                                                      </div>
                                                    ) : col.key === "category" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.category || getTaskCategories()[0]}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, category: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        {getTaskCategories().map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                                      </select>
                                                    ) : col.key === "status" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.status}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, status: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="pending">pending</option>
                                                        <option value="working">working</option>
                                                        <option value="done">done</option>
                                                        <option value="stuck">stuck</option>
                                                      </select>
                                                    ) : col.key === "assignedEmployee" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.assignedEmployee || ""}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, assignedEmployee: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="">Select Employee</option>
                                                        {Array.isArray(employees) && employees.length > 0 ? (
                                                          employees.map(emp => {
                                                            const empName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.email || 'Unknown';
                                                            const empId = emp.id || emp.email || empName;
                                                            return (
                                                              <option key={empId} value={empId}>
                                                                {empName}
                                                              </option>
                                                            );
                                                          })
                                                        ) : (
                                                          <option value="" disabled>Loading employees...</option>
                                                        )}
                                                      </select>
                                                    ) : col.key === "priority" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.priority}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, priority: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                      </select>
                                                    ) : null}
                                                  </div>
                                                );
                                              })}
                                              <div className="flex items-center gap-1 mt-2">
                                                <button
                                                  type="submit"
                                                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs rounded hover:shadow-md transition-all duration-200 font-medium"
                                                >
                                                  Add Child
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setShowChildSubtaskForm(null)}
                                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-all duration-200 font-medium"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </form>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setShowChildSubtaskForm(sub.id)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-semibold transition-all duration-200 flex items-center gap-1"
                                          >
                                            <PlusIcon className="w-3 h-3" />
                                            Add Child Task
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                          </React.Fragment>
                                        ))}
                                      </SortableContext>
                                    );
                                  })()}
                                </DndContext>
                              </tbody>
                            </table>
                            </div>
                          </td>
                        </tr>


                      )}
                      {/* Project End Border */}
                      <tr>
                        <td colSpan={columnOrder.length + 5} className="h-1 bg-gray-300"></td>
                      </tr>
                    </React.Fragment>
                  ))}
                    </SortableContext>
                  </DndContext>
                              </tbody>
                            </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {mapPickerOpen && (
        <MapPicker
          lat={mapPickerCoords.lat}
          lng={mapPickerCoords.lng}
          onPick={handlePickLocation}
          onClose={() => setMapPickerOpen(false)}
        />
      )}
      {googleMapPickerOpen && (
        <GoogleMapPickerDemo
          onPick={handlePickLocation}
          onClose={() => setGoogleMapPickerOpen(false)}
        />
      )}

      {/* Modals */}
      <Modals.RatingPrompt 
        showRatingPrompt={showRatingPrompt} 
        setShowRatingPrompt={setShowRatingPrompt} 
      />
      
      <Modals.ProjectDialog 
        showProjectDialog={showProjectDialog} 
        selectedProject={selectedProject} 
        setShowProjectDialog={setShowProjectDialog} 
      />
      
      <Modals.ProjectSummary 
        selectedProjectForSummary={selectedProjectForSummary} 
        closeProjectSummary={closeProjectSummary} 
      />
      
      <Modals.NewTaskModal 
        showNewTask={showNewTask} 
        setShowNewTask={setShowNewTask} 
        handleCreateTask={handleCreateTask} 
      />

      {/* Checklist Modal (Legacy) */}
      <ChecklistModal
        open={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        items={checklistModalItems}
        setItems={setChecklistModalItems}
        onSave={handleChecklistSave}
      />
      
      {/* Questionnaire Modal (For Managers - Create/Edit Questions) */}
      <QuestionnaireModal
        open={questionnaireModalOpen}
        onClose={() => setQuestionnaireModalOpen(false)}
        projectId={questionnaireModalTarget?.projectId}
        taskId={questionnaireModalTarget?.taskId}
        subtaskId={questionnaireModalTarget?.subtaskId}
        onUpdate={() => {
          // Refresh questions/status after update
          if (questionnaireModalTarget?.taskId) {
            // Could trigger a refresh here if needed
          }
        }}
      />
      
      {/* Questionnaire Response Modal (For Employees - Answer Questions) */}
      <QuestionnaireResponseModal
        open={questionnaireResponseModalOpen}
        onClose={() => setQuestionnaireResponseModalOpen(false)}
        projectId={questionnaireModalTarget?.projectId}
        taskId={questionnaireModalTarget?.taskId}
        subtaskId={questionnaireModalTarget?.subtaskId}
        onUpdate={() => {
          // Refresh status after response
        }}
      />
      
      {/* Attachments Modal */}
      <AttachmentsModal
        open={attachmentsModalOpen}
        onClose={() => setAttachmentsModalOpen(false)}
        attachments={attachmentsModalItems}
        onSave={handleAttachmentsSave}
        defaultModule="PRJ"
        projectReferenceNumber={attachmentsModalTarget ? 
          (() => {
            if (attachmentsModalTarget.type === 'main') {
              const task = tasks.find(t => t.id === attachmentsModalTarget.taskId);
              return task?.referenceNumber || '';
            } else if (attachmentsModalTarget.type === 'sub') {
              const task = tasks.find(t => t.id === attachmentsModalTarget.taskId);
              return task?.referenceNumber || '';
            }
            return '';
          })() : ''
        }
      />

      {/* Toast Component */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Bulk Action Components */}
      <BulkActionBar
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        selectedSubtasks={getAllSelectedSubtasks()}
        totalSelected={selectedTaskIds.size + selectedSubtaskIds.size}
        selectionAnalysis={{
          canEdit: (selectedTaskIds.size > 0) || (selectedSubtaskIds.size > 0),
          reason: (selectedTaskIds.size === 0 && selectedSubtaskIds.size === 0) ? 'No items selected' : 
                 (selectedTaskIds.size > 0 && selectedSubtaskIds.size > 0) ? 'Mixed selection (projects and subtasks)' :
                 selectedTaskIds.size > 0 ? 'Projects selected' : 'Subtasks selected'
        }}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onView={handleBulkView}
        onClearSelection={handleClearSelection}
        onShowToast={showToast}
        allTasks={tasks}
        filteredTasks={filteredTasks}
        onTasksPasted={handleTasksPasted}
        onCopy={handleBulkCopy}
        onPaste={() => setShowBulkPasteModal(true)}
        bulkCopiedItems={bulkCopiedItems}
        showBulkPasteModal={showBulkPasteModal}
        onUndo={() => undoManager.undoDeletion(handleUndoRestore)}
        hasDeletedItems={undoManager.undoState.deletedItems.length > 0}
      />

      <BulkEditDrawer
        isOpen={showBulkEditDrawer}
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        onClose={() => setShowBulkEditDrawer(false)}
        onSave={handleBulkSave}
      />

      <BulkViewDrawer
        isOpen={showBulkViewDrawer}
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        onClose={() => setShowBulkViewDrawer(false)}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        open={!!drawerTask}
        task={drawerTask}
        onClose={() => setDrawerTask(null)}
        onTaskUpdate={(updatedTask) => {
          setTasks(prevTasks =>
            prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
          );
          setDrawerTask(updatedTask);
        }}
        onProjectNameSaved={loadProjectsFromAPI}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        project={chatProject}
        onClose={handleCloseChat}
        socket={socket}
        chatType={chatType}
      />

      


      {/* Bulk Paste Modal */}
      <BulkPasteModal
        isOpen={showBulkPasteModal}
        onClose={closeBulkPasteModal}
        bulkCopiedItems={bulkCopiedItems}
        tasks={tasks}
        onExecutePaste={executeBulkPaste}
        onSetPasteTarget={setPasteTarget}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportData={exportData}
        totalCount={exportData.length}
      />

      {/* Engineer Invite Modal */}
      <EngineerInviteModal
        isOpen={engineerInviteModalOpen}
        onClose={() => setEngineerInviteModalOpen(false)}
        taskId={engineerInviteTarget?.taskId}
        taskName={engineerInviteTarget?.taskName}
        currentAssignee={engineerInviteTarget?.currentAssignee}
        onInviteEngineer={handleInviteEngineer}
      />

      {/* Undo Toast */}
      <UndoToast
        isVisible={undoManager.undoState.isVisible}
        onUndo={() => undoManager.undoDeletion(handleUndoRestore)}
        onDismiss={undoManager.dismissUndoToast}
        message={undoManager.undoState.message}
        itemType={undoManager.undoState.itemType}
        count={undoManager.undoState.deletedItems.length}
      />

      {/* Tender Confirmation Modal */}
      {showTenderConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Send Tender</h2>
              </div>
              
              {/* Project Info */}
              {tenderProject && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Project:</span> {tenderProject.name}
                  </p>
                  {tenderProject.referenceNumber && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-semibold">Reference:</span> {tenderProject.referenceNumber}
                    </p>
                  )}
                </div>
              )}
              
              {/* Engineer Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Select Engineers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select whitelisted engineers to send the tender. Blacklisted engineers cannot be selected.
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableEngineers.map((engineer) => {
                    const isWhitelisted = engineer.engineerListing === "Whitelisted";
                    const isSelected = selectedEngineerIds.has(engineer.id);
                    
                    return (
                      <div
                        key={engineer.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                          !isWhitelisted
                            ? "bg-slate-100/50 opacity-60 cursor-not-allowed border-gray-200"
                            : isSelected
                            ? "bg-indigo-50 border-indigo-300"
                            : "bg-white border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEngineerSelection(engineer.id)}
                          disabled={!isWhitelisted}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                          title={
                            !isWhitelisted
                              ? "Only whitelisted engineers can be selected"
                              : `Select ${engineer.name}`
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{engineer.name}</span>
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                engineer.engineerListing === "Whitelisted"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {engineer.engineerListing === "Whitelisted" ? "✓ Whitelisted" : "✗ Blacklisted"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                            <span>
                              <span className="font-semibold">Specialty:</span> {engineer.specialty}
                            </span>
                            <span>
                              <span className="font-semibold">Rating:</span> {engineer.rating}
                            </span>
                            <span>
                              <span className="font-semibold">Email:</span> {engineer.email}
                            </span>
                            <span>
                              <span className="font-semibold">Phone:</span> {engineer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">
                    {selectedEngineerIds.size} engineer{selectedEngineerIds.size !== 1 ? "s" : ""} selected
                  </span>
                  <span className="ml-2 text-gray-500">
                    ({availableEngineers.filter(e => e.engineerListing === "Whitelisted").length} whitelisted available)
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleTenderCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTenderConfirm}
                  disabled={selectedEngineerIds.size === 0}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-lg ${
                    selectedEngineerIds.size === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                  }`}
                >
                  Send Tender
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Load Out Modal */}
      <ContractLoadOutModal
        open={contractLoadOutModalOpen}
        onClose={() => setContractLoadOutModalOpen(false)}
        onSuccess={handleContractLoadOutSuccess}
      />

    </div>
  );
}

