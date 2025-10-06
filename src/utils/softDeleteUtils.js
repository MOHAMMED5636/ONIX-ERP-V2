/**
 * Utility functions for handling soft delete functionality
 */

/**
 * Filters out soft-deleted items from a list
 * @param {Array} items - Array of items to filter
 * @returns {Array} Filtered array without soft-deleted items
 */
export const filterActiveItems = (items) => {
  return items.filter(item => !item.is_deleted);
};

/**
 * Gets only soft-deleted items from a list
 * @param {Array} items - Array of items to filter
 * @returns {Array} Array containing only soft-deleted items
 */
export const getDeletedItems = (items) => {
  return items.filter(item => item.is_deleted);
};

/**
 * Marks items as soft-deleted
 * @param {Array} items - Array of items to mark as deleted
 * @returns {Array} Items with is_deleted flag set to true
 */
export const markAsDeleted = (items) => {
  const timestamp = Date.now();
  return items.map(item => ({
    ...item,
    is_deleted: true,
    deleted_at: timestamp
  }));
};

/**
 * Restores soft-deleted items
 * @param {Array} items - Array of soft-deleted items to restore
 * @returns {Array} Items with is_deleted flag set to false
 */
export const markAsRestored = (items) => {
  return items.map(item => ({
    ...item,
    is_deleted: false,
    deleted_at: null
  }));
};

/**
 * Applies soft delete to items in a state array
 * @param {Array} stateItems - Current state array
 * @param {Array} itemsToDelete - Items to mark as deleted
 * @returns {Array} Updated state array with soft-deleted items
 */
export const applySoftDelete = (stateItems, itemsToDelete) => {
  const deletedIds = itemsToDelete.map(item => item.id);
  const timestamp = Date.now();
  
  return stateItems.map(item => {
    if (deletedIds.includes(item.id)) {
      return {
        ...item,
        is_deleted: true,
        deleted_at: timestamp
      };
    }
    return item;
  });
};

/**
 * Restores soft-deleted items in a state array
 * @param {Array} stateItems - Current state array
 * @param {Array} itemsToRestore - Items to restore
 * @returns {Array} Updated state array with restored items
 */
export const applyRestore = (stateItems, itemsToRestore) => {
  const restoredIds = itemsToRestore.map(item => item.id);
  
  return stateItems.map(item => {
    if (restoredIds.includes(item.id)) {
      return {
        ...item,
        is_deleted: false,
        deleted_at: null
      };
    }
    return item;
  });
};

/**
 * Permanently removes items from a state array
 * @param {Array} stateItems - Current state array
 * @param {Array} itemsToRemove - Items to permanently remove
 * @returns {Array} Updated state array without the removed items
 */
export const applyPermanentDelete = (stateItems, itemsToRemove) => {
  const removedIds = itemsToRemove.map(item => item.id);
  return stateItems.filter(item => !removedIds.includes(item.id));
};

/**
 * Gets count of active (non-deleted) items
 * @param {Array} items - Array of items
 * @returns {number} Count of active items
 */
export const getActiveItemCount = (items) => {
  return items.filter(item => !item.is_deleted).length;
};

/**
 * Gets count of soft-deleted items
 * @param {Array} items - Array of items
 * @returns {number} Count of soft-deleted items
 */
export const getDeletedItemCount = (items) => {
  return items.filter(item => item.is_deleted).length;
};

/**
 * Checks if an item is soft-deleted
 * @param {Object} item - Item to check
 * @returns {boolean} True if item is soft-deleted
 */
export const isItemDeleted = (item) => {
  return item.is_deleted === true;
};

/**
 * Gets deletion timestamp for an item
 * @param {Object} item - Item to check
 * @returns {number|null} Deletion timestamp or null if not deleted
 */
export const getDeletionTimestamp = (item) => {
  return item.deleted_at || null;
};

/**
 * Gets time since deletion in seconds
 * @param {Object} item - Soft-deleted item
 * @returns {number} Seconds since deletion
 */
export const getTimeSinceDeletion = (item) => {
  if (!item.deleted_at) return 0;
  return Math.floor((Date.now() - item.deleted_at) / 1000);
};

/**
 * Checks if a deletion is older than specified duration
 * @param {Object} item - Soft-deleted item
 * @param {number} durationSeconds - Duration in seconds
 * @returns {boolean} True if deletion is older than duration
 */
export const isDeletionOlderThan = (item, durationSeconds) => {
  return getTimeSinceDeletion(item) > durationSeconds;
};
