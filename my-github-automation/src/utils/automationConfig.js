// automationConfig.js
export const DEFAULT_AUTOMATION_CONFIG = {
  // Rate limiting
  maxIssuesPerRun: 3,
  maxImprovementsPerRun: 5,
  maxFilesPerAnalysis: 10,
  maxFileSize: 1000000, // 1MB
  
  // API configuration
  rateLimitBuffer: 100, // Keep 100 requests in reserve
  requestDelay: 1000, // 1 second between requests
  
  // Analysis settings
  analysisDepth: 'medium', // 'light', 'medium', 'deep'
  enableAIAnalysis: true,
  aiModel: 'gpt-4o-mini',
  
  // Automation features
  autoCreateIssues: true,
  autoCreatePRs: false,
  autoMergeEnabled: false,
  
  // File type filters
  analyzeFileTypes: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs'],
  ignorePatterns: ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache'],
  
  // Security settings
  securityCheckEnabled: true,
  performanceCheckEnabled: true,
  maintainabilityCheckEnabled: true,
  
  // Notification settings
  notificationLevel: 'info', // 'error', 'warning', 'info', 'success'
  enableEmailNotifications: false,
  
  // Reporting
  generateReports: true,
  reportFormat: 'markdown', // 'json', 'markdown', 'html'
  
  // Testing
  runTestsAfterAnalysis: false,
  testFrameworks: ['jest', 'mocha', 'pytest'],
  
  // Branch management
  defaultBranch: 'main',
  createFeatureBranches: true,
  branchPrefix: 'auto-fix-',
  
  // Commit settings
  commitMessageTemplate: 'Auto-fix: {description}',
  signCommits: false
};

// Configuration validator
export const validateConfig = (config) => {
  const errors = [];
  
  if (config.maxIssuesPerRun < 1 || config.maxIssuesPerRun > 10) {
    errors.push('maxIssuesPerRun must be between 1 and 10');
  }
  
  if (config.maxImprovementsPerRun < 1 || config.maxImprovementsPerRun > 20) {
    errors.push('maxImprovementsPerRun must be between 1 and 20');
  }
  
  if (!['light', 'medium', 'deep'].includes(config.analysisDepth)) {
    errors.push('analysisDepth must be light, medium, or deep');
  }
  
  if (!['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'].includes(config.aiModel)) {
    errors.push('aiModel must be a supported OpenAI model');
  }
  
  return errors;
};

// Testing utilities
export const TestRunner = {
  // Run Jest tests
  runJestTests: async (projectPath) => {
    try {
      // In a real implementation, this would execute Jest
      console.log('Running Jest tests...');
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        passed: 25,
        failed: 2,
        coverage: 78.5,
        duration: 2.1
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Run Python tests
  runPythonTests: async (projectPath) => {
    try {
      console.log('Running Python tests...');
      
      // Simulate pytest execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        passed: 18,
        failed: 1,
        skipped: 3,
        coverage: 85.2,
        duration: 1.8
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Lint code
  lintCode: async (files, linter = 'eslint') => {
    try {
      console.log(`Running ${linter}...`);
      
      const results = [];
      
      for (const file of files) {
        // Simulate linting
        const issues = Math.floor(Math.random() * 5);
        results.push({
          file: file.path,
          issues,
          severity: issues > 2 ? 'error' : issues > 0 ? 'warning' : 'clean'
        });
      }
      
      return {
        success: true,
        totalFiles: files.length,
        totalIssues: results.reduce((sum, r) => sum + r.issues, 0),
        results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Report generator
export const ReportGenerator = {
  generateMarkdownReport: (analysisResults) => {
    const report = `# Code Analysis Report

## Summary
- **Repository**: ${analysisResults.repository?.owner}/${analysisResults.repository?.repo}
- **Analysis Date**: ${new Date(analysisResults.timestamp).toLocaleString()}
- **Files Analyzed**: ${analysisResults.summary?.total_files_analyzed || 0}
- **Issues Found**: ${analysisResults.summary?.issues_found || 0}
- **AI Suggestions**: ${analysisResults.summary?.ai_suggestions || 0}

## Security Issues
${analysisResults.structure_analysis?.issues
  .filter(issue => issue.security.length > 0)
  .map(issue => `- **${issue.fileName}**: ${issue.security.length} security issues`)
  .join('\n') || 'No security issues found'}

## Performance Issues
${analysisResults.structure_analysis?.issues
  .filter(issue => issue.performance.length > 0)
  .map(issue => `- **${issue.fileName}**: ${issue.performance.length} performance issues`)
  .join('\n') || 'No performance issues found'}

## AI Recommendations
${analysisResults.ai_analysis?.map(analysis => 
  `### ${analysis.fileName}
- **Severity**: ${analysis.severity}
- **Suggestions**: ${analysis.suggestions?.join(', ') || 'None'}`
).join('\n') || 'No AI recommendations available'}

## Next Steps
1. Address critical security issues immediately
2. Review and implement high-priority improvements
3. Consider performance optimizations
4. Schedule regular code reviews

---
*Generated by GitHub Auto-Analysis Tool*
`;
    
    return report;
  },
  
  generateJSONReport: (analysisResults) => {
    return JSON.stringify(analysisResults, null, 2);
  },
  
  generateHTMLReport: (analysisResults) => {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Code Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; }
        .issue { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0; }
        .success { background: #d4edda; border-left-color: #28a745; }
        .error { background: #f8d7da; border-left-color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Analysis Report</h1>
        <p><strong>Repository:</strong> ${analysisResults.repository?.owner}/${analysisResults.repository?.repo}</p>
        <p><strong>Date:</strong> ${new Date(analysisResults.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        <ul>
            <li>Files Analyzed: ${analysisResults.summary?.total_files_analyzed || 0}</li>
            <li>Issues Found: ${analysisResults.summary?.issues_found || 0}</li>
            <li>AI Suggestions: ${analysisResults.summary?.ai_suggestions || 0}</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>Issues</h2>
        ${analysisResults.structure_analysis?.issues.map(issue => `
            <div class="issue">
                <h3>${issue.fileName}</h3>
                <p>Security: ${issue.security.length}, Performance: ${issue.performance.length}, Maintainability: ${issue.maintainability.length}</p>
            </div>
        `).join('') || '<p>No issues found</p>'}
    </div>
</body>
</html>`;
  }
};