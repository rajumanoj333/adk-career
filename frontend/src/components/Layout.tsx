import { NavLink, Outlet } from 'react-router-dom';
import { House, UserRoundPlus, ClipboardList, Brain, Map, School, LayoutDashboard, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/cn';

const links = [
  { to: '/', label: 'Home', icon: House, requiresUser: false },
  { to: '/onboarding', label: 'Onboarding', icon: UserRoundPlus, requiresUser: false },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList, requiresUser: true },
  { to: '/analysis', label: 'Analysis', icon: Brain, requiresUser: true },
  { to: '/roadmap', label: 'Roadmap', icon: Map, requiresUser: true },
  { to: '/colleges', label: 'Colleges', icon: School, requiresUser: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresUser: true },
];

export function Layout() {
  const { session } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[13px] uppercase tracking-[0.12em] text-primary-600">ADK Career Planner</p>
            <h1 className="text-xl font-semibold text-slate-900">Guided flow from onboarding to roadmap</h1>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <User size={16} className="text-slate-500" />
            {session.userId ? (
              <div>
                <p className="font-medium text-slate-900">{session.userName || 'Active user'}</p>
                <p className="text-[13px] text-slate-600">
                  ID #{session.userId} {session.userEmail ? `• ${session.userEmail}` : ''}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-slate-900">No active user</p>
                <p className="text-[13px] text-slate-600">Start at onboarding to create one.</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 p-4 md:grid-cols-[260px_1fr]">
        <aside className="self-start rounded-xl border bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon, requiresUser }) => {
              const locked = requiresUser && !session.userId;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                      locked ? 'cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-100',
                      isActive && !locked ? 'bg-primary-50 text-primary-700 shadow-sm' : '',
                    )
                  }
                  aria-disabled={locked}
                  onClick={(event) => {
                    if (locked) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {locked ? <span className="text-[11px] font-medium text-slate-400">Start first</span> : null}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-xl border bg-white p-4 shadow-sm md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
