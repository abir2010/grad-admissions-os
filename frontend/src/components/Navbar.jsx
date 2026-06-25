import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileEdit,
  FileText,
  GraduationCap,
  HandCoins,
  LogOut,
  MailCheck,
  Timeline,
  UsersRound,
} from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/professors', label: 'Pipeline', icon: GraduationCap },
  { to: '/documents', label: 'Docs', icon: FileText },
  { to: '/drafts', label: 'Drafts', icon: FileEdit },
  { to: '/coordinators', label: 'Coordinators', icon: UsersRound },
  { to: '/requirements', label: 'Checklist', icon: CheckSquare },
  { to: '/timeline', label: 'Timeline', icon: Timeline },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/lor-tracker', label: 'LOR', icon: MailCheck },
  { to: '/financials', label: 'Funding', icon: HandCoins },
];

function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Graduate Admissions OS
          </p>
          <h1 className="text-lg font-semibold text-slate-950">
            Application Command Center
          </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <GlobalSearch />
            <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="max-w-32 truncate font-medium text-slate-700">{user?.name || user?.email}</span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
