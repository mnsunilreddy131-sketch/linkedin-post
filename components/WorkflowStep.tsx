
import React from 'react';
import { WorkflowStepData } from '../types';
import { CheckIcon, ExclamationCircleIcon, SparklesIcon as ActiveIcon } from './Icons';

interface WorkflowStepProps extends WorkflowStepData {
  children: React.ReactNode;
}

const StatusIcon: React.FC<{ status: WorkflowStepData['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckIcon className="h-6 w-6 text-green-400" />;
    case 'active':
      return <ActiveIcon className="h-6 w-6 text-purple-400 animate-pulse" />;
    case 'error':
      return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
    case 'pending':
    default:
      return <div className="h-4 w-4 rounded-full bg-gray-600 border-2 border-gray-500" />;
  }
};

const WorkflowStep: React.FC<WorkflowStepProps> = ({ title, icon, status, children }) => {
  const isExpanded = status === 'active' || status === 'completed' || status === 'error';

  const borderColor = {
    pending: 'border-gray-700',
    active: 'border-purple-500',
    completed: 'border-green-500',
    error: 'border-red-500',
  }[status];

  return (
    <div className={`pl-10 relative border-l-2 ${borderColor} transition-colors duration-500`}>
      <div className="absolute -left-[1.2rem] top-0 flex items-center justify-center bg-gray-900 w-10 h-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700">
            <StatusIcon status={status} />
        </div>
      </div>
      <div className="ml-4 -mt-2">
        <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStep;
