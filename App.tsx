import React, { useState, useCallback, useEffect } from 'react';
import { NewsItem, GeneratedPost, WorkflowStepData, StepId, PostStatus } from './types';
import { fetchTechNews, generateCaption, generateImage } from './services/geminiService';
import WorkflowStep from './components/WorkflowStep';
import NewsCard from './components/NewsCard';
import PostPreview from './components/PostPreview';
import ScheduleModal from './components/ScheduleModal';
import LinkPreviewModal from './components/LinkPreviewModal';
import SettingsModal from './components/SettingsModal';
import { CheckCircleIcon, DocumentTextIcon, SparklesIcon, ShareIcon, CalendarIcon, Cog6ToothIcon, ArrowPathIcon, PaperAirplaneIcon } from './components/Icons';

const App: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [postStatuses, setPostStatuses] = useState<{ [index: number]: PostStatus }>({});
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingPost, setSchedulingPost] = useState<{ post: GeneratedPost; index: number } | null>(null);
  const [previewingNewsItem, setPreviewingNewsItem] = useState<NewsItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [linkedInClientId, setLinkedInClientId] = useState('');
  const [linkedInClientSecret, setLinkedInClientSecret] = useState('');
  const [linkedInApiKey, setLinkedInApiKey] = useState('');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  useEffect(() => {
    const storedClientId = localStorage.getItem('linkedInClientId');
    if (storedClientId) {
      setLinkedInClientId(storedClientId);
    }
    const storedClientSecret = localStorage.getItem('linkedInClientSecret');
    if (storedClientSecret) {
      setLinkedInClientSecret(storedClientSecret);
    }
    const storedApiKey = localStorage.getItem('linkedInApiKey');
    if (storedApiKey) {
      setLinkedInApiKey(storedApiKey);
    }

    // Check for LinkedIn OAuth callback on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = sessionStorage.getItem('linkedin_oauth_state');

    if (code && state && state === storedState) {
      // In a real app, exchange this code for a token on your server.
      // Here, we simulate a successful connection for this client-side demo.
      localStorage.setItem('isLinkedInConnected', 'true');
      setIsLinkedInConnected(true);
      sessionStorage.removeItem('linkedin_oauth_state');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Open settings modal to show connected status
      setIsSettingsModalOpen(true); 
    } else if (urlParams.get('error')) {
      const errorDescription = urlParams.get('error_description') || 'An unknown error occurred during LinkedIn authentication.';
      setLinkedInError(`Connection Failed: ${errorDescription}`);
      setIsSettingsModalOpen(true); // Show the modal with the error
      sessionStorage.removeItem('linkedin_oauth_state');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const connected = localStorage.getItem('isLinkedInConnected') === 'true';
    setIsLinkedInConnected(connected);
  }, []);

  const initialSteps: WorkflowStepData[] = [
    { id: 'fetch', title: 'Fetch Latest Tech News', icon: <DocumentTextIcon />, status: 'active' },
    { id: 'generate', title: 'Generate Cinematic Content', icon: <SparklesIcon />, status: 'pending' },
    { id: 'post', title: 'Preview & Schedule Posts', icon: <ShareIcon />, status: 'pending' },
    { id: 'complete', title: 'Workflow Complete', icon: <CheckCircleIcon />, status: 'pending' },
  ];
  const [steps, setSteps] = useState<WorkflowStepData[]>(initialSteps);

  const updateStepStatus = (id: StepId, status: 'pending' | 'active' | 'completed' | 'error') => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };
  
  const handleFetchNews = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, fetch: true }));
    updateStepStatus('fetch', 'active');
    setError(null);
    try {
      const news = await fetchTechNews(isThinkingMode);
      setNewsItems(news);
      updateStepStatus('fetch', 'completed');
      updateStepStatus('generate', 'active');
    } catch (err) {
      setError('Failed to fetch tech news. Please try again.');
      updateStepStatus('fetch', 'error');
      console.error(err);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetch: false }));
    }
  }, [isThinkingMode]);

  const handleGenerateContent = useCallback(async () => {
    if (newsItems.length === 0) return;
    setLoadingStates(prev => ({ ...prev, generate: true }));
    setError(null);

    // Initialize posts with a loading state for immediate feedback
    setGeneratedPosts(newsItems.map(item => ({ news: item, imageUrl: '', caption: 'Generating...', isLoading: true })));

    // Process items sequentially to avoid hitting API rate limits
    for (const [index, item] of newsItems.entries()) {
        try {
            // Generate image and caption one by one for the current item
            const imageUrl = await generateImage(item.headline);
            // Increased delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            const caption = await generateCaption(item.headline, item.summary, isThinkingMode);
            
            // Update the specific post once its content is generated
            setGeneratedPosts(prev => {
              const newPosts = [...prev];
              newPosts[index] = { news: item, imageUrl, caption, isLoading: false };
              return newPosts;
            });

        } catch (err) {
            console.error(`Failed to generate content for "${item.headline}":`, err);
            const errorMessage = (err as Error).message || 'Unknown error';
            
            // Provide a more specific error message in the caption
            const detailedError = (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED'))
              ? 'API rate limit exceeded.'
              : errorMessage;
            const captionText = `Error: Could not generate content. ${detailedError}`;

            const fallbackImageUrl = `https://picsum.photos/seed/${encodeURIComponent(item.headline)}/512`;
            
            // Update the specific post with an error state
            setGeneratedPosts(prev => {
              const newPosts = [...prev];
              newPosts[index] = { news: item, imageUrl: fallbackImageUrl, caption: captionText, isLoading: false };
              return newPosts;
            });
        }
    }

    setLoadingStates(prev => ({ ...prev, generate: false }));
    updateStepStatus('generate', 'completed');
    updateStepStatus('post', 'active');
  }, [newsItems, isThinkingMode]);


  const getLinkedInShareUrl = (caption: string) => `https://www.linkedin.com/shareArticle?mini=true&summary=${encodeURIComponent(caption)}`;

  const firePost = (index: number) => {
    const post = generatedPosts[index];
    if (!post || !post.imageUrl) return;

    // Trigger image download to prompt the user to upload it
    const link = document.createElement('a');
    link.href = post.imageUrl;
    const safeHeadline = post.news.headline.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `linkedin_post_${safeHeadline.substring(0, 20)}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Open LinkedIn share URL in a new tab
    const url = getLinkedInShareUrl(post.caption);
    const windowFeatures = 'width=800,height=600,noopener,noreferrer';
    
    // Use a small timeout to give the download time to initiate before the new tab opens
    setTimeout(() => {
        const newWindow = window.open(url, '_blank', windowFeatures);

        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup was blocked
          setPostStatuses(prev => ({
            ...prev,
            [index]: { status: 'error', errorMessage: 'Popup blocked. Image was downloaded for you to upload manually.' }
          }));
        } else {
          // Popup opened successfully
          setPostStatuses(prev => {
            const currentStatus = prev[index];
            if (currentStatus?.timeoutId) {
                window.clearTimeout(currentStatus.timeoutId);
            }
            return { ...prev, [index]: { status: 'posted' } };
          });
        }
    }, 150); // 150ms delay
  };
  
  const handleOpenScheduleModal = (post: GeneratedPost, index: number) => {
    setSchedulingPost({ post, index });
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = (scheduleDate: string) => {
    if (!schedulingPost) return;

    const { index } = schedulingPost;
    const scheduledTime = new Date(scheduleDate).getTime();
    const delay = scheduledTime - Date.now();

    if (delay < 0) {
      alert("Cannot schedule for a past time.");
      return;
    }
    
    const timeoutId = window.setTimeout(() => {
        setPostStatuses(prev => ({
            ...prev,
            [index]: { ...prev[index], status: 'ready' }
        }));
    }, delay);

    const newStatuses = { 
      ...postStatuses, 
      [index]: { status: 'scheduled' as const, scheduledTime, timeoutId }
    };
    setPostStatuses(newStatuses);
    setIsScheduleModalOpen(false);
    setSchedulingPost(null);
  };

  const handleCancelSchedule = (index: number) => {
    setPostStatuses(prev => {
      const currentStatus = prev[index];
      if (currentStatus?.timeoutId) {
        window.clearTimeout(currentStatus.timeoutId);
      }
      const { [index]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleReset = () => {
    Object.values(postStatuses).forEach(status => {
      if (status.timeoutId) window.clearTimeout(status.timeoutId);
    });
    setNewsItems([]);
    setGeneratedPosts([]);
    setPostStatuses({});
    setError(null);
    setSteps(initialSteps.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })));
  };

  useEffect(() => {
    if (generatedPosts.length > 0 && Object.keys(postStatuses).length === generatedPosts.length) {
      const allPostedOrError = Object.values(postStatuses).every(s => s.status === 'posted' || s.status === 'error');
      if (allPostedOrError) {
        updateStepStatus('post', 'completed');
        updateStepStatus('complete', 'active');
      }
    }
  }, [postStatuses, generatedPosts]);

  const handleOpenPreview = (item: NewsItem) => {
    setPreviewingNewsItem(item);
  };

  const handleSaveSettings = (clientId: string, clientSecret: string, apiKey: string) => {
    localStorage.setItem('linkedInClientId', clientId);
    setLinkedInClientId(clientId);
    localStorage.setItem('linkedInClientSecret', clientSecret);
    setLinkedInClientSecret(clientSecret);
    localStorage.setItem('linkedInApiKey', apiKey);
    setLinkedInApiKey(apiKey);
  };
  
  const handleLinkedInDisconnect = () => {
      localStorage.removeItem('isLinkedInConnected');
      setIsLinkedInConnected(false);
  }
  
  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
    setLinkedInError(null); // Clear error on close
  };
  
  const handleUpdateCaption = (index: number, newCaption: string) => {
    setGeneratedPosts(prevPosts => {
      const newPosts = [...prevPosts];
      newPosts[index] = { ...newPosts[index], caption: newCaption };
      return newPosts;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                AI LinkedIn Tech News Poster
              </h1>
              <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                    <SparklesIcon className={`h-5 w-5 ${isThinkingMode ? 'text-purple-400' : 'text-gray-500'}`} />
                    <span className="text-sm text-gray-300">Thinking Mode</span>
                    <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isThinkingMode ? 'bg-purple-600' : 'bg-gray-700'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isThinkingMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <button onClick={() => setIsSettingsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors" aria-label="Open Settings">
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
              </div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            An automated workflow to fetch the latest tech news, generate cinematic content, and schedule posts for LinkedIn.
          </p>
        </header>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg mb-6">{error}</div>}

        <div className="space-y-8">
          <WorkflowStep {...steps[0]}>
            <div className="p-4">
              {newsItems.length === 0 ? (
                <button onClick={handleFetchNews} disabled={loadingStates.fetch} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  {loadingStates.fetch ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Fetching News...</>
                  ) : 'Fetch News'}
                </button>
              ) : (
                <div className="space-y-3">
                  {newsItems.map((item, index) => <NewsCard key={index} newsItem={item} onShowPreview={handleOpenPreview} />)}
                </div>
              )}
            </div>
          </WorkflowStep>

          <WorkflowStep {...steps[1]}>
            <div className="p-4">
              {generatedPosts.length === 0 && (
                <button onClick={handleGenerateContent} disabled={loadingStates.generate || newsItems.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                  {loadingStates.generate ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Generating...</>
                  ) : 'Generate Content'}
                </button>
              )}
            </div>
          </WorkflowStep>

          <WorkflowStep {...steps[2]}>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedPosts.map((post, index) => (
                <div key={index} className="relative group">
                  <PostPreview 
                    post={post} 
                    index={index}
                    onCaptionChange={handleUpdateCaption}
                    onPostNow={() => firePost(index)}
                    onSchedule={() => handleOpenScheduleModal(post, index)}
                  />
                  {!post.isLoading && postStatuses[index] && (
                  <div className={`absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center transition-opacity duration-300 ${postStatuses[index]?.status === 'posted' ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                    {postStatuses[index]?.status === 'scheduled' && (
                        <div className="text-center">
                            <p className="font-semibold text-white">Scheduled for:</p>
                            <p className="text-purple-300 text-sm mb-3">{new Date(postStatuses[index].scheduledTime!).toLocaleString()}</p>
                            <button onClick={() => handleCancelSchedule(index)} className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Cancel</button>
                        </div>
                    )}
                    {postStatuses[index]?.status === 'ready' && (
                        <div className="text-center">
                            <p className="font-semibold text-cyan-400 mb-3">Ready to Post!</p>
                             <button onClick={() => firePost(index)} className="w-48 justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors">
                                <PaperAirplaneIcon className="h-5 w-5" />
                                <span>Post to LinkedIn</span>
                            </button>
                        </div>
                    )}
                     {postStatuses[index]?.status === 'posted' && (
                        <div className="text-center text-green-400 font-bold flex items-center space-x-2">
                           <CheckCircleIcon className="h-6 w-6" /> 
                           <span>Posted!</span>
                        </div>
                    )}
                    {postStatuses[index]?.status === 'error' && (
                        <div className="text-center">
                            <p className="font-semibold text-red-400">Post Failed</p>
                            <p className="text-red-300 text-xs mb-3">{postStatuses[index].errorMessage}</p>
                            <button onClick={() => firePost(index)} className="text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md flex items-center mx-auto transition-colors">
                                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                                Retry
                            </button>
                        </div>
                    )}
                  </div>
                  )}
                </div>
              ))}
            </div>
             {steps[2].status === 'active' && <div className="p-4 text-center text-sm text-yellow-400 bg-yellow-900/30 rounded-lg mt-4">Note: The browser tab must remain open for scheduled posts to be triggered.</div>}
          </WorkflowStep>

          <WorkflowStep {...steps[3]}>
             <div className="p-4 text-center">
                <p className="text-lg text-green-400 mb-4">Workflow complete! All posts have been actioned.</p>
                <button onClick={handleReset} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Start Over</button>
            </div>
          </WorkflowStep>
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={handleConfirmSchedule}
        post={schedulingPost?.post ?? null}
      />
      
      <LinkPreviewModal 
        newsItem={previewingNewsItem}
        onClose={() => setPreviewingNewsItem(null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
        initialClientId={linkedInClientId}
        initialClientSecret={linkedInClientSecret}
        initialApiKey={linkedInApiKey}
        onSave={handleSaveSettings}
        isLinkedInConnected={isLinkedInConnected}
        onLinkedInDisconnect={handleLinkedInDisconnect}
        linkedInError={linkedInError}
      />
    </div>
  );
};

export default App;