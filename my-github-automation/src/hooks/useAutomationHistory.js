import { useState, useCallback } from 'react';

export const useAutomationHistory = () => {
  const [automationHistory, setAutomationHistory] = useState([]);

  const addAutomationEntry = useCallback((entry) => {
    setAutomationHistory(prev => [entry, ...prev]);
  }, []);

  const getStatistics = useCallback(() => {
    if (!automationHistory.length) return null;

    const stats = {
      totalActions: automationHistory.length,
      bugsFixes: automationHistory.filter(h => h.action === 'bug_fix').length,
      improvements: automationHistory.filter(h => h.action === 'improvement').length,
      features: automationHistory.filter(h => h.action === 'feature').length,
      analyses: automationHistory.filter(h => h.action === 'comprehensive_analysis').length,
      lastWeek: automationHistory.filter(h =>
        new Date(h.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };

    return stats;
  }, [automationHistory]);

  return { automationHistory, addAutomationEntry, getStatistics };
};

