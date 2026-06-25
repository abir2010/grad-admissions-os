import { useEffect, useState } from 'react';
import { CheckCircle2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import {
  createLorStatus,
  createRecommender,
  deleteLorStatus,
  listLorStatuses,
  listRecommenders,
  listUniversities,
  updateLorStatus,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DetailDialog from '../components/DetailDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate, toDateInputValue } from '../utils/format.js';

const emptyRecommender = {
  name: '',
  email: '',
  role: '',
  title: '',
};

const emptyLor = {
  recommenderId: '',
  universityId: '',
  isSubmitted: false,
  submissionDate: '',
};

function LorTracker() {
  const [lorStatuses, setLorStatuses] = useState([]);
  const [recommenders, setRecommenders] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [recommenderForm, setRecommenderForm] = useState(emptyRecommender);
  const [lorForm, setLorForm] = useState(emptyLor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingLorId, setEditingLorId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [detailLor, setDetailLor] = useState(null);

  const loadData = async () => {
    const [lorItems, recommenderItems, universityItems] = await Promise.all([
      listLorStatuses(),
      listRecommenders(),
      listUniversities(),
    ]);
    setLorStatuses(lorItems);
    setRecommenders(recommenderItems);
    setUniversities(universityItems);
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRecommenderChange = (event) => {
    const { name, value } = event.target;
    setRecommenderForm((current) => ({ ...current, [name]: value }));
  };

  const handleLorChange = (event) => {
    const { name, value, type, checked } = event.target;
    setLorForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateRecommender = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await createRecommender(recommenderForm);
      setRecommenderForm(emptyRecommender);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...lorForm,
        submissionDate: lorForm.submissionDate || undefined,
      };
      if (editingLorId) await updateLorStatus(editingLorId, payload);
      else await createLorStatus(payload);
      setLorForm(emptyLor);
      setEditingLorId('');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSubmitted = async (lor) => {
    await updateLorStatus(lor._id, {
      isSubmitted: !lor.isSubmitted,
      submissionDate: !lor.isSubmitted ? new Date().toISOString().slice(0, 10) : undefined,
    });
    await loadData();
  };

  const changeSubmissionDate = async (lor, submissionDate) => {
    await updateLorStatus(lor._id, { submissionDate: submissionDate || undefined });
    await loadData();
  };

  const startEditLor = (lor) => {
    setEditingLorId(lor._id);
    setLorForm({
      recommenderId: lor.recommenderId?._id || '',
      universityId: lor.universityId?._id || '',
      isSubmitted: Boolean(lor.isSubmitted),
      submissionDate: toDateInputValue(lor.submissionDate),
    });
  };

  const cancelLorEdit = () => {
    setEditingLorId('');
    setLorForm(emptyLor);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteLorStatus(pendingDelete.id);
    setPendingDelete(null);
    await loadData();
  };

  const submittedCount = lorStatuses.filter((lor) => lor.isSubmitted).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">LOR Tracker</h2>
        <p className="mt-1 text-sm text-slate-600">
          Coordinate recommenders, university-specific requests, and submission status.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Recommenders</p>
            <p className="mt-2 text-2xl font-semibold">{recommenders.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">LOR requests</p>
            <p className="mt-2 text-2xl font-semibold">{lorStatuses.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Submitted</p>
            <p className="mt-2 text-2xl font-semibold">
              {submittedCount}/{lorStatuses.length}
            </p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Add Recommender">
            <form onSubmit={handleCreateRecommender} className="grid gap-3 sm:grid-cols-2">
              <input
                required
                name="name"
                value={recommenderForm.name}
                onChange={handleRecommenderChange}
                placeholder="Name"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                required
                type="email"
                name="email"
                value={recommenderForm.email}
                onChange={handleRecommenderChange}
                placeholder="Email"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="role"
                value={recommenderForm.role}
                onChange={handleRecommenderChange}
                placeholder="Role"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="title"
                value={recommenderForm.title}
                onChange={handleRecommenderChange}
                placeholder="Title"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add Recommender
              </button>
            </form>
          </Card>

          <Card title={editingLorId ? 'Edit LOR Request' : 'Create LOR Request'}>
            <form onSubmit={handleSaveLor} className="grid gap-3 sm:grid-cols-2">
              <select
                required
                name="recommenderId"
                value={lorForm.recommenderId}
                onChange={handleLorChange}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select recommender</option>
                {recommenders.map((recommender) => (
                  <option key={recommender._id} value={recommender._id}>
                    {recommender.name}
                  </option>
                ))}
              </select>
              <select
                required
                name="universityId"
                value={lorForm.universityId}
                onChange={handleLorChange}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Select university</option>
                {universities.map((university) => (
                  <option key={university._id} value={university._id}>
                    {university.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="submissionDate"
                value={lorForm.submissionDate}
                onChange={handleLorChange}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isSubmitted"
                  checked={lorForm.isSubmitted}
                  onChange={handleLorChange}
                />
                Submitted
              </label>
              <button
                type="submit"
              disabled={saving}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            >
                {editingLorId ? <Save size={16} /> : <Plus size={16} />}
                {editingLorId ? 'Save Request' : 'Add Request'}
              </button>
              {editingLorId ? (
                <button
                  type="button"
                  onClick={cancelLorEdit}
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <X size={16} /> Cancel
                </button>
              ) : null}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {lorStatuses.map((lor) => (
            <Card key={lor._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{lor.recommenderId?.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{lor.recommenderId?.email}</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{lor.universityId?.name}</p>
                </div>
                <StatusBadge tone={lor.isSubmitted ? 'green' : 'amber'}>
                  {lor.isSubmitted ? 'Submitted' : 'Pending'}
                </StatusBadge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailLor(lor)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => startEditLor(lor)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => toggleSubmitted(lor)}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <CheckCircle2 size={16} />
                  {lor.isSubmitted ? 'Mark Pending' : 'Mark Submitted'}
                </button>
                <input
                  type="date"
                  value={toDateInputValue(lor.submissionDate)}
                  onChange={(event) => changeSubmissionDate(lor, event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPendingDelete({
                      id: lor._id,
                      label: `${lor.recommenderId?.name || 'Recommender'} - ${lor.universityId?.name || 'University'}`,
                    })
                  }
                  className="rounded-md border border-rose-200 p-2 text-rose-600"
                  aria-label="Delete LOR request"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Submission date: {formatDate(lor.submissionDate)}
              </p>
            </Card>
          ))}
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete LOR request?"
        message={`This will permanently delete "${pendingDelete?.label}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
      <DetailDialog
        isOpen={Boolean(detailLor)}
        title={detailLor ? `${detailLor.recommenderId?.name || 'Recommender'} - ${detailLor.universityId?.name || 'University'}` : ''}
        eyebrow="Recommendation letter request"
        onClose={() => setDetailLor(null)}
      >
        {detailLor ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={detailLor.isSubmitted ? 'green' : 'amber'}>
                {detailLor.isSubmitted ? 'Submitted' : 'Pending'}
              </StatusBadge>
              <StatusBadge tone="blue">{detailLor.universityId?.name}</StatusBadge>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Recommender</dt>
                <dd className="mt-1 text-slate-950">{detailLor.recommenderId?.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd className="mt-1 text-slate-950">{detailLor.recommenderId?.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Role</dt>
                <dd className="mt-1 text-slate-950">{detailLor.recommenderId?.role || 'Not set'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Submission Date</dt>
                <dd className="mt-1 text-slate-950">{formatDate(detailLor.submissionDate)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </DetailDialog>
    </div>
  );
}

export default LorTracker;
