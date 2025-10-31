
import React from 'react';
import { NewsItem } from '../types';
import { GlobeAltIcon, SparklesIcon } from './Icons';

interface LinkPreviewModalProps {
  newsItem: NewsItem | null;
  onClose: () => void;
}

const LinkPreviewModal: React.FC<LinkPreviewModalProps> = ({ newsItem, onClose }) => {
  if (!newsItem) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-gray-700 rounded-t-lg flex items-center justify-center text-gray-500">
           <div className="text-center p-4">
             <SparklesIcon className="h-10 w-10 mx-auto text-gray-600 mb-2" />
             <p className="text-sm">A unique header image will be generated in the next step.</p>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-3">{newsItem.headline}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-1.5" />
              <span>{newsItem.source}</span>
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 truncate hover:underline">{newsItem.url}</a>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {newsItem.articleSnippet}
          </p>
          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkPreviewModal;
