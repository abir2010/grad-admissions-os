import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GraduationCap, GripVertical, Plus, Trash2 } from 'lucide-react';
import {
  createProfessor,
  deleteProfessor,
  listDocuments,
  listProfessors,
  listUniversities,
  updateProfessor,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const columns = ['Shortlisted', 'Cold Emailed', 'Replied', 'Interviewing', 'Applied'];
const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';
const labelClass = 'space-y-1 text-sm font-medium text-slate-700';

const emptyProfessor = {
  name: '',
  email: '',
  universityId: '',
  researchArea: '',
  outreachStatus: 'Shortlisted',
  lastContactedDate: '',
  assignedSopId: '',
  interviewNotes: '',
};

function ProfessorCard({ professor, documents, onStatusChange, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: professor._id,
  });
  const style = { transform: CSS.Translate.toString(transform) };
  const assignedSop =
    professor.assignedSopId?.title ||
    documents.find((doc) => doc._id === professor.assignedSopId)?.title ||
    'Not assigned';

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Drag ${professor.name}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={15} />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            to={`/professors/${professor._id}`}
            className="block truncate font-semibold text-slate-950 hover:underline"
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {professor.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
            {professor.researchArea || 'Research area not set'}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{professor.email}</p>
        </div>
      </div>

      <dl className="mt-3 space-y-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        <div>
          <dt className="font-semibold text-slate-500">University</dt>
          <dd className="mt-0.5 text-slate-700">{professor.universityId?.name || 'No university assigned'}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">SOP</dt>
          <dd className="mt-0.5 text-slate-700">{assignedSop}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Last contact</dt>
          <dd className="mt-0.5 text-slate-700">{formatDate(professor.lastContactedDate)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={professor.outreachStatus}
          onChange={(event) => onStatusChange(professor._id, event.target.value)}
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          {columns.map((column) => (
            <option key={column}>{column}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(professor._id)}
          className="rounded-md border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
          aria-label={`Delete ${professor.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {professor.interviewNotes ? (
        <p className="mt-3 line-clamp-3 rounded-md border border-slate-100 bg-white p-2 text-xs leading-5 text-slate-600">
          {professor.interviewNotes}
        </p>
      ) : null}
    </article>
  );
}

function PipelineColumn({ column, professors, documents, onStatusChange, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-lg border p-3 shadow-sm transition sm:p-4 lg:min-h-[32rem] ${
        isOver ? 'border-slate-950 bg-slate-100' : 'border-slate-200 bg-white/85'
      }`}
    >
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{column}</h3>
        <StatusBadge>{professors.length}</StatusBadge>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {professors.map((professor) => (
          <ProfessorCard
            key={professor._id}
            professor={professor}
            documents={documents}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {!professors.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-3 text-center text-sm text-slate-500 sm:p-4">
            No professors here yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProfessorPipeline() {
  const [professors, setProfessors] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyProfessor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadData = async () => {
    const [professorItems, universityItems, documentItems] = await Promise.all([
      listProfessors(),
      listUniversities(),
      listDocuments(),
    ]);
    setProfessors(professorItems);
    setUniversities(universityItems);
    setDocuments(documentItems);
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createProfessor({
        ...form,
        universityId: form.universityId || undefined,
        assignedSopId: form.assignedSopId || undefined,
        lastContactedDate: form.lastContactedDate || undefined,
      });
      setForm(emptyProfessor);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, outreachStatus) => {
    setProfessors((current) =>
      current.map((professor) => (professor._id === id ? { ...professor, outreachStatus } : professor))
    );
    await updateProfessor(id, { outreachStatus });
    await loadData();
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || !columns.includes(over.id)) return;
    const professor = professors.find((item) => item._id === active.id);
    if (!professor || professor.outreachStatus === over.id) return;
    await handleStatusChange(active.id, over.id);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteProfessor(pendingDelete.id);
    setPendingDelete(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-950 p-2 text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Professor Pipeline</h2>
            <p className="mt-1 text-sm text-slate-600">
              Track faculty outreach, SOP fit, interview notes, and application movement.
            </p>
          </div>
        </div>
      </div>

      <PageState loading={loading} error={error}>
        <Card title="Add Professor Lead">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <label className={labelClass}>
                Professor name
                <input required name="name" value={form.name} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Email
                <input required type="email" name="email" value={form.email} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                University
                <select name="universityId" value={form.universityId} onChange={handleChange} className={fieldClass}>
                  <option value="">Assign university</option>
                  {universities.map((university) => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                SOP / document
                <select name="assignedSopId" value={form.assignedSopId} onChange={handleChange} className={fieldClass}>
                  <option value="">Assign document</option>
                  {documents.map((document) => (
                    <option key={document._id} value={document._id}>
                      {document.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${labelClass} lg:col-span-2`}>
                Research area
                <input name="researchArea" value={form.researchArea} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Outreach status
                <select name="outreachStatus" value={form.outreachStatus} onChange={handleChange} className={fieldClass}>
                  {columns.map((column) => (
                    <option key={column}>{column}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Last contacted
                <input type="date" name="lastContactedDate" value={form.lastContactedDate} onChange={handleChange} className={fieldClass} />
              </label>
            </div>
            <label className={labelClass}>
              Notes
              <textarea
                name="interviewNotes"
                value={form.interviewNotes}
                onChange={handleChange}
                rows="3"
                className={fieldClass}
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Adding...' : 'Add Professor'}
            </button>
          </form>
        </Card>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="pb-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {columns.map((column) => (
                <PipelineColumn
                  key={column}
                  column={column}
                  professors={professors.filter((professor) => professor.outreachStatus === column)}
                documents={documents}
                onStatusChange={handleStatusChange}
                onDelete={(id) => {
                  const professor = professors.find((item) => item._id === id);
                  setPendingDelete({ id, label: professor?.name || 'this professor' });
                }}
              />
              ))}
            </div>
          </div>
        </DndContext>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete professor?"
        message={`This will permanently delete "${pendingDelete?.label}" from your outreach pipeline.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default ProfessorPipeline;
