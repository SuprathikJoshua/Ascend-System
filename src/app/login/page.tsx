'use client';

import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? 'Too many attempts. Try again in a minute.' : 'Password was not accepted.');
        return;
      }
      window.location.assign('/');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-5 rounded-2xl border border-gray-800 p-6">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <LockKeyhole size={20} />
          </div>
          <h1 className="text-xl font-semibold text-gray-100">Prep Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Enter your password to continue.</p>
        </div>
        <label className="block text-sm text-gray-300">
          Password
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            autoFocus
            className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-gray-100 outline-none focus:border-violet-500"
          />
        </label>
        {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        <button disabled={submitting || !password} className="min-h-11 w-full rounded-lg bg-violet-600 px-4 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50">
          {submitting ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
