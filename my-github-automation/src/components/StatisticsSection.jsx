import React from 'react';
import { Activity, Bug, Lightbulb, Star, Clock, GitPullRequest } from 'lucide-react';

const StatisticsSection = ({ stats }) => {
  return (
    <section className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-3xl font-semibold text-blue-300 mb-6 flex items-center"><Activity className="mr-3" /> Automation Statistics</h2>

      {!stats ? (
        <p className="text-gray-400">No statistics available yet. Run some automation tasks to see data here.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Total Actions:</span>
            <span className="text-blue-400 font-bold text-2xl">{stats.totalActions}</span>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Bug Fixes:</span>
            <span className="text-red-400 font-bold text-2xl"><Bug className="inline-block mr-2" />{stats.bugsFixes}</span>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Improvements:</span>
            <span className="text-yellow-400 font-bold text-2xl"><Lightbulb className="inline-block mr-2" />{stats.improvements}</span>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Features Developed:</span>
            <span className="text-purple-400 font-bold text-2xl"><Star className="inline-block mr-2" />{stats.features}</span>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Analyses Performed:</span>
            <span className="text-green-400 font-bold text-2xl"><Clock className="inline-block mr-2" />{stats.analyses}</span>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg flex items-center justify-between">
            <span className="text-gray-300">Actions Last Week:</span>
            <span className="text-teal-400 font-bold text-2xl"><GitPullRequest className="inline-block mr-2" />{stats.lastWeek}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default StatisticsSection;

