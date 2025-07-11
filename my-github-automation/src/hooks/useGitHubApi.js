import { useCallback, useState } from 'react';
import { Octokit } from '@octokit/rest';

export const useGitHubApi = (githubToken, showNotification) => {
  const [octokit] = useState(() => {
    if (!githubToken) {
      showNotification('GitHub token is required', 'error');
      return null;
    }
    return new Octokit({ auth: githubToken });
  });

  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  // Check rate limit
  const checkRateLimit = useCallback(async () => {
    if (!octokit) return null;
    
    try {
      const { data } = await octokit.rest.rateLimit.get();
      setRateLimitInfo(data.rate);
      return data.rate;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return null;
    }
  }, [octokit]);

  // Fetch repository data
  const fetchRepoData = useCallback(async (owner, repo) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.repos.get({ owner, repo });
      return data;
    } catch (error) {
      showNotification(`Failed to fetch repository data: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Get repository structure with file contents
  const getRepositoryStructure = useCallback(async (owner, repo, path = '') => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path
      });
      
      const files = [];
      const directories = [];
      
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item.type === 'file') {
          // Fetch file content for analysis
          let content = '';
          if (item.size < 1000000) { // Only fetch files smaller than 1MB
            try {
              const fileResponse = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: item.path
              });
              
              if (fileResponse.data.content) {
                content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
              }
            } catch (contentError) {
              console.warn(`Failed to fetch content for ${item.path}:`, contentError);
            }
          }
          
          files.push({
            name: item.name,
            path: item.path,
            size: item.size,
            content,
            sha: item.sha,
            download_url: item.download_url
          });
        } else if (item.type === 'dir') {
          directories.push({
            name: item.name,
            path: item.path,
            type: 'directory'
          });
        }
      }
      
      return {
        files,
        directories,
        totalFiles: files.length,
        totalDirectories: directories.length
      };
      
    } catch (error) {
      showNotification(`Failed to get repository structure: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Create GitHub issue
  const createGitHubIssue = useCallback(async (owner, repo, title, body, labels = []) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels
      });
      
      showNotification(`Issue created: ${title}`, 'success');
      return data;
    } catch (error) {
      showNotification(`Failed to create issue: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Create pull request
  const createPullRequest = useCallback(async (owner, repo, { title, head, base, body }) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body
      });
      
      showNotification(`Pull request created: ${title}`, 'success');
      return data;
    } catch (error) {
      showNotification(`Failed to create pull request: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Update file content
  const updateFile = useCallback(async (owner, repo, path, content, message, sha) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        sha
      });
      
      showNotification(`File updated: ${path}`, 'success');
      return data;
    } catch (error) {
      showNotification(`Failed to update file: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Get branch contents
  const getBranchContents = useCallback(async (owner, repo, branch = 'main') => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        ref: branch
      });
      
      return data;
    } catch (error) {
      showNotification(`Failed to get branch contents: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Create branch
  const createBranch = useCallback(async (owner, repo, branchName, fromBranch = 'main') => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      // Get the SHA of the source branch
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`
      });
      
      // Create new branch
      const { data } = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha
      });
      
      showNotification(`Branch created: ${branchName}`, 'success');
      return data;
    } catch (error) {
      showNotification(`Failed to create branch: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Get repository insights
  const getRepositoryInsights = useCallback(async (owner, repo) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const [repoData, contributorsData, languagesData, commitsData] = await Promise.allSettled([
        octokit.rest.repos.get({ owner, repo }),
        octokit.rest.repos.listContributors({ owner, repo, per_page: 100 }),
        octokit.rest.repos.listLanguages({ owner, repo }),
        octokit.rest.repos.listCommits({ owner, repo, per_page: 100 })
      ]);
      
      const insights = {
        repository: repoData.status === 'fulfilled' ? repoData.value.data : null,
        contributors: contributorsData.status === 'fulfilled' ? contributorsData.value.data : [],
        languages: languagesData.status === 'fulfilled' ? languagesData.value.data : {},
        recentCommits: commitsData.status === 'fulfilled' ? commitsData.value.data : []
      };
      
      return insights;
    } catch (error) {
      showNotification(`Failed to get repository insights: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Search repositories
  const searchRepositories = useCallback(async (query, options = {}) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.search.repos({
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: options.per_page || 30
      });
      
      return data;
    } catch (error) {
      showNotification(`Repository search failed: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Get workflow runs
  const getWorkflowRuns = useCallback(async (owner, repo) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    try {
      const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 50
      });
      
      return data;
    } catch (error) {
      showNotification(`Failed to get workflow runs: ${error.message}`, 'error');
      throw error;
    }
  }, [octokit, showNotification]);

  // Batch operations for multiple files
  const batchFileOperations = useCallback(async (owner, repo, operations) => {
    if (!octokit) throw new Error('GitHub API not initialized');
    
    const results = [];
    
    for (const operation of operations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'update':
            result = await updateFile(owner, repo, operation.path, operation.content, operation.message, operation.sha);
            break;
          case 'create':
            result = await octokit.rest.repos.createOrUpdateFileContents({
              owner,
              repo,
              path: operation.path,
              message: operation.message,
              content: Buffer.from(operation.content, 'utf-8').toString('base64')
            });
            break;
          case 'delete':
            result = await octokit.rest.repos.deleteFile({
              owner,
              repo,
              path: operation.path,
              message: operation.message,
              sha: operation.sha
            });
            break;
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
        
        results.push({ ...operation, success: true, result });
      } catch (error) {
        results.push({ ...operation, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    showNotification(`Batch operations completed: ${successCount}/${operations.length} successful`, 'info');
    
    return results;
  }, [octokit, updateFile, showNotification]);

  return {
    fetchRepoData,
    getRepositoryStructure,
    createGitHubIssue,
    createPullRequest,
    updateFile,
    getBranchContents,
    createBranch,
    getRepositoryInsights,
    searchRepositories,
    getWorkflowRuns,
    batchFileOperations,
    checkRateLimit,
    rateLimitInfo,
    isConfigured: !!octokit
  };
};