import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export function HomePage() {
  const steps = [
    ['Onboarding', '/onboarding', 'Create a user profile with your basic info.'],
    ['Assessment', '/assessment', 'Answer RIASEC to capture your preferences.'],
    ['Analysis', '/analysis', 'Review personality profile and matches.'],
    ['Roadmap', '/roadmap', 'Generate a personalized ADK roadmap.'],
    ['Colleges', '/colleges', 'Search recommended colleges and districts.'],
    ['Dashboard', '/dashboard', 'See session details and quick links.'],
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-slate-50 px-4 py-5 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-primary-600">Start here</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Complete the flow to get your roadmap</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Move through onboarding, assessment, analysis, and roadmap generation. Each step talks to the FastAPI backend and
          saves your progress.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {steps.map(([title, to, desc], index) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-3 rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
              {index + 1}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <CheckCircle2 size={16} className="text-slate-300 transition group-hover:text-primary-500" />
              </div>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
