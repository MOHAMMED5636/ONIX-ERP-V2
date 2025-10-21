import { useState, useCallback, useRef } from 'react';

const useUndoManager = () => {
  const [undoState, setUndoState] = useState({
    isVisible: false,
    deletedItems: [],
    itemType: 'item',
    message: ''
  });
  
  const timeoutRef = useRef(null);
  const deletedItemsRef = useRef([]);

  const showUndoToast = useCallback((deletedItems, itemType = 'item', message = '') => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store deleted items for potential restoration
    deletedItemsRef.current = deletedItems;

    // Show toast
    setUndoState({
      isVisible: true,
      deletedItems,
      itemType,
      message: message || `${deletedItems.length} ${itemType}${deletedItems.length > 1 ? 's' : ''} deleted`
    });

    // Auto-dismiss after 5 seconds
    timeoutRef.current = setTimeout(() => {
      dismissUndoToast();
    }, 5000);
  }, []);

  const dismissUndoToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setUndoState(prev => ({
      ...prev,
      isVisible: false
    }));
    
    // Clear the stored items
    deletedItemsRef.current = [];
  }, []);

  const undoDeletion = useCallback((onRestore) => {
    if (deletedItemsRef.current.length > 0 && onRestore) {
      onRestore(deletedItemsRef.current);
    }
    dismissUndoToast();
  }, []);

  const softDeleteItems = useCallback((items, setItems, itemType = 'item', message = '') => {
    const timestamp = Date.now();
    const softDeletedItems = items.map(item => ({
      ...item,
      is_deleted: true,
      deleted_at: timestamp
    }));

    // Update the items state to mark as deleted
    setItems(prevItems => 
      prevItems.map(item => {
        const deletedItem = softDeletedItems.find(d => d.id === item.id);
        return deletedItem ? deletedItem : item;
      })
    );

    // Show undo toast
    showUndoToast(softDeletedItems, itemType, message);
  }, [showUndoToast]);

  const restoreItems = useCallback((deletedItems, setItems) => {
    const restoredItems = deletedItems.map(item => ({
      ...item,
      is_deleted: false,
      deleted_at: null
    }));

    // Update the items state to restore
    setItems(prevItems => 
      prevItems.map(item => {
        const restoredItem = restoredItems.find(r => r.id === item.id);
        return restoredItem ? restoredItem : item;
      })
    );
  }, []);

  const permanentlyDeleteItems = useCallback((deletedItems, setItems) => {
    const deletedIds = deletedItems.map(item => item.id);
    
    // Remove items permanently
    setItems(prevItems => 
      prevItems.filter(item => !deletedIds.includes(item.id))
    );
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    undoState,
    showUndoToast,
    dismissUndoToast,
    undoDeletion,
    softDeleteItems,
    restoreItems,
    permanentlyDeleteItems,
    cleanup
  };
};

export default useUndoManager;

