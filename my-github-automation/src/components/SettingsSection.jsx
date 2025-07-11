import React from 'react';
import { Settings, Shield, Zap, FileText, CheckCircle, Code, Target } from 'lucide-react';

const SettingsSection = ({ config, setConfig }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <section className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-3xl font-semibold text-blue-300 mb-6 flex items-center"><Settings className="mr-3" /> Automation Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">General Automation</h3>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="autoBugFix"
                checked={config.autoBugFix}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Auto Bug Fix <Zap className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="autoImprovement"
                checked={config.autoImprovement}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Auto Improvement <Target className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="autoFeatures"
                checked={config.autoFeatures}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Auto Feature Development <Code className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="requireApproval"
                checked={config.requireApproval}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Require Manual Approval for Changes</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Advanced Options</h3>
          <div className="mb-4">
            <label htmlFor="maxBugsPerRun" className="block text-gray-300 text-sm font-bold mb-2">Max Bugs Per Auto-Fix Run:</label>
            <input
              type="number"
              id="maxBugsPerRun"
              name="maxBugsPerRun"
              value={config.maxBugsPerRun}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-500 text-white"
              min="1"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="maxImprovementsPerRun" className="block text-gray-300 text-sm font-bold mb-2">Max Improvements Per Auto-Implement Run:</label>
            <input
              type="number"
              id="maxImprovementsPerRun"
              name="maxImprovementsPerRun"
              value={config.maxImprovementsPerRun}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-500 text-white"
              min="1"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="codeReviewMode" className="block text-gray-300 text-sm font-bold mb-2">Code Review Mode:</label>
            <select
              id="codeReviewMode"
              name="codeReviewMode"
              value={config.codeReviewMode}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-500 text-white"
            >
              <option value="quick">Quick</option>
              <option value="thorough">Thorough</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="priorityThreshold" className="block text-gray-300 text-sm font-bold mb-2">Priority Threshold for Auto-Actions:</label>
            <select
              id="priorityThreshold"
              name="priorityThreshold"
              value={config.priorityThreshold}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-500 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis & Optimization</h3>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="enableSecurityScans"
                checked={config.enableSecurityScans}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Security Scans <Shield className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="enablePerformanceOptimization"
                checked={config.enablePerformanceOptimization}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Performance Optimization <Zap className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="enableDocumentationUpdates"
                checked={config.enableDocumentationUpdates}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Documentation Updates <FileText className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="autoTestGeneration"
                checked={config.autoTestGeneration}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-300">Enable Auto Test Generation <CheckCircle className="inline-block ml-1" size={16} /></span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;

