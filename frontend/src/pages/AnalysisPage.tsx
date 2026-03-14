import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { AnalysisResponse, ApiError } from '../types/api';

export function AnalysisPage() {
  const navigate = useNavigate();
  const { session } = useApp();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!session.userId) {
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getAnalysis(session.userId);
        setAnalysis(response);
      } catch (err) {
        setError((err as ApiError).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [session.userId]);

  const topCareerMatches = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return Object.entries(analysis.career_matches).slice(0, 5);
  }, [analysis]);

  if (!session.userId) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">No user session detected.</p>
        <p className="text-sm text-slate-600">Complete onboarding and assessment first to view analysis.</p>
        <Link to="/onboarding" className="mt-3 inline-flex rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white">
          Go to onboarding
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading analysis...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Personality analysis</h2>
        <p className="text-sm text-slate-600">Results calculated from your RIASEC assessment.</p>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {analysis ? (
        <>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-slate-600">Profile</p>
                <p className="text-lg font-semibold text-slate-900">{analysis.personality_profile}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!session.userId) return;
                  setRefreshing(true);
                  setError(null);
                  try {
                    const data = await api.runAnalysis(session.userId);
                    setAnalysis(data);
                  } catch (err) {
                    setError((err as ApiError).message);
                  } finally {
                    setRefreshing(false);
                  }
                }}
                disabled={refreshing}
                className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                {refreshing ? 'Re-running...' : 'Re-run analysis'}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-700">{analysis.analysis_text}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 md:col-span-2">
              <h3 className="font-semibold">RIASEC scores</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(analysis.riasec_scores).map(([key, value]) => (
                  <li key={key} className="flex justify-between rounded bg-slate-50 px-3 py-2">
                    <span className="font-medium text-slate-800">{key}</span>
                    <span className="text-slate-900">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Top career matches</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {topCareerMatches.map(([career, score]) => (
                  <li key={career} className="flex items-center justify-between rounded bg-primary-50 px-3 py-2">
                    <span className="font-medium text-slate-900">{career}</span>
                    <span className="text-primary-700">{score}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
            >
              Continue to roadmap generation
            </button>
            <p className="text-sm text-slate-600">Next we’ll call ADK to build your personalized roadmap.</p>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-sm text-slate-600">
          No analysis yet. Submit the assessment to generate insights.
        </div>
      )}
    </div>
  );
}
