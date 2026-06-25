function DetailDialog({ isOpen, title, eyebrow, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 p-5">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p> : null}
          <div className="mt-1 flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-950 hover:text-slate-950"
            >
              Close
            </button>
          </div>
        </div>
        <div className="max-h-[68vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default DetailDialog;
