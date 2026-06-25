import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, FileText, Mail, Save, University } from 'lucide-react';
import {
  getProfessor,
  listEmailDrafts,
  listReminders,
  listSopDrafts,
  updateProfessor,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate, toDateInputValue } from '../utils/format.js';

const emptyOutreach = {
  outreachStatus: 'Shortlisted',
  firstEmailDate: '',
  followUpDate: '',
  replyDate: '',
  replyStatus: 'No Reply',
  interestLevel: 'Unknown',
  nextAction: '',
  meetingDate: '',
  replyNotes: '',
};

function ProfessorDashboard() {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const [sopDrafts, setSopDrafts] = useState([]);
  const [emailDrafts, setEmailDrafts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState('');
  const [outreachForm, setOutreachForm] = useState(emptyOutreach);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOutreach, setSavingOutreach] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    const [professorItem, sopItems, emailItems, reminderItems] = await Promise.all([
      getProfessor(id),
      listSopDrafts(`?professorId=${id}`),
      listEmailDrafts(`?professorId=${id}`),
      listReminders(),
    ]);
    setProfessor(professorItem);
    setNotes(professorItem.interviewNotes || '');
    setOutreachForm({
      outreachStatus: professorItem.outreachStatus || 'Shortlisted',
      firstEmailDate: toDateInputValue(professorItem.firstEmailDate),
      followUpDate: toDateInputValue(professorItem.followUpDate),
      replyDate: toDateInputValue(professorItem.replyDate),
      replyStatus: professorItem.replyStatus || 'No Reply',
      interestLevel: professorItem.interestLevel || 'Unknown',
      nextAction: professorItem.nextAction || '',
      meetingDate: toDateInputValue(professorItem.meetingDate),
      replyNotes: professorItem.replyNotes || '',
    });
    setSopDrafts(sopItems);
    setEmailDrafts(emailItems);
    setReminders(reminderItems.filter((reminder) => reminder.professorId?._id === id));
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const saveNotes = async () => {
    setSaving(true);
    setSaveMessage('');
    setError('');
    try {
      const updated = await updateProfessor(id, { interviewNotes: notes });
      setProfessor(updated);
      setSaveMessage('Notes saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOutreachChange = (event) => {
    const { name, value } = event.target;
    setOutreachForm((current) => ({ ...current, [name]: value }));
  };

  const saveOutreach = async (event) => {
    event.preventDefault();
    setSavingOutreach(true);
    setOutreachMessage('');
    setError('');

    try {
      const payload = {
        ...outreachForm,
        firstEmailDate: outreachForm.firstEmailDate || undefined,
        followUpDate: outreachForm.followUpDate || undefined,
        replyDate: outreachForm.replyDate || undefined,
        meetingDate: outreachForm.meetingDate || undefined,
      };
      const updated = await updateProfessor(id, payload);
      setProfessor(updated);
      setOutreachMessage('Outreach workflow saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingOutreach(false);
    }
  };

  const activeSop = sopDrafts.find((draft) => draft.isActive);
  const activeEmail = emailDrafts.find((draft) => draft.isActive);

  return (
    <div className="space-y-6">
      <Link
        to="/professors"
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-950 hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Back to pipeline
      </Link>

      <PageState loading={loading} error={error}>
        {professor ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Professor Dashboard
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">{professor.name}</h2>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Mail size={16} />
                      {professor.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <University size={16} />
                      {professor.universityId?.name || 'No university assigned'}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock size={16} />
                      Last contact: {formatDate(professor.lastContactedDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <FileText size={16} />
                      SOP: {professor.assignedSopId?.title || 'Not assigned'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="blue">{professor.outreachStatus}</StatusBadge>
                  <StatusBadge tone="green">{professor.researchArea || 'Research area TBD'}</StatusBadge>
                </div>
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-4">
              <Card>
                <p className="text-sm font-medium text-slate-500">SOP versions</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{sopDrafts.length}</p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">Email versions</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{emailDrafts.length}</p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">Reminders</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{reminders.length}</p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">Current status</p>
                <p className="mt-3">
                  <StatusBadge tone="blue">{professor.outreachStatus}</StatusBadge>
                </p>
              </Card>
            </div>

            <Card title="Email Outreach & Reply Tracker">
              <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="blue">{professor.outreachStatus || 'Shortlisted'}</StatusBadge>
                    <StatusBadge tone={professor.replyStatus === 'Positive' ? 'green' : 'slate'}>
                      {professor.replyStatus || 'No Reply'}
                    </StatusBadge>
                    <StatusBadge tone={professor.interestLevel === 'High' ? 'green' : 'amber'}>
                      {professor.interestLevel || 'Unknown'} Interest
                    </StatusBadge>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-500">First Email</dt>
                      <dd className="mt-1 text-slate-950">{formatDate(professor.firstEmailDate)}</dd>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-500">Follow Up</dt>
                      <dd className="mt-1 text-slate-950">{formatDate(professor.followUpDate)}</dd>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-500">Reply Date</dt>
                      <dd className="mt-1 text-slate-950">{formatDate(professor.replyDate)}</dd>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <dt className="font-semibold text-slate-500">Meeting Date</dt>
                      <dd className="mt-1 text-slate-950">{formatDate(professor.meetingDate)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 rounded-md bg-white p-3 text-sm">
                    <p className="font-semibold text-slate-500">Next Action</p>
                    <p className="mt-1 leading-6 text-slate-700">
                      {professor.nextAction || 'No next action saved yet.'}
                    </p>
                  </div>
                  <div className="mt-3 rounded-md bg-white p-3 text-sm">
                    <p className="font-semibold text-slate-500">Reply Notes</p>
                    <p className="mt-1 whitespace-pre-wrap leading-6 text-slate-700">
                      {professor.replyNotes || 'No reply notes saved yet.'}
                    </p>
                  </div>
                </section>

                <form onSubmit={saveOutreach} className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Pipeline status</span>
                    <select
                      name="outreachStatus"
                      value={outreachForm.outreachStatus}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option>Shortlisted</option>
                      <option>Cold Emailed</option>
                      <option>Replied</option>
                      <option>Interviewing</option>
                      <option>Applied</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Reply status</span>
                    <select
                      name="replyStatus"
                      value={outreachForm.replyStatus}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option>No Reply</option>
                      <option>Positive</option>
                      <option>Neutral</option>
                      <option>Negative</option>
                      <option>Auto Reply</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Interest level</span>
                    <select
                      name="interestLevel"
                      value={outreachForm.interestLevel}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                      <option>Unknown</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">First email</span>
                    <input
                      type="date"
                      name="firstEmailDate"
                      value={outreachForm.firstEmailDate}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Follow-up date</span>
                    <input
                      type="date"
                      name="followUpDate"
                      value={outreachForm.followUpDate}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Reply date</span>
                    <input
                      type="date"
                      name="replyDate"
                      value={outreachForm.replyDate}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-slate-700">Meeting date</span>
                    <input
                      type="date"
                      name="meetingDate"
                      value={outreachForm.meetingDate}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Next action</span>
                    <input
                      name="nextAction"
                      value={outreachForm.nextAction}
                      onChange={handleOutreachChange}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Follow up, send CV, prepare meeting notes..."
                    />
                  </label>
                  <label className="space-y-1 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Reply notes</span>
                    <textarea
                      name="replyNotes"
                      value={outreachForm.replyNotes}
                      onChange={handleOutreachChange}
                      rows="3"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6"
                      placeholder="Paste reply summary, sentiment, funding hints, or professor instructions."
                    />
                  </label>
                  <div className="flex items-center gap-3 lg:col-span-2">
                    <button
                      type="submit"
                      disabled={savingOutreach}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      <Save size={16} />
                      {savingOutreach ? 'Saving...' : 'Save Outreach'}
                    </button>
                    {outreachMessage ? (
                      <span className="text-sm font-medium text-emerald-700">{outreachMessage}</span>
                    ) : null}
                  </div>
                </form>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card title="Research Fit">
                <p className="text-sm leading-6 text-slate-600">
                  {professor.researchArea || 'Add a research area from the pipeline.'}
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-500">Active SOP</dt>
                    <dd className="mt-1 text-slate-700">{activeSop?.title || professor.assignedSopId?.title || 'None'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Active Email</dt>
                    <dd className="mt-1 text-slate-700">{activeEmail?.subject || 'None'}</dd>
                  </div>
                </dl>
              </Card>

              <Card title="SOP Versions">
                <div className="space-y-3">
                  {sopDrafts.map((draft) => (
                    <article key={draft._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-slate-950">
                          {draft.title} v{draft.version}
                        </strong>
                        {draft.isActive ? <StatusBadge tone="green">Active</StatusBadge> : null}
                      </div>
                      <p className="mt-2 leading-5 text-slate-600">{draft.changeSummary || draft.focusArea}</p>
                    </article>
                  ))}
                  {!sopDrafts.length ? <p className="text-sm text-slate-500">No SOP versions linked yet.</p> : null}
                </div>
              </Card>

              <Card title="Email Versions">
                <div className="space-y-3">
                  {emailDrafts.map((draft) => (
                    <article key={draft._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-slate-950">
                          {draft.subject} v{draft.version}
                        </strong>
                        {draft.isActive ? <StatusBadge tone="green">Active</StatusBadge> : null}
                      </div>
                      <p className="mt-2 text-slate-600">{draft.purpose}</p>
                    </article>
                  ))}
                  {!emailDrafts.length ? <p className="text-sm text-slate-500">No email versions linked yet.</p> : null}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card title="Interview & Outreach Notes">
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows="9"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  placeholder="Store call notes, follow-up ideas, funding fit, and next actions here."
                />
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={saving}
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
                {saveMessage ? <span className="ml-3 text-sm font-medium text-emerald-700">{saveMessage}</span> : null}
              </Card>

              <Card title="Related Reminders">
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <article key={reminder._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-slate-100 p-2 text-slate-500">
                          <CalendarClock size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950">{reminder.title}</p>
                          <p className="mt-1 text-slate-500">{formatDate(reminder.dueDate)}</p>
                          {reminder.notes ? <p className="mt-2 leading-5 text-slate-600">{reminder.notes}</p> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                  {!reminders.length ? <p className="text-sm text-slate-500">No reminders linked yet.</p> : null}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </PageState>
    </div>
  );
}

export default ProfessorDashboard;
