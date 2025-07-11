import React, { useCallback, useEffect, useState, useMemo } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useDatabase = (showNotification) => {


  const API_BASE_URL = useMemo(() => process.env.REACT_APP_API_URL || "http://backend:8000", []);
  // Repository operations
  const saveRepository = useCallback(async (repoData) => {
    try {
	const response = await fetch(`${API_BASE_URL}/repositories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoData.name,
          full_name: repoData.full_name,
          url: repoData.html_url,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          open_issues: repoData.open_issues_count,
          has_readme: repoData.health?.hasReadme || false,
          has_license: repoData.health?.hasLicense || false,
          has_issues: repoData.health?.hasIssues || false,
          contributor_count: repoData.health?.contributorCount || 0,
          pr_count: repoData.health?.prCount || 0,
          total_files: repoData.structure?.totalFiles || 0,
          has_tests: repoData.structure?.hasTests || false,
          has_documentation: repoData.structure?.hasDocumentation || false,
          has_ci: repoData.structure?.hasCI || false,
          config_files_count: repoData.structure?.configFiles?.length || 0
        }),
      });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Repository already exists, return existing repository
          console.log('Repository already exists in database');
          return result.repository;
        }
        throw new Error(result.error || 'Failed to save repository');
      }

      console.log('Repository saved to database:', result.repository);
      return result.repository;
    } catch (error) {
      console.error('Error saving repository:', error);
      showNotification(`Failed to save repository: ${error.message}`, 'error');
      throw error;
    }
  }, [showNotification]);

  // Analysis operations
  const saveAnalysis = useCallback(async (repositoryId, analysisData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save analysis');
      }

      console.log('Analysis saved to database:', result.analysis);
      return result.analysis;
    } catch (error) {
      console.error('Error saving analysis:', error);
      showNotification(`Failed to save analysis: ${error.message}`, 'error');
      throw error;
    }
  }, [showNotification]);

  // Get repository by full name
  const getRepositoryByName = useCallback(async (fullName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/search?q=${encodeURIComponent(fullName)}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search repositories');
      }

      // Find exact match
      const exactMatch = result.repositories.find(repo => repo.full_name === fullName);
      return exactMatch || null;
    } catch (error) {
      console.error('Error searching repository:', error);
      return null;
    }
  }, []);

  // Get all repositories
  const getAllRepositories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch repositories');
      }

      return result.repositories;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      showNotification(`Failed to fetch repositories: ${error.message}`, 'error');
      return [];
    }
  }, [showNotification]);

  // Get repository with all analyses
  const getRepositoryWithAnalyses = useCallback(async (repositoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch repository');
      }

      return result.repository;
    } catch (error) {
      console.error('Error fetching repository:', error);
      showNotification(`Failed to fetch repository: ${error.message}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Get analyses for a repository
  const getAnalyses = useCallback(async (repositoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/analyses`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analyses');
      }

      return result.analyses;
    } catch (error) {
      console.error('Error fetching analyses:', error);
      showNotification(`Failed to fetch analyses: ${error.message}`, 'error');
      return [];
    }
  }, [showNotification]);

  // Save automation entry
  const saveAutomationEntry = useCallback(async (repositoryId, entryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/automation-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save automation entry');
      }

      console.log('Automation entry saved to database:', result.automation_entry);
      return result.automation_entry;
    } catch (error) {
      console.error('Error saving automation entry:', error);
      showNotification(`Failed to save automation entry: ${error.message}`, 'error');
      throw error;
    }
  }, [showNotification]);

  // Get automation entries for a repository
  const getAutomationEntries = useCallback(async (repositoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/repositories/${repositoryId}/automation-entries`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch automation entries');
      }

      return result.automation_entries;
    } catch (error) {
      console.error('Error fetching automation entries:', error);
      showNotification(`Failed to fetch automation entries: ${error.message}`, 'error');
      return [];
    }
  }, [showNotification]);

  // Get statistics
  const getStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed (${response.status}): ${errorText}`);
        }
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch statistics');
      }

      return result.statistics;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showNotification(`Failed to fetch statistics: ${error.message}`, 'error');
      return null;
    }
  }, [showNotification]);

  // Check if recent analysis exists in database
  const hasRecentAnalysisInDB = useCallback(async (repositoryId, maxAgeHours = 24) => {
    try {
      const analyses = await getAnalyses(repositoryId);
      if (analyses.length === 0) return null;

      const latestAnalysis = analyses[0]; // Already sorted by created_at desc
      const analysisAge = Date.now() - new Date(latestAnalysis.created_at).getTime();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds

      if (analysisAge < maxAge) {
        return latestAnalysis;
      }

      return null;
    } catch (error) {
      console.error('Error checking recent analysis:', error);
      return null;
    }
  }, [getAnalyses]);

  return {
    saveRepository,
    saveAnalysis,
    getRepositoryByName,
    getAllRepositories,
    getRepositoryWithAnalyses,
    getAnalyses,
    saveAutomationEntry,
    getAutomationEntries,
    getStatistics,
    hasRecentAnalysisInDB
  };
};

