import React, { useState } from 'react';
import { GeneratedPost } from '../types';
import { ClipboardDocumentIcon, PaperAirplaneIcon, CalendarIcon } from './Icons';

interface PostPreviewProps {
  post: GeneratedPost;
  index: number;
  onCaptionChange: (index: number, newCaption: string) => void;
  onPostNow: () => void;
  onSchedule: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ post, index, onCaptionChange, onPostNow, onSchedule }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (post.isLoading) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-pulse h-full">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-gray-700"></div>
          <div className="ml-3">
            <div className="h-4 w-32 bg-gray-700 rounded"></div>
            <div className="h-3 w-24 bg-gray-700 rounded mt-1"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-3 w-full bg-gray-700 rounded"></div>
            <div className="h-3 w-5/6 bg-gray-700 rounded"></div>
        </div>
        <div className="aspect-video w-full bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCaptionChange(index, e.target.value);
  };
  
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(post.caption).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex items-center mb-4">
          <img src="https://picsum.photos/seed/linkedin/40/40" alt="Profile" className="h-10 w-10 rounded-full" />
          <div className="ml-3">
            <p className="font-semibold text-sm text-white">Your Company Name</p>
            <p className="text-xs text-gray-400">Daily Tech Update</p>
          </div>
        </div>
        <textarea
          value={post.caption}
          onChange={handleCaptionChange}
          className="w-full h-28 bg-transparent text-gray-300 mb-4 whitespace-pre-wrap text-sm leading-relaxed border-none focus:ring-2 focus:ring-purple-500 rounded-md resize-none overflow-y-auto p-1 -m-1"
          aria-label="Post caption"
        />
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.news.headline} 
            className="w-full aspect-video object-cover rounded-lg border-2 border-gray-700/50 transition-all duration-300 ease-in-out hover:border-purple-500 hover:scale-[1.02]" 
          />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
        <div className="flex space-x-2">
            <button
                onClick={onPostNow}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
            >
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>Post Now</span>
            </button>
            <button
                onClick={onSchedule}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
            >
                <CalendarIcon className="h-4 w-4" />
                <span>Schedule Post</span>
            </button>
        </div>
        <button
          onClick={handleCopyCaption}
          disabled={isCopied}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
            isCopied
              ? 'bg-green-600 text-white cursor-default'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>{isCopied ? 'Copied!' : 'Copy Caption'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostPreview;