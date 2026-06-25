import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus, Save, Trash2 } from 'lucide-react';
import {
  createRequirement,
  deleteRequirement,
  listDocuments,
  listRequirements,
  listUniversities,
  updateRequirement,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate, toDateInputValue } from '../utils/format.js';

const emptyRequirement = {
  title: '',
  universityId: '',
  documentId: '',
  type: 'Other',
  status: 'Not Started',
  priority: 'Medium',
  dueDate: '',
  notes: '',
};

const requirementTypes = [
  'SOP',
  'CV',
  'Transcript',
  'IELTS',
  'LOR',
  'Essay',
  'Portfolio',
  'Application Fee',
  'Fee Waiver',
  'Funding',
  'Portal',
  'Other',
];
const statuses = ['Not Started', 'In Progress', 'Ready', 'Submitted', 'Waived', 'Not Required'];
const completeStatuses = ['Submitted', 'Waived', 'Not Required'];

const statusTone = (status) => {
  if (status === 'Submitted') return 'green';
  if (status === 'Ready') return 'blue';
  if (status === 'In Progress') return 'amber';
  if (status === 'Waived' || status === 'Not Required') return 'slate';
  return 'red';
};

const normalizeRequirement = (form) => ({
  ...form,
  universityId: form.universityId || undefined,
  documentId: form.documentId || undefined,
  dueDate: form.dueDate || undefined,
});

function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyRequirement);
  const [editingId, setEditingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [requirementItems, universityItems, documentItems] = await Promise.all([
      listRequirements(),
      listUniversities(),
      listDocuments(),
    ]);
    setRequirements(requirementItems);
    setUniversities(universityItems);
    setDocuments(documentItems);
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(
    () =>
      universities.map((university) => {
        const items = requirements.filter((item) => item.universityId?._id === university._id);
        const done = items.filter((item) => completeStatuses.includes(item.status)).length;
        return { university, items, done, total: items.length };
      }),
    [requirements, universities]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId('');
    setForm(emptyRequirement);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = normalizeRequirement(form);
      if (editingId) await updateRequirement(editingId, payload);
      else await createRequirement(payload);
      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (requirement) => {
    setEditingId(requirement._id);
    setForm({
      title: requirement.title || '',
      universityId: requirement.universityId?._id || '',
      documentId: requirement.documentId?._id || '',
      type: requirement.type || 'Other',
      status: requirement.status || 'Not Started',
      priority: requirement.priority || 'Medium',
      dueDate: toDateInputValue(requirement.dueDate),
      notes: requirement.notes || '',
    });
  };

  const setStatus = async (requirement, status) => {
    await updateRequirement(requirement._id, { status });
    await loadData();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteRequirement(pendingDelete.id);
    setPendingDelete(null);
    if (editingId === pendingDelete.id) resetForm();
    await loadData();
  };

  const completed = requirements.filter((item) => completeStatuses.includes(item.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Application Requirement Checklist</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track every required file, fee, test score, portal task, funding item, and LOR by university.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Total requirements</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{requirements.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{completed}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Open high priority</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {requirements.filter((item) => item.priority === 'High' && !completeStatuses.includes(item.status)).length}
            </p>
          </Card>
        </div>

        <Card title={editingId ? 'Edit Requirement' : 'Add Requirement'}>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-1 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">University</span>
              <select
                required
                name="universityId"
                value={form.universityId}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select university</option>
                {universities.map((university) => (
                  <option key={university._id} value={university._id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Due date</span>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                {requirementTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Priority</span>
              <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Linked document</span>
              <select name="documentId" value={form.documentId} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">No document</option>
                {documents.map((document) => (
                  <option key={document._id} value={document._id}>{document.title}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 lg:col-span-4">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2 lg:col-span-4">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {saving ? 'Saving...' : editingId ? 'Save Requirement' : 'Add Requirement'}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map(({ university, items, done, total }) => (
            <Card key={university._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{university.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {done}/{total} complete
                  </p>
                </div>
                <StatusBadge tone={total && done === total ? 'green' : 'amber'}>
                  {total ? Math.round((done / total) * 100) : 0}%
                </StatusBadge>
              </div>
              <div className="mt-4 space-y-3">
                {items.map((requirement) => (
                  <article key={requirement._id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-950">{requirement.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {requirement.type} - Due {formatDate(requirement.dueDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <StatusBadge tone={statusTone(requirement.status)}>{requirement.status}</StatusBadge>
                        <StatusBadge tone={requirement.priority === 'High' ? 'red' : 'slate'}>
                          {requirement.priority}
                        </StatusBadge>
                      </div>
                    </div>
                    {requirement.documentId ? (
                      <p className="mt-2 text-sm text-slate-600">Document: {requirement.documentId.title}</p>
                    ) : null}
                    {requirement.notes ? <p className="mt-2 text-sm leading-6 text-slate-600">{requirement.notes}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus(requirement, 'Submitted')}
                        className="inline-flex items-center gap-2 rounded-md border border-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700"
                      >
                        <CheckCircle2 size={15} /> Mark Submitted
                      </button>
                      <button type="button" onClick={() => startEdit(requirement)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ id: requirement._id, label: requirement.title })}
                        className="rounded-md border border-rose-200 p-1.5 text-rose-600"
                        aria-label={`Delete ${requirement.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
                {!items.length ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No requirements added for this university yet.
                  </p>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </PageState>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete requirement?"
        message={`This will permanently delete "${pendingDelete?.label}" from your checklist.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Requirements;
