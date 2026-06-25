'use client';

import { useState } from 'react';

export default function Home() {
  const [diff, setDiff] = useState('');
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diff.trim()) return;

    setLoading(true);
    setError('');
    setCommitMessage('');

    try {
      const res = await fetch('/api/generate-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      setCommitMessage(data.commitMessage);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!commitMessage) return;
    await navigator.clipboard.writeText(commitMessage);
    // Optional: add a toast/feedback
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-2">
          AI Commit Message Generator
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Paste your git diff – get a Conventional Commit message in seconds.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="diff" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Git Diff
            </label>
            <textarea
              id="diff"
              rows={8}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 font-mono text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste your git diff here..."
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !diff.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {loading ? 'Generating...' : 'Generate Commit Message'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {commitMessage && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Generated Commit Message</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">
              {commitMessage}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-600 rounded-md shadow hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
              aria-label="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}