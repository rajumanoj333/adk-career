import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { ApiError } from '../types/api';

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
}

export function RoadmapPage() {
  const { session } = useApp();
  const [roadmap, setRoadmap] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadSaved = async () => {
    if (!session.userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.getSavedRoadmap(session.userId);
      setRoadmap(response.roadmap);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status !== 404) {
        setError(apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSaved();
  }, [session.userId]);

  const generate = async () => {
    if (!session.userId) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await api.generateRoadmap({ user_id: session.userId, force_regenerate: false });
      setRoadmap(response.roadmap);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setGenerating(false);
    }
  };

  const phases = useMemo(() => asArray(roadmap?.phases), [roadmap]);
  const milestones = useMemo(() => asArray(roadmap?.milestones), [roadmap]);
  const colleges = useMemo(() => asArray(roadmap?.colleges), [roadmap]);

  if (!session.userId) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">No user session detected.</p>
        <p className="text-sm text-slate-600">Onboard and run analysis before generating a roadmap.</p>
        <Link to="/onboarding" className="mt-3 inline-flex rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white">
          Go to onboarding
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading saved roadmap...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Career roadmap</h2>
          <p className="text-sm text-slate-600">Generate or fetch ADK roadmap and college recommendations.</p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? 'Generating...' : roadmap ? 'Regenerate roadmap' : 'Generate roadmap'}
        </button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {!roadmap ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-slate-600">
          No roadmap found yet. Generate one to fetch phases, milestones, and colleges.
        </div>
      ) : null}

      {roadmap ? (
        <>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-slate-600">Target specialization</p>
            <p className="text-lg font-semibold text-slate-900">{String(roadmap.target_specialization || 'Not specified')}</p>
            {roadmap.generated_at ? (
              <p className="mt-1 text-xs text-slate-500">Generated at {String(roadmap.generated_at)}</p>
            ) : null}
          </div>

          <section className="space-y-2">
            <h3 className="font-semibold">Roadmap phases</h3>
            {phases.length === 0 ? <p className="text-sm text-slate-600">No phases returned.</p> : null}
            {phases.map((phase, index) => (
              <div key={index} className="rounded-lg border p-3">
                <p className="font-medium">{String(phase.title || phase.phase || `Phase ${index + 1}`)}</p>
                <p className="text-sm text-slate-600">{String(phase.duration || '')}</p>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Milestones</h3>
            {milestones.length === 0 ? <p className="text-sm text-slate-600">No milestones returned.</p> : null}
            {milestones.map((milestone, index) => (
              <div key={index} className="rounded-lg border p-3 text-sm text-slate-700">
                {String(milestone.title || milestone.milestone || JSON.stringify(milestone))}
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">Recommended colleges</h3>
            {colleges.length === 0 ? <p className="text-sm text-slate-600">No colleges in roadmap payload.</p> : null}
            {colleges.map((college, index) => (
              <div key={index} className="rounded-lg border p-3">
                <p className="font-medium">{String(college.name || college.NAME || `College ${index + 1}`)}</p>
                <p className="text-sm text-slate-600">{String(college.location || college.DISTRICT || 'Location unavailable')}</p>
              </div>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}
