
import React from 'react';

export interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  articleSnippet: string;
}

export interface GeneratedPost {
  news: NewsItem;
  imageUrl: string;
  caption: string;
  isLoading?: boolean;
}

export type StepId = 'fetch' | 'generate' | 'post' | 'complete';

export interface WorkflowStepData {
  id: StepId;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface PostStatus {
  status: 'scheduled' | 'posted' | 'error' | 'ready';
  scheduledTime?: number; // Store as timestamp
  timeoutId?: number;
  errorMessage?: string;
}
