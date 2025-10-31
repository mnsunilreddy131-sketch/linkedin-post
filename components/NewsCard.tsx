
import React from 'react';
import { NewsItem } from '../types';
import { GlobeAltIcon, EyeIcon } from './Icons';

interface NewsCardProps {
  newsItem: NewsItem;
  onShowPreview: (item: NewsItem) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, onShowPreview }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 flex justify-between items-start">
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-gray-100">{newsItem.headline}</h3>
        <p className="text-gray-400 mt-1 text-sm">{newsItem.summary}</p>
        <div className="flex items-center mt-3 text-xs text-gray-500">
          <GlobeAltIcon className="h-4 w-4 mr-1.5" />
          <span>{newsItem.source}</span>
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button 
          onClick={() => onShowPreview(newsItem)}
          className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 p-2 rounded-full transition-colors"
          aria-label="View article preview"
        >
          <EyeIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
