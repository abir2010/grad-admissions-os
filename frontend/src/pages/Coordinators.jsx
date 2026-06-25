import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, Plus, Save, Trash2 } from 'lucide-react';
import {
  createCoordinator,
  deleteCoordinator,
  listCoordinators,
  listUniversities,
  updateCoordinator,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import { formatDate } from '../utils/format.js';

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';
const labelClass = 'space-y-1 text-sm font-medium text-slate-700';

const emptyCoordinator = {
  name: '',
  email: '',
  title: '',
  department: '',
  universityId: '',
  phone: '',
  notes: '',
  lastContactedDate: '',
};

function Coordinators() {
  const [coordinators, setCoordinators] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState(emptyCoordinator);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadData = async () => {
    const [coordinatorItems, universityItems] = await Promise.all([listCoordinators(), listUniversities()]);
    setCoordinators(coordinatorItems);
    setUniversities(universityItems);
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

  const reset = () => {
    setEditingId('');
    setForm(emptyCoordinator);
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    const payload = { ...form, lastContactedDate: form.lastContactedDate || undefined };
    if (editingId) await updateCoordinator(editingId, payload);
    else await createCoordinator(payload);
    reset();
    await loadData();
  };

  const edit = (coordinator) => {
    setEditingId(coordinator._id);
    setForm({
      name: coordinator.name || '',
      email: coordinator.email || '',
      title: coordinator.title || '',
      department: coordinator.department || '',
      universityId: coordinator.universityId?._id || '',
      phone: coordinator.phone || '',
      notes: coordinator.notes || '',
      lastContactedDate: coordinator.lastContactedDate ? coordinator.lastContactedDate.slice(0, 10) : '',
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteCoordinator(pendingDelete.id);
    setPendingDelete(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-950 p-2 text-white">
            <Building2 size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Grad Coordinators</h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep admissions contacts, funding questions, and follow-up notes organized by university.
            </p>
          </div>
        </div>
      </div>

      <PageState loading={loading} error={error}>
        <Card title={editingId ? 'Edit Coordinator' : 'Add Coordinator'}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <label className={labelClass}>
                Name
                <input required name="name" value={form.name} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Email
                <input required type="email" name="email" value={form.email} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                University
                <select required name="universityId" value={form.universityId} onChange={handleChange} className={fieldClass}>
                  <option value="">Select university</option>
                  {universities.map((university) => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Last contacted
                <input type="date" name="lastContactedDate" value={form.lastContactedDate} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Title
                <input name="title" value={form.title} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Department
                <input name="department" value={form.department} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} className={fieldClass} />
              </label>
              <div className="flex items-end gap-2">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? 'Save' : 'Add'}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
            <label className={labelClass}>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" className={fieldClass} />
            </label>
          </form>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          {coordinators.map((coordinator) => (
            <Card key={coordinator._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-950">{coordinator.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{coordinator.title || 'Graduate coordinator'}</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{coordinator.universityId?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete({ id: coordinator._id, label: coordinator.name })}
                  className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                  aria-label="Delete coordinator"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail size={15} /> {coordinator.email}
                </p>
                {coordinator.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone size={15} /> {coordinator.phone}
                  </p>
                ) : null}
                <p>Last contacted: {formatDate(coordinator.lastContactedDate)}</p>
                {coordinator.notes ? <p className="rounded-md bg-slate-50 p-3 leading-6">{coordinator.notes}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => edit(coordinator)}
                className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-950 hover:text-slate-950"
              >
                Edit
              </button>
            </Card>
          ))}
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete coordinator?"
        message={`This will permanently delete "${pendingDelete?.label}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default Coordinators;
