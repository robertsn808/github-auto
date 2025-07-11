import { useCallback, useState, useRef } from 'react';
import { useGitHubApi } from './useGitHubApi';
import { useDatabase } from './useDatabase';
import OpenAI from 'openai';
import { validateRepositoryUrl, validateApiKey } from '../utils/security';

const handleError = (error, context, showNotification) => {
  console.error(`Error in ${context}:`, error);
  showNotification(`${context} failed: ${error.message}`, 'error');
  throw error;
};

export const useAutomationActions = (
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
  showNotification
) => {
  const {
    fetchRepoData,
    getRepositoryStructure,
    createGitHubIssue,
    createPullRequest,
    updateFile,
    getBranchContents
  } = useGitHubApi(githubToken, showNotification);

  const { saveAutomationEntry: saveAutomationEntryToDB } = useDatabase(showNotification);
  const openaiRef = useRef(null);
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState(false);

  const initializeOpenAI = useCallback(() => {
    if (openaiRef.current) return openaiRef.current;
    let apiKey;
    try {
      apiKey = validateApiKey(process.env.REACT_APP_OPENAI_API_KEY, 'openai');
    } catch (err) {
      showNotification(`OpenAI Key Error: ${err.message}`, 'error');
      return null;
    }
    openaiRef.current = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    setIsOpenAIConfigured(true);
    return openaiRef.current;
  }, [showNotification]);

  const analyzeRepository = useCallback(async () => {
    if (!repoUrl || !githubToken) {
      showNotification('Repository URL and GitHub token are required', 'error');
      return;
    }

    try {
      validateApiKey(githubToken, 'github');
    } catch (err) {
      showNotification(`GitHub Key Error: ${err.message}`, 'error');
      return;
    }

    let owner, repo;
    try {
      const parsed = validateRepositoryUrl(repoUrl);
      owner = parsed.owner;
      repo = parsed.repo;
    } catch (error) {
      showNotification(`Invalid repository URL: ${error.message}`, 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingMessage('Fetching repository structure...');

    try {
      const structure = await getRepositoryStructure(owner, repo);
      const branchContent = await getBranchContents(owner, repo);
      const repoMeta = await fetchRepoData(owner, repo);
      setRepoData(repoMeta);

      const readmeFile = (branchContent || []).find(f => f.name.toLowerCase() === 'readme.md');
      if (readmeFile && readmeFile.sha) {
        const decodedContent = atob(readmeFile.content || '');
        const updatedContent = decodedContent + '\n\n_Auto-patched by GitHub Automation Tool._';
        await updateFile(owner, repo, readmeFile.path, updatedContent, 'chore: auto-patch README', readmeFile.sha);
        showNotification('README.md updated successfully.', 'success');
      }

      const analysis = {
        repository: { owner, repo },
        structure,
        meta: {
          stars: repoMeta.stargazers_count,
          forks: repoMeta.forks_count
        },
        timestamp: new Date().toISOString()
      };

      setAnalysisResults(analysis);
      await createGitHubIssue(owner, repo, 'Automated Analysis', 'Initial automated scan completed.', ['automated']);
      await saveAutomationEntryToDB({ repoUrl, analysis, timestamp: new Date().toISOString() });

      const pr = await createPullRequest(owner, repo, {
        title: 'Auto-analysis baseline',
        head: 'main',
        base: 'main',
        body: 'Automated analysis results added.'
      });

      showNotification(`Analysis complete. PR created: #${pr.number}`, 'success');
    } catch (error) {
      handleError(error, 'Repository analysis', showNotification);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  }, [
    repoUrl,
    githubToken,
    getRepositoryStructure,
    getBranchContents,
    fetchRepoData,
    updateFile,
    createGitHubIssue,
    createPullRequest,
    setRepoData,
    setAnalysisResults,
    saveAutomationEntryToDB,
    setIsProcessing,
    setProcessingMessage,
    showNotification
  ]);

  return {
    analyzeRepository,
    initializeOpenAI,
    isOpenAIConfigured
  };
};
