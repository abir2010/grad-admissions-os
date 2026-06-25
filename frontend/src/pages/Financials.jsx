import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import {
  createUniversity,
  deleteUniversity,
  listUniversities,
  updateUniversity,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatCurrency, formatDate, toDateInputValue } from '../utils/format.js';

const emptyUniversity = {
  name: '',
  applicationDeadline: '',
  applicationFee: '',
  feePaid: false,
  feeWaiverStatus: 'N/A',
  ieltsRequiredScore: '',
  transcriptsSent: false,
  applicationStatus: 'Planning',
  fundingStatus: 'Researching',
  fundingType: 'Unknown',
  scholarshipName: '',
  assistantshipType: 'Unknown',
  stipendAmount: '',
  tuitionWaiver: false,
  priority: 'Medium',
  portalUrl: '',
  notes: '',
};

const normalizeUniversity = (form) => ({
  ...form,
  applicationFee: form.applicationFee === '' ? undefined : Number(form.applicationFee),
  ieltsRequiredScore: form.ieltsRequiredScore === '' ? undefined : Number(form.ieltsRequiredScore),
  stipendAmount: form.stipendAmount === '' ? undefined : Number(form.stipendAmount),
  applicationDeadline: form.applicationDeadline || undefined,
});

function Financials() {
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState(emptyUniversity);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadUniversities = async () => {
    const items = await listUniversities();
    setUniversities(items);
  };

  useEffect(() => {
    loadUniversities()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setEditingId('');
    setForm(emptyUniversity);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = normalizeUniversity(form);
      if (editingId) {
        await updateUniversity(editingId, payload);
      } else {
        await createUniversity(payload);
      }
      await loadUniversities();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (university) => {
    setEditingId(university._id);
    setForm({
      name: university.name || '',
      applicationDeadline: toDateInputValue(university.applicationDeadline),
      applicationFee: university.applicationFee ?? '',
      feePaid: Boolean(university.feePaid),
      feeWaiverStatus: university.feeWaiverStatus || 'N/A',
      ieltsRequiredScore: university.ieltsRequiredScore ?? '',
      transcriptsSent: Boolean(university.transcriptsSent),
      applicationStatus: university.applicationStatus || 'Planning',
      fundingStatus: university.fundingStatus || 'Researching',
      fundingType: university.fundingType || 'Unknown',
      scholarshipName: university.scholarshipName || '',
      assistantshipType: university.assistantshipType || 'Unknown',
      stipendAmount: university.stipendAmount ?? '',
      tuitionWaiver: Boolean(university.tuitionWaiver),
      priority: university.priority || 'Medium',
      portalUrl: university.portalUrl || '',
      notes: university.notes || '',
    });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteUniversity(pendingDelete.id);
    await loadUniversities();
    if (editingId === pendingDelete.id) resetForm();
    setPendingDelete(null);
  };

  const totalFees = universities.reduce((total, item) => total + Number(item.applicationFee || 0), 0);
  const paidFees = universities
    .filter((item) => item.feePaid)
    .reduce((total, item) => total + Number(item.applicationFee || 0), 0);
  const projectedStipend = universities.reduce(
    (total, item) => total + Number(item.stipendAmount || 0),
    0
  );
  const highPriorityFunding = universities.filter((university) => university.priority === 'High');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Funding & Universities</h2>
        <p className="mt-1 text-sm text-slate-600">
          Track application fees, fee waivers, full-fund opportunities, assistantships, stipends,
          deadlines, and submission progress.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Total application fees</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalFees)}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Paid fees</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(paidFees)}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Projected annual stipend</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(projectedStipend)}</p>
          </Card>
        </div>

        <Card title={editingId ? 'Edit University' : 'Add University'}>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-1 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">University</span>
              <input
                required
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Deadline</span>
              <input
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Priority</span>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Application fee</span>
              <input
                type="number"
                min="0"
                name="applicationFee"
                value={form.applicationFee}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Fee waiver</span>
              <select
                name="feeWaiverStatus"
                value={form.feeWaiverStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Pending</option>
                <option>Approved</option>
                <option>Denied</option>
                <option>N/A</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Application status</span>
              <select
                name="applicationStatus"
                value={form.applicationStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Submitted</option>
                <option>Admitted</option>
                <option>Rejected</option>
                <option>Waitlisted</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Funding status</span>
              <select
                name="fundingStatus"
                value={form.fundingStatus}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Researching</option>
                <option>Eligible</option>
                <option>Applied</option>
                <option>Awarded</option>
                <option>Denied</option>
                <option>Not Available</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Funding type</span>
              <select
                name="fundingType"
                value={form.fundingType}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>Full Fund</option>
                <option>Partial Fund</option>
                <option>Self Funded</option>
                <option>Unknown</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Assistantship</span>
              <select
                name="assistantshipType"
                value={form.assistantshipType}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option>RA</option>
                <option>TA</option>
                <option>GA</option>
                <option>Fellowship</option>
                <option>None</option>
                <option>Unknown</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Stipend</span>
              <input
                type="number"
                min="0"
                name="stipendAmount"
                value={form.stipendAmount}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Scholarship name</span>
              <input
                name="scholarshipName"
                value={form.scholarshipName}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">Portal URL</span>
              <input
                name="portalUrl"
                value={form.portalUrl}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">IELTS required</span>
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                name="ieltsRequiredScore"
                value={form.ieltsRequiredScore}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="feePaid" checked={form.feePaid} onChange={handleChange} />
                Fee paid
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="tuitionWaiver"
                  checked={form.tuitionWaiver}
                  onChange={handleChange}
                />
                Tuition waiver
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="transcriptsSent"
                  checked={form.transcriptsSent}
                  onChange={handleChange}
                />
                Transcripts sent
              </label>
            </div>
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
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add University'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="High-Priority Funding">
          <p className="mb-4 text-sm text-slate-500">
            Universities marked `High` appear here for quick funding decisions. Edit a university to change
            priority, scholarship details, stipend, tuition waiver, or deadline.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {highPriorityFunding.map((university) => (
              <article key={university._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/universities/${university._id}`}
                      className="font-semibold text-slate-950 hover:underline"
                    >
                      {university.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{university.scholarshipName || 'Scholarship not set'}</p>
                  </div>
                  <StatusBadge tone="red">High</StatusBadge>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Deadline</dt>
                    <dd className="font-medium text-slate-950">{formatDate(university.applicationDeadline)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Funding</dt>
                    <dd className="font-medium text-slate-950">{university.fundingType}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Stipend</dt>
                    <dd className="font-medium text-slate-950">{formatCurrency(university.stipendAmount)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(university)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Edit
                  </button>
                  <Link
                    to={`/universities/${university._id}`}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ id: university._id, label: university.name })}
                    className="rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {!highPriorityFunding.length ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 lg:col-span-3">
                No high-priority funding targets yet. Add or edit a university and set priority to High.
              </p>
            ) : null}
          </div>
        </Card>

        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-950">All Universities</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {universities.map((university) => (
            <Card key={university._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/universities/${university._id}`}
                    className="text-lg font-semibold text-slate-950 hover:underline"
                  >
                    {university.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    Deadline: {formatDate(university.applicationDeadline)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(university)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ id: university._id, label: university.name })}
                    className="rounded-md border border-rose-200 px-3 py-2 text-rose-600"
                    aria-label={`Delete ${university.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge tone={university.priority === 'High' ? 'red' : 'slate'}>
                  {university.priority}
                </StatusBadge>
                <StatusBadge tone="blue">{university.applicationStatus}</StatusBadge>
                <StatusBadge tone={university.fundingType === 'Full Fund' ? 'green' : 'amber'}>
                  {university.fundingType}
                </StatusBadge>
                <StatusBadge tone={university.tuitionWaiver ? 'green' : 'amber'}>
                  {university.tuitionWaiver ? 'Tuition waiver' : 'No waiver'}
                </StatusBadge>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Scholarship</dt>
                  <dd className="font-medium text-slate-950">{university.scholarshipName || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assistantship</dt>
                  <dd className="font-medium text-slate-950">{university.assistantshipType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Application fee</dt>
                  <dd className="font-medium text-slate-950">{formatCurrency(university.applicationFee)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Annual stipend</dt>
                  <dd className="font-medium text-slate-950">{formatCurrency(university.stipendAmount)}</dd>
                </div>
              </dl>
              {university.notes ? <p className="mt-4 text-sm text-slate-600">{university.notes}</p> : null}
              {university.portalUrl ? (
                <a
                  href={university.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
                >
                  Open portal <ExternalLink size={15} />
                </a>
              ) : null}
            </Card>
          ))}
        </div>
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete university?"
        message={`This will permanently delete "${pendingDelete?.label}" from your funding tracker.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Financials;
