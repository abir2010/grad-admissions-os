function PageState({ loading, error, children }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur"
          >
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="mt-6 h-8 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 h-3 w-full rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return children;
}

export default PageState;
