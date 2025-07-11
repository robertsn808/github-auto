import React, { useState, useEffect } from 'react';
import { Github, Code, Bug, Lightbulb, GitBranch, CheckCircle, AlertTriangle, Play, Settings, Database, Activity, Eye, Shield, Zap, Target, FileText, Clock, Users, Star, GitPullRequest, AlertCircle } from 'lucide-react';
import { useGitHubApi } from '../hooks/useGitHubApi';
import { useAutomationActions } from '../hooks/useAutomationActions';
import { useAutomationHistory } from '../hooks/useAutomationHistory';
import { useNotifications } from '../hooks/useNotifications';
import AnalysisSection from './AnalysisSection';
import AutomationHistorySection from './AutomationHistorySection';
import SettingsSection from './SettingsSection';
import StatisticsSection from './StatisticsSection';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const AIGitHubAutomation = () => {
  // Helper to fetch and set past analyses
  const fetchPastAnalyses = async (repoId) => {
    try {
      const res = await fetch(`${API_BASE}/api/repositories/${repoId}/analyses`);
      const data = await res.json();
      if (data.success) setAnalysisResults(data.analyses);
    } catch (err) {
      console.error("Failed to fetch past analyses", err);
    }
  };

  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');
  const [repoData, setRepoData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [automationConfig, setAutomationConfig] = useState({
    autoBugFix: true,
    autoImprovement: true,
    autoFeatures: false,
    requireApproval: true,
    maxBugsPerRun: 5,
    maxImprovementsPerRun: 3,
    enableSecurityScans: true,
    enablePerformanceOptimization: true,
    enableDocumentationUpdates: true,
    autoTestGeneration: true,
    codeReviewMode: 'thorough', // 'quick', 'thorough', 'comprehensive'
    priorityThreshold: 'medium' // 'low', 'medium', 'high'
  });

  const { showNotification } = useNotifications();
  const { fetchRepoData, getRepositoryStructure } = useGitHubApi(githubToken, showNotification);
  const { automationHistory, addAutomationEntry, getStatistics } = useAutomationHistory();

  const {
    analyzeRepository,
    executeBugFix,
    executeImprovement,
    developFeature,
    executeBulkBugFixes,
    executeBulkImprovements
  } = useAutomationActions(
    repoUrl,
    githubToken,
    repoData,
    setRepoData,
    analysisResults,
    setAnalysisResults,
    automationConfig,
    setIsProcessing,
    setProcessingMessage,
    addAutomationEntry,
    showNotification,
    fetchRepoData,
    getRepositoryStructure
  );

  const statistics = getStatistics();

  // Use useEffect for logging component mount
  useEffect(() => {
    console.log('AIGitHubAutomation component mounted.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Enhanced Header */}
      <div className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Github className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI GitHub Automation</h1>
            </div>
            <nav className="space-x-6">
              <button onClick={() => setActiveTab('analyze')} className={`text-lg font-medium transition-colors hover:text-blue-300 ${activeTab === 'analyze' ? 'text-blue-400' : 'text-gray-300'}`}>Analyze <Code className="inline-block ml-1" size={18} /></button>
              <button onClick={() => setActiveTab('history')} className={`text-lg font-medium transition-colors hover:text-blue-300 ${activeTab === 'history' ? 'text-blue-400' : 'text-gray-300'}`}>History <Clock className="inline-block ml-1" size={18} /></button>
              <button onClick={() => setActiveTab('settings')} className={`text-lg font-medium transition-colors hover:text-blue-300 ${activeTab === 'settings' ? 'text-blue-400' : 'text-gray-300'}`}>Settings <Settings className="inline-block ml-1" size={18} /></button>
              <button onClick={() => setActiveTab('stats')} className={`text-lg font-medium transition-colors hover:text-blue-300 ${activeTab === 'stats' ? 'text-blue-400' : 'text-gray-300'}`}>Stats <Activity className="inline-block ml-1" size={18} /></button>
            </nav>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'analyze' && (
          <AnalysisSection
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            isProcessing={isProcessing}
            processingMessage={processingMessage}
            analysisResults={analysisResults}
            analyzeRepository={async () => {
              await analyzeRepository();
              if (repoData?.id) await fetchPastAnalyses(repoData.id);
            }}

            executeBugFix={executeBugFix}
            executeImprovement={executeImprovement}
            developFeature={developFeature}
            executeBulkBugFixes={executeBulkBugFixes}
            executeBulkImprovements={executeBulkImprovements}
            automationConfig={automationConfig}
          />
        )}

        {activeTab === 'history' && (
          <AutomationHistorySection history={automationHistory} />
        )}

        {activeTab === 'settings' && (
          <SettingsSection config={automationConfig} setConfig={setAutomationConfig} />
        )}

        {activeTab === 'stats' && (
          <StatisticsSection stats={statistics} />
        )}

        {/* Example usage of other icons - these can be integrated into specific sections as needed */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Icon Showcase (for demonstration)</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2"><Bug size={24} className="text-red-400" /><span>Bugs</span></div>
            <div className="flex items-center space-x-2"><Lightbulb size={24} className="text-yellow-400" /><span>Improvements</span></div>
            <div className="flex items-center space-x-2"><GitBranch size={24} className="text-green-400" /><span>Branches</span></div>
            <div className="flex items-center space-x-2"><CheckCircle size={24} className="text-green-500" /><span>Success</span></div>
            <div className="flex items-center space-x-2"><AlertTriangle size={24} className="text-orange-500" /><span>Warnings</span></div>
            <div className="flex items-center space-x-2"><Play size={24} className="text-blue-400" /><span>Run Automation</span></div>
            <div className="flex items-center space-x-2"><Database size={24} className="text-purple-400" /><span>Database</span></div>
            <div className="flex items-center space-x-2"><Eye size={24} className="text-gray-400" /><span>View</span></div>
            <div className="flex items-center space-x-2"><Shield size={24} className="text-indigo-400" /><span>Security</span></div>
            <div className="flex items-center space-x-2"><Zap size={24} className="text-yellow-500" /><span>Performance</span></div>
            <div className="flex items-center space-x-2"><Target size={24} className="text-pink-400" /><span>Features</span></div>
            <div className="flex items-center space-x-2"><FileText size={24} className="text-teal-400" /><span>Documentation</span></div>
            <div className="flex items-center space-x-2"><Users size={24} className="text-cyan-400" /><span>Users</span></div>
            <div className="flex items-center space-x-2"><Star size={24} className="text-yellow-300" /><span>Stars</span></div>
            <div className="flex items-center space-x-2"><GitPullRequest size={24} className="text-orange-400" /><span>Pull Requests</span></div>
            <div className="flex items-center space-x-2"><AlertCircle size={24} className="text-red-500" /><span>Errors</span></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-sm mt-12 py-6 text-center text-gray-400">
        <p>&copy; 2025 AI GitHub Automation. All rights reserved.</p>
        <p className="text-sm mt-2">Powered by Elite AI and GitHub API.</p>
      </footer>
    </div>
  );
};

export default AIGitHubAutomation;


