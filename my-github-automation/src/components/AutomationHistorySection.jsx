import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AutomationHistorySection = ({ history }) => {
  return (
    <section className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
      <h2 className="text-3xl font-semibold text-blue-300 mb-6 flex items-center"><Clock className="mr-3" /> Automation History</h2>

      {history.length === 0 ? (
        <p className="text-gray-400">No automation history yet. Start analyzing repositories to see actions here.</p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="bg-gray-700 p-4 rounded-lg shadow-md flex items-start space-x-4">
              <div className="flex-shrink-0">
                {entry.status === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
              <div className="flex-grow">
                <p className="text-lg font-semibold text-white">{entry.details}</p>
                <p className="text-sm text-gray-400">Repo: {entry.repo} | Action: {entry.action.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-400">Timestamp: {new Date(entry.timestamp).toLocaleString()}</p>
                {entry.branch && <p className="text-sm text-gray-400">Branch: <span className="font-mono bg-gray-600 px-2 py-1 rounded text-xs">{entry.branch}</span></p>}
                {entry.pr_title && <p className="text-sm text-gray-400">PR: {entry.pr_title}</p>}
                {entry.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(entry.metadata).map(([key, value]) => (
                      <span key={key} className="mr-3">{key}: {JSON.stringify(value)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AutomationHistorySection;

