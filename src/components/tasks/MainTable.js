import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import SubtaskCheckbox from "./MainTable/SubtaskCheckbox";
import BulkActionBar from "./MainTable/BulkActionBar";
import BulkEditDrawer from "./MainTable/BulkEditDrawer";
import BulkViewDrawer from "./MainTable/BulkViewDrawer";
import BulkPasteModal from "./MainTable/BulkPasteModal";
import ExportModal from "./MainTable/ExportModal";
import TruncatedTextCell from "./MainTable/TruncatedTextCell";
import ChecklistModal from "./modals/ChecklistModal";
import AttachmentsModal from "./modals/AttachmentsModal";
import Toast from "./MainTable/Toast";
import ColumnSettingsDropdown from "./MainTable/ColumnSettingsDropdown";
import TaskDetailsDrawer from "../TaskDetailsDrawer";
import ChatDrawer from "./ChatDrawer";
import useSocket from "../../hooks/useSocket";
import { MessageCircle } from 'lucide-react';
import EngineerInviteModal from "./MainTable/EngineerInviteModal";
import { sendTenderInvitations } from "../../services/tenderAPI";
import { createProject } from "../../services/projectsAPI";


// Import utilities
import {
  INITIAL_COLUMNS,
  calculateTaskTimelines,
  filterCompletedTasks,
  getDefaultColumnOrder,
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
  resetReferenceTracker
} from "./utils/tableUtils";

// Import shared search and filter hook
import { useSearchAndFilters } from './hooks/useSearchAndFilters';

// Import undo functionality
import UndoToast from '../common/UndoToast';
import useUndoManager from '../../hooks/useUndoManager';
import { filterActiveItems, applySoftDelete, applyRestore } from '../../utils/softDeleteUtils';

const initialTasks = [];



const isAdmin = true; // TODO: Replace with real authentication logic





