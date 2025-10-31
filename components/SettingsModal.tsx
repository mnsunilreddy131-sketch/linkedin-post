
import React, { useState, useEffect } from 'react';
import { LinkedInIcon, ArrowTopRightOnSquareIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClientId: string;
  initialClientSecret: string;
  initialApiKey: string;
  onSave: (clientId: string, clientSecret: string, apiKey: string) => void;
  isLinkedInConnected: boolean;
  onLinkedInDisconnect: () => void;
  linkedInError: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialClientId, 
  initialClientSecret,
  initialApiKey,
  onSave,
  isLinkedInConnected,
  onLinkedInDisconnect,
  linkedInError
}) => {
  const [clientId, setClientId] = useState(initialClientId);
  const [clientSecret, setClientSecret] = useState(initialClientSecret);
  const [apiKey, setApiKey] = useState(initialApiKey);

  useEffect(() => {
    setClientId(initialClientId);
    setClientSecret(initialClientSecret);
    setApiKey(initialApiKey);
  }, [initialClientId, initialClientSecret, initialApiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(clientId, clientSecret, apiKey);
    onClose();
  };

  const handleLinkedInConnect = () => {
    if (!clientId.trim()) {
      alert('Please enter your LinkedIn Client ID first.');
      return;
    }
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('linkedin_oauth_state', state);

    const redirectUri = window.location.origin + window.location.pathname;
    // Scope required for posting content. The user will be asked to grant this permission.
    const scope = 'w_member_social'; 

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
    
    // Redirect user to LinkedIn's authorization page
    window.location.href = authUrl;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-modal-title" className="text-xl font-bold text-white mb-2">Configuration</h2>
        <p className="text-gray-400 mb-4">Manage your credentials and API settings.</p>
        
        {linkedInError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-sm rounded-lg">
                <strong>Error:</strong> {linkedInError}
            </div>
        )}
        
        <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">LinkedIn Credentials</h3>
            <p className="text-xs text-gray-400 -mt-2">Enter the credentials from your LinkedIn Developer App. The Client ID and Secret are used for authentication.</p>
            <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">
                Client ID
                </label>
                <input
                type="text"
                id="clientId"
                name="clientId"
                placeholder="Enter your LinkedIn Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            <div>
                <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-300 mb-2">
                Client Secret
                </label>
                <input
                type="password"
                id="clientSecret"
                name="clientSecret"
                placeholder="Enter your LinkedIn Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
             <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn API Key
                </label>
                <input
                type="password"
                id="apiKey"
                name="apiKey"
                placeholder="Enter your LinkedIn API Key (if required)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
            {isLinkedInConnected ? (
                <div className="flex items-center justify-between">
                <p className="text-green-400 font-semibold">Successfully connected to LinkedIn.</p>
                <button
                    onClick={onLinkedInDisconnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-semibold transition-colors"
                >
                    Disconnect
                </button>
                </div>
            ) : (
                <>
                <button
                onClick={handleLinkedInConnect}
                disabled={!clientId.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0077B5] hover:bg-[#006097] disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors"
                >
                <LinkedInIcon className="h-5 w-5 mr-2" />
                Connect with LinkedIn
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">You must add this page's URL to the "Authorized redirect URLs" in your LinkedIn Developer App settings.</p>
                </>
            )}
            </div>
        </div>

        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Google AI API Usage</h3>
             <p className="text-sm text-gray-400">Monitor your Gemini and Imagen API usage to avoid hitting rate limits. This will take you to the official Google AI Studio dashboard.</p>
             <a
                href="https://ai.dev/usage"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors"
            >
                <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
                Check Usage in AI Studio
            </a>
        </div>

        <div className="mt-6 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 text-xs rounded-lg">
          <strong>Security Notice:</strong> The final step of OAuth (exchanging a code for a token) requires a secure server to protect your 'Client Secret'. This demo simulates a connection after you authorize on LinkedIn, but does not store any access tokens.
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
