import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { ApiError } from '../types/api';

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CollegesPage() {
  const { session } = useApp();
  const [specialization, setSpecialization] = useState('AI/ML');
  const [districts, setDistricts] = useState('Hyderabad');
  const [colleges, setColleges] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  if (!session.userId) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">No user session detected.</p>
        <p className="text-sm text-slate-600">Complete onboarding to search colleges tied to your profile.</p>
        <Link to="/onboarding" className="mt-3 inline-flex rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white">
          Go to onboarding
        </Link>
      </div>
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session.userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.searchColleges({
        user_id: session.userId,
        specialization,
        districts: parseList(districts),
      });
      setColleges(response.colleges);
      setCount(response.count);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">College search</h2>
        <p className="text-sm text-slate-600">Search colleges via ADK based on specialization and district preferences.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Specialization</span>
          <input className="rounded-md border px-3 py-2" value={specialization} onChange={(event) => setSpecialization(event.target.value)} />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-medium">Districts (comma separated)</span>
          <input className="rounded-md border px-3 py-2" value={districts} onChange={(event) => setDistricts(event.target.value)} />
        </label>

        <div className="md:col-span-3">
          <button type="submit" disabled={loading} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {loading ? 'Searching...' : 'Search colleges'}
          </button>
        </div>
      </form>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex items-center justify-between text-sm text-slate-600">
        <p>{count !== null ? `${count} colleges returned` : 'Run a search to see results'}</p>
        {loading ? <p className="text-xs text-slate-500">Fetching recommendations...</p> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {colleges.map((college, index) => (
          <div key={index} className="rounded-lg border p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <p className="text-sm font-semibold text-slate-900">{String(college.name || college.NAME || `College ${index + 1}`)}</p>
            <p className="text-sm text-slate-600">
              {String(college.location || college.DISTRICT || 'Location unavailable')}
              {college.STATE ? `, ${college.STATE}` : ''}
            </p>
            {college.course || college.COURSE ? (
              <p className="text-xs text-slate-500">Course: {String(college.course || college.COURSE)}</p>
            ) : null}
          </div>
        ))}
      </div>

      {colleges.length === 0 && !loading ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-slate-600">No colleges yet. Run a search to populate this list.</div>
      ) : null}
    </div>
  );
}
