import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { XMarkIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import {
  formatDateKey,
  loadMeetingsMap,
  saveMeetingsMap,
} from '../../utils/dashboardMeetingsStorage';

import 'react-calendar/dist/Calendar.css';
import '../../modules/calendar-custom.css';

function MeetingsModal({
  open,
  dateKey,
  meetings,
  onClose,
  onSave,
  onDelete,
  saveError,
  clearSaveError,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setTime('');
      setEditingId(null);
      clearSaveError();
    }
  }, [open, dateKey, clearSaveError]);

  const startEdit = (m) => {
    setEditingId(m.id);
    setTitle(m.title || '');
    setDescription(m.description || '');
    setTime(m.time || '');
    clearSaveError();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setTime('');
    clearSaveError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const ok = onSave({
      id: editingId || uuidv4(),
      date: dateKey,
      title: t,
      description: description.trim(),
      time: time.trim() || null,
    });
    if (ok !== false) cancelEdit();
  };

  if (!open || !dateKey) return null;

  const displayDate = (() => {
    try {
      return format(new Date(dateKey + 'T12:00:00'), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateKey;
    }
  })();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meetings-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-indigo-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-cyan-50">
          <h2 id="meetings-modal-title" className="text-lg font-bold text-gray-900 pr-2">
            {displayDate}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-white/80 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              Unable to save meeting
            </div>
          )}
          {(!meetings || meetings.length === 0) && !editingId && (
            <p className="text-sm text-gray-500 text-center py-2">No events for this date</p>
          )}

          {meetings && meetings.length > 0 && (
            <ul className="space-y-3">
              {meetings.map((m) => (
                <li
                  key={m.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900">{m.title}</div>
                      {m.time && (
                        <div className="text-xs text-indigo-600 font-medium mt-0.5">{m.time}</div>
                      )}
                      {m.description && (
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap break-words">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-800">
              {editingId ? 'Edit meeting' : 'Add meeting'}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meeting title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Team standup"
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description / notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Optional details"
                maxLength={2000}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time (optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 min-w-[100px] px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
              >
                Save
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardMeetingsCalendar() {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : null;

  const [meetingsByDate, setMeetingsByDate] = useState({});
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [weekAnchor, setWeekAnchor] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDateKey, setModalDateKey] = useState(null);
  const [saveError, setSaveError] = useState(false);

  const reload = useCallback(() => {
    if (!userId) {
      setMeetingsByDate({});
      return;
    }
    setMeetingsByDate(loadMeetingsMap(userId));
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback(
    (nextMap) => {
      if (!userId) {
        setSaveError(true);
        return false;
      }
      const result = saveMeetingsMap(userId, nextMap);
      if (!result.success) {
        setSaveError(true);
        return false;
      }
      setSaveError(false);
      setMeetingsByDate(nextMap);
      return true;
    },
    [userId]
  );

  const hasMeetingsOn = useCallback(
    (key) => {
      const list = meetingsByDate[key];
      return Array.isArray(list) && list.length > 0;
    },
    [meetingsByDate]
  );

  const openDay = useCallback((date) => {
    const key = formatDateKey(date);
    if (!key) return;
    setModalDateKey(key);
    setModalOpen(true);
    setSaveError(false);
  }, []);

  const meetingsForModal = useMemo(() => {
    if (!modalDateKey) return [];
    return meetingsByDate[modalDateKey] || [];
  }, [modalDateKey, meetingsByDate]);

  const handleSaveMeeting = useCallback(
    (meeting) => {
      const key = meeting.date;
      const prev = { ...meetingsByDate };
      const list = [...(prev[key] || [])];
      const idx = list.findIndex((m) => m.id === meeting.id);
      if (idx >= 0) {
        list[idx] = meeting;
      } else {
        list.push(meeting);
      }
      prev[key] = list;
      return persist(prev);
    },
    [meetingsByDate, persist]
  );

  const handleDeleteMeeting = useCallback(
    (meetingId) => {
      if (!modalDateKey) return false;
      const prev = { ...meetingsByDate };
      const list = (prev[modalDateKey] || []).filter((m) => m.id !== meetingId);
      if (list.length === 0) {
        delete prev[modalDateKey];
      } else {
        prev[modalDateKey] = list;
      }
      return persist(prev);
    },
    [modalDateKey, meetingsByDate, persist]
  );

  const clearSaveError = useCallback(() => setSaveError(false), []);

  const todayKey = formatDateKey(new Date());

  const weekDays = useMemo(() => {
    const start = startOfWeek(weekAnchor, { weekStartsOn: 1 });
    const end = endOfWeek(weekAnchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [weekAnchor]);

  if (!userId) {
    return (
      <div className="text-xs text-gray-500 text-center py-4">Sign in to manage meetings.</div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => setViewMode('month')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            viewMode === 'month'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => {
            setViewMode('week');
            setWeekAnchor(calendarValue);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            viewMode === 'week'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/80 text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Week
        </button>
      </div>

      {viewMode === 'month' ? (
        <Calendar
          onChange={(d) => d && setCalendarValue(d)}
          value={calendarValue}
          view="month"
          onClickDay={(date) => {
            setCalendarValue(date);
            openDay(date);
          }}
          tileClassName={({ date, view: v }) => {
            if (v !== 'month') return null;
            const key = formatDateKey(date);
            if (hasMeetingsOn(key)) return 'dashboard-meeting-day';
            return null;
          }}
          tileContent={({ date, view: v }) => {
            if (v !== 'month') return null;
            const key = formatDateKey(date);
            const has = hasMeetingsOn(key);
            const isToday = key === todayKey;
            return (
              <span className="flex flex-col items-center justify-end min-h-[1.25rem] gap-0.5">
                {isToday && (
                  <span className="text-[10px] leading-none text-indigo-600 font-bold">●</span>
                )}
                {has && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-indigo-500" title="Has meeting(s)" />
                )}
              </span>
            );
          }}
          className="rounded-xl sm:rounded-2xl shadow-md p-2 sm:p-4 border-0 w-full calendar-attractive"
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              className="px-2 py-1 text-indigo-600 font-bold text-sm rounded hover:bg-indigo-50"
              onClick={() => setWeekAnchor((d) => addWeeks(d, -1))}
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
            </span>
            <button
              type="button"
              className="px-2 py-1 text-indigo-600 font-bold text-sm rounded hover:bg-indigo-50"
              onClick={() => setWeekAnchor((d) => addWeeks(d, 1))}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => {
              const key = formatDateKey(day);
              const has = hasMeetingsOn(key);
              const today = key === todayKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCalendarValue(day);
                    openDay(day);
                  }}
                  className={`flex flex-col items-center py-2 rounded-lg text-xs transition border ${
                    today
                      ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-800'
                      : 'border-transparent hover:bg-gray-100 text-gray-800'
                  } ${has ? 'ring-1 ring-indigo-300' : ''}`}
                >
                  <span className="text-[10px] uppercase text-gray-500">{format(day, 'EEE')}</span>
                  <span className="text-sm font-semibold">{format(day, 'd')}</span>
                  {has && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <MeetingsModal
        open={modalOpen}
        dateKey={modalDateKey}
        meetings={meetingsForModal}
        onClose={() => {
          setModalOpen(false);
          setModalDateKey(null);
          setSaveError(false);
        }}
        onSave={handleSaveMeeting}
        onDelete={handleDeleteMeeting}
        saveError={saveError}
        clearSaveError={clearSaveError}
      />
    </div>
  );
}
