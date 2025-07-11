import React from 'react';
import { Code, Bug, Lightbulb, GitBranch, CheckCircle, AlertTriangle, Play, Zap, Target, FileText, Star, Shield } from 'lucide-react';

const AnalysisSection = ({
  repoUrl,
  setRepoUrl,
  githubToken,
  setGithubToken,
  isProcessing,
  processingMessage,
  analysisResults,
  analyzeRepository,
  executeBugFix,
  executeImprovement,
  developFeature,
  executeBulkBugFixes,
  executeBulkImprovements,
  automationConfig
}) => {
  return (
    <section className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-3xl font-semibold text-blue-300 mb-6 flex items-center"><Code className="mr-3" /> Repository Analysis & Automation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="repoUrl" className="block text-gray-300 text-sm font-bold mb-2">GitHub Repository URL:</label>
          <input
            type="text"
            id="repoUrl"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            placeholder="e.g., https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div>
          <label htmlFor="githubToken" className="block text-gray-300 text-sm font-bold mb-2">GitHub Personal Access Token:</label>
          <input
            type="password"
            id="githubToken"
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            placeholder="Required for private repos and higher rate limits"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => {
            console.log('Start Comprehensive Analysis button clicked');
            analyzeRepository();
          }}
          disabled={isProcessing || !repoUrl || !githubToken}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="inline-block mr-2" size={20} />
          {isProcessing ? processingMessage : 'Start Comprehensive Analysis'}
        </button>
        {analysisResults && automationConfig.autoBugFix && analysisResults.bugs_detected?.length > 0 && (
          <button
            onClick={() => {
              console.log('Auto-Fix Critical Bugs button clicked');
              executeBulkBugFixes();
            }}
            disabled={isProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bug className="inline-block mr-2" size={20} />
            Auto-Fix Critical Bugs ({analysisResults.bugs_detected.filter(b => b.severity === 'critical' || b.severity === 'high').length})
          </button>
        )}
        {analysisResults && automationConfig.autoImprovement && analysisResults.improvements_suggested?.length > 0 && (
          <button
            onClick={() => {
              console.log('Auto-Implement Improvements button clicked');
              executeBulkImprovements();
            }}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="inline-block mr-2" size={20} />
            Auto-Implement Improvements ({analysisResults.improvements_suggested.filter(i => i.priority === 'critical' || i.priority === 'high').length})
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="bg-blue-900 text-white p-4 rounded-lg mb-6 text-center font-semibold">
          {processingMessage}
        </div>
      )}

      {analysisResults && (
        <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold text-blue-200 mb-4">Analysis Results:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Overall Health Score:</span>
              <span className="text-green-400 font-bold text-xl">{analysisResults.overall_health_score}%</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Bugs Detected:</span>
              <span className="text-red-400 font-bold text-xl">{analysisResults.bugs_detected?.length || 0}</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Improvements Suggested:</span>
              <span className="text-yellow-400 font-bold text-xl">{analysisResults.improvements_suggested?.length || 0}</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Feature Ideas:</span>
              <span className="text-purple-400 font-bold text-xl">{analysisResults.feature_ideas?.length || 0}</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Security Concerns:</span>
              <span className="text-orange-400 font-bold text-xl">{analysisResults.security_concerns?.length || 0}</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
              <span className="text-gray-300">Documentation Gaps:</span>
              <span className="text-teal-400 font-bold text-xl">{analysisResults.documentation_gaps?.length || 0}</span>
            </div>
          </div>

          {analysisResults.architecture_analysis && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-blue-300 mb-2 flex items-center"><GitBranch className="mr-2" size={20} /> Architecture Analysis:</h4>
              <p className="text-gray-300 bg-gray-800 p-4 rounded-md whitespace-pre-wrap">{analysisResults.architecture_analysis}</p>
            </div>
          )}

          {analysisResults.bugs_detected?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-red-300 mb-2 flex items-center"><Bug className="mr-2" size={20} /> Detected Bugs:</h4>
              <div className="space-y-4">
                {analysisResults.bugs_detected.map((bug, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-red-700">
                    <p className="text-lg font-medium text-red-200">{bug.description}</p>
                    <p className="text-sm text-gray-400">Severity: <span className={`font-bold ${bug.severity === 'critical' ? 'text-red-500' : bug.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>{bug.severity}</span></p>
                    <p className="text-sm text-gray-400">File: {bug.file} (Line: {bug.line})</p>
                    <p className="text-sm text-gray-400">Solution: {bug.solution}</p>
                    <button
                      onClick={() => {
                        console.log(`Fix This Bug button clicked for bug: ${bug.id}`);
                        executeBugFix(bug);
                      }}
                      disabled={isProcessing}
                      className="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Zap className="inline-block mr-1" size={16} /> Fix This Bug
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.improvements_suggested?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-yellow-300 mb-2 flex items-center"><Lightbulb className="mr-2" size={20} /> Suggested Improvements:</h4>
              <div className="space-y-4">
                {analysisResults.improvements_suggested.map((imp, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-yellow-700">
                    <p className="text-lg font-medium text-yellow-200">{imp.description}</p>
                    <p className="text-sm text-gray-400">Priority: <span className={`font-bold ${imp.priority === 'critical' ? 'text-red-500' : imp.priority === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>{imp.priority}</span></p>
                    <p className="text-sm text-gray-400">Effort: {imp.effort}</p>
                    <button
                      onClick={() => {
                        console.log(`Implement Improvement button clicked for improvement: ${imp.id}`);
                        executeImprovement(imp);
                      }}
                      disabled={isProcessing}
                      className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Target className="inline-block mr-1" size={16} /> Implement Improvement
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.feature_ideas?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-purple-300 mb-2 flex items-center"><Star className="mr-2" size={20} /> Feature Ideas:</h4>
              <div className="space-y-4">
                {analysisResults.feature_ideas.map((feature, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-purple-700">
                    <p className="text-lg font-medium text-purple-200">{feature.name}</p>
                    <p className="text-sm text-gray-400">Description: {feature.description}</p>
                    <p className="text-sm text-gray-400">Complexity: {feature.complexity} | Priority: {feature.priority}</p>
                    <button
                      onClick={() => {
                        console.log(`Develop Feature button clicked for feature: ${feature.id}`);
                        developFeature(feature);
                      }}
                      disabled={isProcessing}
                      className="mt-3 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <GitBranch className="inline-block mr-1" size={16} /> Develop Feature
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.security_concerns?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-orange-300 mb-2 flex items-center"><Shield className="mr-2" size={20} /> Security Concerns:</h4>
              <div className="space-y-4">
                {analysisResults.security_concerns.map((concern, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-orange-700">
                    <p className="text-lg font-medium text-orange-200">{concern.description}</p>
                    <p className="text-sm text-gray-400">Severity: <span className={`font-bold ${concern.severity === 'critical' ? 'text-red-500' : concern.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>{concern.severity}</span></p>
                    <p className="text-sm text-gray-400">CWE ID: {concern.cwe_id}</p>
                    <p className="text-sm text-gray-400">Mitigation: {concern.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.performance_issues?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-teal-300 mb-2 flex items-center"><Zap className="mr-2" size={20} /> Performance Issues:</h4>
              <div className="space-y-4">
                {analysisResults.performance_issues.map((issue, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-teal-700">
                    <p className="text-lg font-medium text-teal-200">{issue.description}</p>
                    <p className="text-sm text-gray-400">Impact: {issue.impact}</p>
                    <p className="text-sm text-gray-400">Optimization: {issue.optimization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.documentation_gaps?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-indigo-300 mb-2 flex items-center"><FileText className="mr-2" size={20} /> Documentation Gaps:</h4>
              <div className="space-y-4">
                {analysisResults.documentation_gaps.map((gap, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md border border-indigo-700">
                    <p className="text-lg font-medium text-indigo-200">{gap.description}</p>
                    <p className="text-sm text-gray-400">Priority: {gap.priority}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResults.test_coverage_analysis && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-green-300 mb-2 flex items-center"><CheckCircle className="mr-2" size={20} /> Test Coverage Analysis:</h4>
              <div className="bg-gray-800 p-4 rounded-md">
                <p className="text-gray-300">Estimated Coverage: {analysisResults.test_coverage_analysis.estimated_coverage}</p>
                {analysisResults.test_coverage_analysis.missing_tests?.length > 0 && (
                  <p className="text-gray-300">Missing Tests: {analysisResults.test_coverage_analysis.missing_tests.join(', ')}</p>
                )}
                <p className="text-gray-300">Test Quality: {analysisResults.test_coverage_analysis.test_quality}</p>
              </div>
            </div>
          )}

          {analysisResults.code_quality_metrics && (
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-blue-300 mb-2 flex items-center"><AlertTriangle className="mr-2" size={20} /> Code Quality Metrics:</h4>
              <div className="bg-gray-800 p-4 rounded-md grid grid-cols-2 gap-2">
                <p className="text-gray-300">Maintainability: <span className="font-bold">{analysisResults.code_quality_metrics.maintainability}</span></p>
                <p className="text-gray-300">Readability: <span className="font-bold">{analysisResults.code_quality_metrics.readability}</span></p>
                <p className="text-gray-300">Complexity: <span className="font-bold">{analysisResults.code_quality_metrics.complexity}</span></p>
                <p className="text-gray-300">Duplication: <span className="font-bold">{analysisResults.code_quality_metrics.duplication}</span></p>
              </div>
            </div>
          )}

          {analysisResults.recommendations && (
            <div>
              <h4 className="text-xl font-semibold text-gray-300 mb-2 flex items-center"><Lightbulb className="mr-2" size={20} /> Recommendations:</h4>
              <div className="space-y-4">
                {analysisResults.recommendations.immediate_actions?.length > 0 && (
                  <div className="bg-gray-800 p-4 rounded-md border border-red-600">
                    <p className="text-lg font-medium text-red-200 mb-2">Immediate Actions:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {analysisResults.recommendations.immediate_actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysisResults.recommendations.short_term?.length > 0 && (
                  <div className="bg-gray-800 p-4 rounded-md border border-yellow-600">
                    <p className="text-lg font-medium text-yellow-200 mb-2">Short-Term Actions:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {analysisResults.recommendations.short_term.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysisResults.recommendations.long_term?.length > 0 && (
                  <div className="bg-gray-800 p-4 rounded-md border border-green-600">
                    <p className="text-lg font-medium text-green-200 mb-2">Long-Term Actions:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {analysisResults.recommendations.long_term.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AnalysisSection;