export default function MainTable() {
  const navigate = useNavigate();
  
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



  // Load tasks from localStorage or use initialTasks
  const loadTasksFromStorage = () => {
    try {
      const savedTasks = localStorage.getItem('projectTasks');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        // Convert date strings back to Date objects for timeline
        return parsed.map(task => ({
          ...task,
          timeline: task.timeline ? task.timeline.map(date => new Date(date)) : null,
          subtasks: task.subtasks ? task.subtasks.map(subtask => ({
            ...subtask,
            timeline: subtask.timeline ? subtask.timeline.map(date => new Date(date)) : null
          })) : []
        }));
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
    return initialTasks;
  };

  const [tasks, setTasks] = useState(loadTasksFromStorage);
  
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
  
  // Attachments modal state
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [attachmentsModalTarget, setAttachmentsModalTarget] = useState(null); // { type: 'main'|'sub'|'child', taskId, subId }
  const [attachmentsModalItems, setAttachmentsModalItems] = useState([]);
  
  // Engineer invite modal state
  const [engineerInviteModalOpen, setEngineerInviteModalOpen] = useState(false);
  const [engineerInviteTarget, setEngineerInviteTarget] = useState(null); // { taskId, taskName, currentAssignee }
  
  

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
    const errors = validateTask(newTask);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    try {
      // IMPORTANT: Save project to database via API
      // Map frontend status to backend enum values
      const statusMap = {
        'Pending': 'OPEN',
        'pending': 'OPEN',
        'not started': 'OPEN',
        'In Progress': 'IN_PROGRESS',
        'in progress': 'IN_PROGRESS',
        'Done': 'COMPLETED',
        'done': 'COMPLETED',
        'Completed': 'COMPLETED',
        'Cancelled': 'CANCELLED',
        'cancelled': 'CANCELLED',
        'Suspended': 'ON_HOLD',
        'suspended': 'ON_HOLD',
        'On Hold': 'ON_HOLD',
        'on hold': 'ON_HOLD',
      };
      
      const backendStatus = statusMap[newTask.status] || 'OPEN'; // Default to OPEN
      
      // Map newTask to API format
      const projectData = {
        name: newTask.name || 'Untitled Project',
        referenceNumber: newTask.referenceNumber || `REF-${Date.now()}`,
        pin: newTask.pin || null,
        clientId: newTask.clientId || null,
        owner: newTask.owner || null,
        description: newTask.description || newTask.notes || null,
        status: backendStatus, // Use mapped enum value (OPEN, IN_PROGRESS, etc.)
        projectManagerId: newTask.projectManagerId || null,
        startDate: newTask.startDate || (newTask.timeline && newTask.timeline[0] ? new Date(newTask.timeline[0]) : null),
        endDate: newTask.endDate || (newTask.timeline && newTask.timeline[1] ? new Date(newTask.timeline[1]) : null),
        deadline: newTask.deadline || null,
        planDays: newTask.planDays ? parseInt(newTask.planDays, 10) : null,
        remarks: newTask.remarks || null,
        assigneeNotes: newTask.assigneeNotes || null,
      };
      
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
        
        // Set flag to refresh dashboard when user navigates to it
        // This ensures Active Projects/Tasks counts are updated
        localStorage.setItem('dashboardNeedsRefresh', 'true');
        
        // Show success message
        setToast({
          message: 'Project created successfully!',
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
      handleCreateTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setNewTask(null);
      setShowNewTask(false);
    }
  };

  const handleSubtaskKeyDown = (e, taskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddSubtask(taskId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowSubtaskForm(null);
      setNewSubtask(createNewSubtask());
    }
  };

  const handleChildSubtaskKeyDown = (e, taskId, parentSubtaskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddChildSubtask(taskId, parentSubtaskId);
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

  // handleSelectAll removed - no more select all functionality

  const handleBulkEdit = (selectedTasks, selectedSubtasks = []) => {
    console.log('Bulk edit called with:', { selectedTasks, selectedSubtasks });
    setShowBulkEditDrawer(true);
  };

  const handleBulkDelete = (selectedTasks, selectedSubtasks = []) => {
    console.log('Bulk delete called with:', { selectedTasks, selectedSubtasks });
    
    let deletedItems = [];
    let itemType = '';
    let message = '';
    
    // Soft delete selected tasks
    if (selectedTasks.length > 0) {
      setTasks(tasks => {
        const updatedTasks = applySoftDelete(tasks, selectedTasks);
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      });
      deletedItems = [...deletedItems, ...selectedTasks];
      itemType = 'project';
      message = `${selectedTasks.length} project${selectedTasks.length > 1 ? 's' : ''} deleted`;
    }
    
    // Soft delete selected subtasks
    if (selectedSubtasks.length > 0) {
      setTasks(tasks => {
        const updatedTasks = tasks.map(task => {
          if (task.subtasks) {
            const timestamp = Date.now();
            const updatedSubtasks = task.subtasks.map(subtask => {
              if (selectedSubtasks.some(selected => selected.id === subtask.id)) {
                return { ...subtask, is_deleted: true, deleted_at: timestamp };
              }
              return subtask;
            });
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      });
      // Add subtaskId to identify subtasks for undo functionality
      const subtasksWithId = selectedSubtasks.map(subtask => ({ ...subtask, subtaskId: true }));
      deletedItems = [...deletedItems, ...subtasksWithId];
      itemType = selectedTasks.length > 0 ? 'item' : 'subtask';
      if (selectedTasks.length > 0) {
        message = `${deletedItems.length} item${deletedItems.length > 1 ? 's' : ''} deleted`;
      } else {
        message = `${selectedSubtasks.length} subtask${selectedSubtasks.length > 1 ? 's' : ''} deleted`;
      }
    }
    
    // Show undo toast
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
    if (!parentTask) return;
    
    // Create subtask with auto-generated reference number based on parent
    const newSubtaskData = {
      ...createNewSubtask(parentTask.referenceNumber),
      ...newSubtask
    };
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t =>
        t.id === taskId
          ? {
            ...t,
            subtasks: [
              ...t.subtasks,
              newSubtaskData
            ]
          }
          : t
      );
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    setShowSubtaskForm(null);
    
    // Set flag to refresh dashboard when user navigates to it
    // This ensures Active Tasks count is updated if subtask affects parent status
    localStorage.setItem('dashboardNeedsRefresh', 'true');
    
    // Reset newSubtask to default values
    setNewSubtask(createNewSubtask());
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
            // Auto-update reference number when category changes
            const parentTask = tasks.find(t => t.id === taskId);
            const updatedSubtask = updateSubtaskReferenceNumber(updatedSubtasks[idx], parentTask.referenceNumber, t.subtasks);
            return updatedSubtask;
          } else {
            return { ...updatedSubtasks[idx], [col]: value };
          }
        })();
        
        // If all subtasks are done, set main task status to 'done'
        const allDone = areAllSubtasksComplete(updatedSubtasks);
        // Calculate average progress of subtasks
        const avgProgress = calculateTaskProgress(updatedSubtasks);
        return { ...t, subtasks: updatedSubtasks, status: allDone ? 'done' : t.status, progress: avgProgress };
      });
      
      // If predecessors, timeline, or planDays changed, recalculate all timelines
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
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
      }
    } else {
      // Handle main task deletion
      const taskToDelete = tasks.find(t => t.id === id);
      
      if (taskToDelete) {
        setTasks(tasks => {
          const updatedTasks = applySoftDelete(tasks, [taskToDelete]);
          return calculateTaskTimelines(updatedTasks, projectStartDate);
        });
        
        // Show undo toast for task
        undoManager.showUndoToast([taskToDelete], 'project', `Project "${taskToDelete.name}" deleted`);
      }
    }
  }

  function handleAddNewTask() {
    // Ensure reference tracker is initialized
    if (tasks.length > 0) {
      initializeReferenceTracker();
    }
    
    // Use createNewTask to auto-generate reference number
    const newTaskData = createNewTask(tasks, projectStartDate);
    setNewTask(newTaskData);
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
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
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
    const newChildSubtaskData = {
      ...createNewSubtask(),
      ...newChildSubtask,
      id: generateTaskId() // Ensure unique ID
    };
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t =>
        t.id === taskId
          ? {
            ...t,
            subtasks: t.subtasks.map(sub =>
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
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    
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
    }
  }

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

  // Custom cell renderer for child subtasks
  const renderChildSubtaskCell = (col, childSub, task, parentSubtaskId, childIdx) => {
    switch (col.key) {
      case "task":
      case "project name":
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
            <button
              onClick={() => handleOpenChat(childSub, 'child-task')}
              className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
              title="Open Chat"
            >
              💬
            </button>
          </div>
        );
      case "category":
      case "task category":
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.category || "Design"}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "category", e.target.value)}
          >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Review">Review</option>
          </select>
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.referenceNumber || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
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
        return (
          <TimelineCell 
            value={childSub.timeline} 
            onChange={val => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "timeline", val)} 
            hasPredecessors={childTimelineHasPredecessors} 
          />
        );
      case "priority":
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.priority}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-1 py-1 text-xs w-16 text-center"
            value={childSub.planDays || 0}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "planDays", Number(e.target.value))}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Days"
          />
        );
      case "remarks":
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
      case "attachments":
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
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-1 py-1 text-xs flex-1"
              value={childSub.location || ""}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "location", e.target.value)}
              placeholder="Location"
            />
            <button 
              type="button" 
              onClick={() => handleOpenMapPicker('child', task.id, childSub.id, childSub.location)} 
              title="Pick on map"
              className="text-blue-500 hover:text-blue-700"
            >
              <MapPinIcon className="w-4 h-4" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.plotNumber || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "plotNumber", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Plot #"
          />
        );
      case "community":
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
        return <span className="text-xs text-gray-600">{childSub.autoNumber || childSub.id}</span>;
      case "predecessors":
        const childPredecessorsHasValue = childSub.predecessors && childSub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-1 py-1 text-xs pr-4 w-24 ${childPredecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={childSub.predecessors || ""}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "predecessors", e.target.value)}
              onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
              placeholder="Task IDs"
            />
            {childPredecessorsHasValue && (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return childSub.checklist ? (
          <input
            type="checkbox"
            checked={true}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "checklist", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">—</span>
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
        // Always show stars, but only highlight filled ones
        const childRating = childSub.rating || 0;
        if (childSub.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 cursor-pointer transition ${i <= childRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "rating", i)}
                  fill={i <= childRating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else if (isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 cursor-pointer transition ${i <= childRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "showRatingPrompt", true)}
                  fill={i <= childRating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 transition ${i <= childRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= childRating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
      default:
        return <span className="text-xs text-gray-500">{childSub[col.key] || ""}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
      `}</style>
      {/* Main Content */}
      <main className="flex flex-col flex-1 min-h-0">
        <div className="w-full px-4 pt-0 pb-0">
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
          />
          
          {/* Search Results Counter */}
          {hasActiveFilters && hasActiveFilters() && (
            <div className="px-6 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="w-full px-4 py-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto">
              <table className="w-full table-auto bg-white min-w-full">
                {/* Enhanced Table header - show Project Header only when no project is expanded */}
                {expandedProjectId === null && (
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
                        <tr>
                          {/* Drag Handle Column Header */}
                          <th className="px-2 py-4 text-center w-16">
                            <div className="flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">↕</span>
                            </div>
                          </th>
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
                            .filter(key => key !== 'category' && visibleColumns.includes(key)) // Remove TASK CATEGORY header for main tasks and filter by visible columns
                            .map(key => {
                              const col = columns.find(c => c.key === key);
                              if (!col) return null;
                              return <DraggableHeader key={col.key} col={col} colKey={col.key} onRemoveColumn={handleToggleColumn} />;
                            })}
                          <th key="column-settings" className="px-3 py-4 text-center">
                            <ColumnSettingsDropdown
                              columns={columns}
                              visibleColumns={visibleColumns}
                              onToggleColumn={handleToggleColumn}
                              onResetColumns={handleResetColumns}
                            />
                          </th>
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
                )}
                <tbody className="divide-y divide-gray-100" style={{ overflow: 'visible' }}>
                  {/* No Results Message */}
                  {filteredTasks.length === 0 && !newTask && (
                    <tr>
                                              <td colSpan={columnOrder.length + 5} className="px-6 py-12 text-center">
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
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200" style={{ overflow: 'visible' }}>
                      {/* Drag Handle Column for New Task */}
                      <td className="px-2 py-3 align-middle text-center w-16">
                        <div className="w-6 h-6 text-gray-300 flex items-center justify-center">
                          <Bars3Icon className="w-4 h-4" />
                        </div>
                      </td>
                      {/* Multi-select Checkbox Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center">
                        <MultiSelectCheckbox
                          task={newTask}
                          isChecked={false}
                          onToggle={() => {}} // No-op for new task
                        />
                      </td>
                      {/* Pin Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center">
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
                          <td key={col.key} className={`px-4 py-3 align-middle ${
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
                              />
                            ) : col.key === "client" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.client || ""}
                                onChange={e => setNewTask({ ...newTask, client: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter client name"
                              />
                            ) : col.key === "category" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Review">Review</option>
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
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.plotNumber || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, plotNumber: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter plot number"
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
                              <span className="text-gray-600 font-medium">{newTask.autoNumber}</span>
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
                          </td>
                        );
                                                                      })}
                      <td key="add-column" className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
                            onClick={handleCreateTask}
                            title="Save new project"
                          >
                            Save
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-all duration-200"
                            onClick={() => setNewTask(null)}
                            title="Cancel new project"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                    <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                      {filteredTasks.map(task => (
                        <React.Fragment key={task.id}>
                          {/* Main Task Row */}
                          <SortableProjectRow
                            key={task.id}
                            task={task}
                            columnOrder={columnOrder.filter(colKey => visibleColumns.includes(colKey))}
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
                          />
                      {/* Subtasks as separate table with aligned headers */}
                      {expandedActive[task.id] && (
                        <tr>
                                                     <td colSpan={columnOrder.length + 5} className="p-0 bg-gradient-to-r from-gray-50 to-blue-50">
                            <div className="max-h-[400px] overflow-y-auto">
                              <table className="w-full table-auto">
                              <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b border-gray-300">
                                <tr>
                                  {/* Drag Handle Header Column for Subtasks */}
                                  <th className="px-2 py-3 text-xs font-bold text-gray-400 uppercase text-center w-16">
                                    <div className="flex items-center justify-center">
                                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">↕</span>
                                    </div>
                                  </th>
                                  {/* Checkbox Header Column */}
                                  <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-center w-12">
                                    {/* Empty header for checkbox alignment */}
                                  </th>
                                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                                      {columnOrder
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
                                  <th key="add-column" className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-center w-12">
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
                              <tbody>
                                <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                                  <SortableContext items={filterActiveItems(task.subtasks).map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                    {filterActiveItems(task.subtasks).map((sub, subIdx) => (
                                      <React.Fragment key={sub.id}>
                                        <SortableSubtaskRow sub={sub} subIdx={subIdx} task={task}>
                                          {/* Checkbox Column for Subtask */}
                                          <td className="px-4 py-3 align-middle text-center w-12">
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
                                          {columnOrder
                                            .filter(colKey => visibleColumns.includes(colKey))
                                            .map(colKey => {
                                            const col = columns.find(c => c.key === colKey);
                                            if (!col) return null;
                                            return (
                                              <td key={col.key} className={`px-4 py-3 align-middle${col.key === 'delete' ? ' text-center w-12' : ''} ${
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
                                                {CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, isAdmin, (e) => handleSubtaskKeyDown(e, task.id), handleEditTask, handleDeleteTask, handleOpenChat, setAttachmentsModalTarget, handleOpenMapPicker, setAttachmentsModalItems, setAttachmentsModalOpen)}
                                              </td>
                                            );
                                          })}
                                          <td className="w-12 text-center">
                                            <button
                                              onClick={() => handleDeleteRow(sub.id, task.id)}
                                              className="text-red-500 hover:text-red-700"
                                              title="Delete subtask"
                                            >
                                              ×
                                            </button>
                                          </td>
                                        </SortableSubtaskRow>
                                    
                                                                         {/* Child Subtasks */}
                                     {sub.childSubtasks && filterActiveItems(sub.childSubtasks).map((childSub, childIdx) => (
                                       <tr key={childSub.id} className="childtask-row transition-all duration-200">
                                         {/* Drag Handle Column for Child Subtask */}
                                         <td className="px-2 py-2 align-middle text-center w-16">
                                           <div className="w-6 h-6 text-blue-400 flex items-center justify-center">
                                             <Bars3Icon className="w-4 h-4" />
                                           </div>
                                         </td>
                                         {/* Checkbox Column for Child Subtask */}
                                         <td className="px-4 py-2 align-middle text-center w-12">
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
                                        {columnOrder
                                          .filter(colKey => visibleColumns.includes(colKey))
                                          .map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <td key={col.key} className={`px-4 py-2 align-middle text-sm${col.key === 'delete' ? ' text-center w-12' : ''} ${
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
                                              {renderChildSubtaskCell(col, childSub, task, sub.id, childIdx)}
                                            </td>
                                          );
                                        })}
                                        <td className="w-12 text-center">
                                          <button
                                            onClick={() => handleDeleteChildSubtask(task.id, sub.id, childSub.id)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                            title="Delete child subtask"
                                          >
                                            ×
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
                                              {columnOrder
                                                .filter(colKey => visibleColumns.includes(colKey))
                                                .slice(0, 4)
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
                                                        value={newChildSubtask.category}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, category: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="Design">Design</option>
                                                        <option value="Development">Development</option>
                                                        <option value="Testing">Testing</option>
                                                        <option value="Review">Review</option>
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
                                                    ) : col.key === "owner" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.owner}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, owner: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="">Select employee</option>
                                                        <option value="MN">MN</option>
                                                        <option value="SA">SA</option>
                                                        <option value="AH">AH</option>
                                                        <option value="MA">MA</option>
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

      {/* Checklist Modal */}
      <ChecklistModal
        open={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        items={checklistModalItems}
        setItems={setChecklistModalItems}
        onSave={handleChecklistSave}
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
          // Update the task in the main table's tasks array
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          );
          // Update the drawer task to reflect changes
          setDrawerTask(updatedTask);
        }}
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

    </div>
  );
}

