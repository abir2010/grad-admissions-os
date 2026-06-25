import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { globalSearch } from '../api/admissionsApi.js';

const routeFor = (type, item) => {
  if (type === 'universities') return `/universities/${item._id}`;
  if (type === 'professors') return `/professors/${item._id}`;
  if (type === 'documents') return '/documents';
  if (type === 'recommenders') return '/lor-tracker';
  if (type === 'sopDrafts' || type === 'emailDrafts') return '/drafts';
  if (type === 'coordinators') return '/coordinators';
  if (type === 'reminders') return '/calendar';
  if (type === 'requirements') return '/requirements';
  if (type === 'lorStatuses') return '/lor-tracker';
  return '/dashboard';
};

const labelFor = (type, item) =>
  item.name || item.title || item.subject || item.email || item.recommenderId?.name || type;

const groupLabels = {
  universities: 'Universities',
  professors: 'Professors',
  documents: 'Documents',
  recommenders: 'Recommenders',
  sopDrafts: 'SOP Drafts',
  emailDrafts: 'Email Drafts',
  coordinators: 'Coordinators',
  reminders: 'Reminders',
  requirements: 'Requirements',
  lorStatuses: 'LOR',
};

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query.trim());
        setResults(data.results || data);
        setOpen(true);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const groups = results
    ? Object.entries(results).filter(([, items]) => Array.isArray(items) && items.length)
    : [];

  return (
    <div ref={searchRef} className="relative w-full lg:max-w-sm">
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={16} className="text-slate-400" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search universities, professors, drafts..."
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          {loading ? <p className="text-sm text-slate-500">Searching...</p> : null}
          {!loading && groups.length === 0 ? (
            <p className="text-sm text-slate-500">No matches found.</p>
          ) : null}
          <div className="space-y-4">
            {groups.map(([type, items]) => (
              <section key={type}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {groupLabels[type] || type}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item._id}
                      to={routeFor(type, item)}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    >
                      <span className="font-semibold">{labelFor(type, item)}</span>
                      {item.universityId?.name ? (
                        <span className="ml-2 text-xs text-slate-500">{item.universityId.name}</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GlobalSearch;
