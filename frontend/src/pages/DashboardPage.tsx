import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function DashboardPage() {
  const { session } = useApp();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-600">Track your current session and jump to any step.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Active session</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{session.userName || 'No user yet'}</p>
          <p className="text-slate-600">{session.userEmail || 'Create a user in onboarding'}</p>
          <dl className="mt-3 space-y-1">
            <div className="flex justify-between">
              <dt className="text-slate-500">User ID</dt>
              <dd className="font-medium text-slate-900">{session.userId ?? 'Not set'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-4 text-sm">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Flow</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {[
              ['/onboarding', 'Edit onboarding'],
              ['/assessment', 'Retake assessment'],
              ['/analysis', 'View analysis'],
              ['/roadmap', 'View roadmap'],
              ['/colleges', 'Search colleges'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between rounded-md border px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-50"
              >
                {label}
                <span className="text-xs text-primary-600">Open</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
