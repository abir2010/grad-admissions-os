import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import {
  createReminder,
  deleteReminder,
  listProfessors,
  listReminders,
  listUniversities,
  updateReminder,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { daysUntil, formatDate } from '../utils/format.js';

const categories = ['Deadline', 'Email', 'Document', 'LOR', 'Funding', 'Interview', 'Other'];
const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';
const labelClass = 'space-y-1 text-sm font-medium text-slate-700';

const emptyReminder = {
  title: '',
  dueDate: '',
  category: 'Deadline',
  priority: 'Medium',
  universityId: '',
  professorId: '',
  notes: '',
};

const toneForDue = (dueDate, completed) => {
  if (completed) return 'green';
  const days = daysUntil(dueDate);
  if (days < 0) return 'red';
  if (days <= 7) return 'amber';
  return 'blue';
};

function CalendarReminders() {
  const [reminders, setReminders] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState(emptyReminder);
  const [editingId, setEditingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [reminderItems, universityItems, professorItems] = await Promise.all([
      listReminders(),
      listUniversities(),
      listProfessors(),
    ]);
    setReminders(reminderItems);
    setUniversities(universityItems);
    setProfessors(professorItems);
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

  const save = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      universityId: form.universityId || undefined,
      professorId: form.professorId || undefined,
    };
    if (editingId) await updateReminder(editingId, payload);
    else await createReminder(payload);
    setForm(emptyReminder);
    setEditingId('');
    await loadData();
  };

  const startEdit = (reminder) => {
    setEditingId(reminder._id);
    setForm({
      title: reminder.title || '',
      dueDate: reminder.dueDate ? reminder.dueDate.slice(0, 10) : '',
      category: reminder.category || 'Deadline',
      priority: reminder.priority || 'Medium',
      universityId: reminder.universityId?._id || '',
      professorId: reminder.professorId?._id || '',
      notes: reminder.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm(emptyReminder);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteReminder(pendingDelete.id);
    setPendingDelete(null);
    await loadData();
  };

  const upcoming = reminders.filter((reminder) => !reminder.completed);
  const completed = reminders.filter((reminder) => reminder.completed);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-950 p-2 text-white">
            <CalendarCheck size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Calendar & Reminders</h2>
            <p className="mt-1 text-sm text-slate-600">
              Track deadlines, follow-ups, funding tasks, interviews, document uploads, and LOR nudges.
            </p>
          </div>
        </div>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">Upcoming</p>
            <p className="mt-2 text-2xl font-semibold">{upcoming.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">High priority</p>
            <p className="mt-2 text-2xl font-semibold">{upcoming.filter((item) => item.priority === 'High').length}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-2 text-2xl font-semibold">{completed.length}</p>
          </Card>
        </div>

        <Card title={editingId ? 'Edit Reminder' : 'Add Reminder'}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <label className={`${labelClass} lg:col-span-2`}>
                Task title
                <input required name="title" value={form.title} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Due date
                <input required type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Priority
                <select name="priority" value={form.priority} onChange={handleChange} className={fieldClass}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <label className={labelClass}>
                Category
                <select name="category" value={form.category} onChange={handleChange} className={fieldClass}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                University
                <select name="universityId" value={form.universityId} onChange={handleChange} className={fieldClass}>
                  <option value="">General</option>
                  {universities.map((university) => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Professor
                <select name="professorId" value={form.professorId} onChange={handleChange} className={fieldClass}>
                  <option value="">None</option>
                  {professors.map((professor) => (
                    <option key={professor._id} value={professor._id}>
                      {professor.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  {editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? 'Save Reminder' : 'Add Reminder'}
                </button>
              </div>
            </div>
            <label className={labelClass}>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" className={fieldClass} />
            </label>
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <X size={16} /> Cancel Edit
              </button>
            ) : null}
          </form>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <Card title="Timeline">
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <article
                  key={reminder._id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex gap-3">
                    <div className="rounded-md bg-slate-100 p-2 text-slate-600">
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-950'}`}>
                        {reminder.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(reminder.dueDate)} - {reminder.universityId?.name || 'General'}
                      </p>
                      {reminder.notes ? <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.notes}</p> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge tone={toneForDue(reminder.dueDate, reminder.completed)}>
                      {reminder.completed ? 'Done' : `${daysUntil(reminder.dueDate)} days`}
                    </StatusBadge>
                    <button
                      type="button"
                      onClick={() => startEdit(reminder)}
                      className="rounded-md border border-slate-300 p-2 text-slate-600 hover:border-slate-950 hover:text-slate-950"
                      aria-label="Edit reminder"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReminder(reminder._id, { completed: !reminder.completed }).then(loadData)}
                      className="rounded-md border border-slate-300 p-2 text-slate-600 hover:border-slate-950 hover:text-slate-950"
                      aria-label="Toggle reminder complete"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ id: reminder._id, label: reminder.title })}
                      className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Focus Today">
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((reminder) => (
                <div key={reminder._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-slate-950">{reminder.title}</strong>
                    <StatusBadge tone={reminder.priority === 'High' ? 'red' : 'slate'}>{reminder.priority}</StatusBadge>
                  </div>
                  <p className="mt-2 text-slate-500">{formatDate(reminder.dueDate)}</p>
                </div>
              ))}
              {!upcoming.length ? <p className="text-sm text-slate-500">Nothing pending right now.</p> : null}
            </div>
          </Card>
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete reminder?"
        message={`This will permanently delete "${pendingDelete?.label}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default CalendarReminders;
