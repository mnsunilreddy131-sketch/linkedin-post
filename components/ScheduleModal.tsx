import React, { useState, useEffect } from 'react';
import { GeneratedPost } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduleDate: string) => void;
  post: GeneratedPost | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onConfirm, post }) => {
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Set minimum time to 1 minute in the future
    return now.toISOString().slice(0, 16);
  };

  const [scheduleDate, setScheduleDate] = useState(getMinDateTime());
  const [minDateTime, setMinDateTime] = useState(getMinDateTime());

  useEffect(() => {
    if (isOpen) {
      const newMinDateTime = getMinDateTime();
      setMinDateTime(newMinDateTime);
      // If the current scheduleDate is in the past, reset it to the new minimum
      if (new Date(scheduleDate) < new Date(newMinDateTime)) {
        setScheduleDate(newMinDateTime);
      }
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const handleConfirm = () => {
    if (new Date(scheduleDate) <= new Date()) {
      alert("Please select a future date and time.");
      return;
    }
    onConfirm(scheduleDate);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="schedule-modal-title" className="text-xl font-bold text-white mb-2">Schedule Post</h2>
        <p className="text-gray-400 mb-4">Select a date and time to post about "{post.news.headline}".</p>
        
        <div className="mb-4">
          <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-300 mb-2">
            Posting Time
          </label>
          <input
            type="datetime-local"
            id="scheduleTime"
            name="scheduleTime"
            value={scheduleDate}
            min={minDateTime}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors"
          >
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
