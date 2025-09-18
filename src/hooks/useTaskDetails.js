import { useState, useEffect, useCallback } from 'react';

const useTaskDetails = (taskIdOrTask) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      const taskData = await response.json();
      setTask(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (taskId, commentText) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      
      // Optimistically update the task
      setTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      
      return newComment;
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (typeof taskIdOrTask === 'string') {
      fetchTask(taskIdOrTask);
    } else if (taskIdOrTask && typeof taskIdOrTask === 'object') {
      setTask(taskIdOrTask);
      setLoading(false);
      setError(null);
    }
  }, [taskIdOrTask, fetchTask]);

  return { task, loading, error, addComment };
};

export default useTaskDetails;
