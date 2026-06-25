import { useEffect, useState } from 'react';
import { FileEdit, Mail, Pencil, Plus, Save, Star, Trash2, X } from 'lucide-react';
import {
  createEmailDraft,
  createSopDraft,
  deleteEmailDraft,
  deleteSopDraft,
  listEmailDrafts,
  listProfessors,
  listSopDrafts,
  listUniversities,
  updateEmailDraft,
  updateSopDraft,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DetailDialog from '../components/DetailDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const fieldClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10';
const labelClass = 'space-y-1 text-sm font-medium text-slate-700';
const helpTextClass = 'text-sm text-slate-500';

const emptySop = {
  title: '',
  universityId: '',
  professorId: '',
  focusArea: '',
  content: '',
  changeSummary: '',
};

const emptyEmail = {
  subject: '',
  universityId: '',
  professorId: '',
  purpose: 'Cold Outreach',
  body: '',
  changeSummary: '',
};

function DraftStudio() {
  const [sopDrafts, setSopDrafts] = useState([]);
  const [emailDrafts, setEmailDrafts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [sopForm, setSopForm] = useState(emptySop);
  const [emailForm, setEmailForm] = useState(emptyEmail);
  const [editingSopId, setEditingSopId] = useState('');
  const [editingEmailId, setEditingEmailId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [sops, emails, universityItems, professorItems] = await Promise.all([
      listSopDrafts(),
      listEmailDrafts(),
      listUniversities(),
      listProfessors(),
    ]);
    setSopDrafts(sops);
    setEmailDrafts(emails);
    setUniversities(universityItems);
    setProfessors(professorItems);
  };

  useEffect(() => {
    loadData()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const saveSop = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...sopForm,
        universityId: sopForm.universityId || undefined,
        professorId: sopForm.professorId || undefined,
      };
      if (editingSopId) await updateSopDraft(editingSopId, payload);
      else await createSopDraft(payload);
      setSopForm(emptySop);
      setEditingSopId('');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...emailForm,
        universityId: emailForm.universityId || undefined,
        professorId: emailForm.professorId || undefined,
      };
      if (editingEmailId) await updateEmailDraft(editingEmailId, payload);
      else await createEmailDraft(payload);
      setEmailForm(emptyEmail);
      setEditingEmailId('');
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const relationshipFields = (form, onChange) => (
    <>
      <label className={labelClass}>
        University
        <select name="universityId" value={form.universityId} onChange={onChange} className={fieldClass}>
          <option value="">General draft</option>
          {universities.map((university) => (
            <option key={university._id} value={university._id}>
              {university.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Professor
        <select name="professorId" value={form.professorId} onChange={onChange} className={fieldClass}>
          <option value="">No professor linked</option>
          {professors.map((professor) => (
            <option key={professor._id} value={professor._id}>
              {professor.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );

  const startEditSop = (draft) => {
    setEditingSopId(draft._id);
    setSopForm({
      title: draft.title || '',
      universityId: draft.universityId?._id || '',
      professorId: draft.professorId?._id || '',
      focusArea: draft.focusArea || '',
      content: draft.content || '',
      changeSummary: draft.changeSummary || '',
    });
  };

  const startEditEmail = (draft) => {
    setEditingEmailId(draft._id);
    setEmailForm({
      subject: draft.subject || '',
      universityId: draft.universityId?._id || '',
      professorId: draft.professorId?._id || '',
      purpose: draft.purpose || 'Cold Outreach',
      body: draft.body || '',
      changeSummary: draft.changeSummary || '',
    });
  };

  const cancelSopEdit = () => {
    setEditingSopId('');
    setSopForm(emptySop);
  };

  const cancelEmailEdit = () => {
    setEditingEmailId('');
    setEmailForm(emptyEmail);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'sop') await deleteSopDraft(pendingDelete.id);
    else await deleteEmailDraft(pendingDelete.id);
    setPendingDelete(null);
    await loadData();
  };

  const renderDraftCard = (draft, type) => {
    const isSop = type === 'sop';
    const markActive = () =>
      (isSop ? updateSopDraft(draft._id, { isActive: true }) : updateEmailDraft(draft._id, { isActive: true })).then(
        loadData
      );
    const edit = () => (isSop ? startEditSop(draft) : startEditEmail(draft));

    return (
      <article key={draft._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-950">
                {isSop ? draft.title : draft.subject} v{draft.version}
              </h3>
              {draft.isActive ? <StatusBadge tone="green">Active</StatusBadge> : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {draft.universityId?.name || 'General'}
              {draft.professorId?.name ? ` - ${draft.professorId.name}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setDetailDraft({ ...draft, type })}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-950 hover:text-slate-950"
            >
              View
            </button>
            <button
              type="button"
              onClick={edit}
              className="rounded-md border border-slate-300 p-2 text-slate-600 hover:border-slate-950 hover:text-slate-950"
              aria-label="Edit draft"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={markActive}
              className="rounded-md border border-slate-300 p-2 text-slate-600 hover:border-slate-950 hover:text-slate-950"
              aria-label="Mark active"
            >
              <Star size={15} />
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingDelete({
                  id: draft._id,
                  type,
                  label: isSop ? draft.title : draft.subject,
                })
              }
              className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
              aria-label="Delete draft"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {draft.changeSummary || draft.focusArea || draft.purpose || draft.body}
        </p>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-slate-950 p-2 text-white">
            <FileEdit size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Draft Studio</h2>
            <p className="mt-1 text-sm text-slate-600">
              Version SOPs and professor emails without losing older drafts.
            </p>
          </div>
        </div>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-5 xl:grid-cols-2">
          <Card title={editingSopId ? 'Edit SOP Version' : 'New SOP Version'}>
            <form onSubmit={saveSop} className="space-y-4">
              <label className={labelClass}>
                SOP title
                <input
                  required
                  name="title"
                  value={sopForm.title}
                  onChange={updateForm(setSopForm)}
                  placeholder="MIT AI Systems SOP"
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">{relationshipFields(sopForm, updateForm(setSopForm))}</div>
              <label className={labelClass}>
                Focus area
                <input
                  name="focusArea"
                  value={sopForm.focusArea}
                  onChange={updateForm(setSopForm)}
                  placeholder="RA fit, funding angle, faculty alignment"
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Draft content
                <textarea
                  required
                  name="content"
                  value={sopForm.content}
                  onChange={updateForm(setSopForm)}
                  rows="7"
                  placeholder="Paste or write the SOP version here..."
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Change summary
                <input
                  name="changeSummary"
                  value={sopForm.changeSummary}
                  onChange={updateForm(setSopForm)}
                  placeholder="Added funding-fit paragraph"
                  className={fieldClass}
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editingSopId ? <Save size={16} /> : <Plus size={16} />}
                {editingSopId ? 'Save SOP Version' : 'Add SOP Version'}
              </button>
              {editingSopId ? (
                <button
                  type="button"
                  onClick={cancelSopEdit}
                  className="ml-2 inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <X size={16} /> Cancel
                </button>
              ) : null}
            </form>
          </Card>

          <Card title={editingEmailId ? 'Edit Email Version' : 'New Email Version'}>
            <form onSubmit={saveEmail} className="space-y-4">
              <label className={labelClass}>
                Email subject
                <input
                  required
                  name="subject"
                  value={emailForm.subject}
                  onChange={updateForm(setEmailForm)}
                  placeholder="Research fit and funding inquiry"
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                {relationshipFields(emailForm, updateForm(setEmailForm))}
                <label className={labelClass}>
                  Purpose
                  <select name="purpose" value={emailForm.purpose} onChange={updateForm(setEmailForm)} className={fieldClass}>
                    <option>Cold Outreach</option>
                    <option>Follow Up</option>
                    <option>Interview Thank You</option>
                    <option>Coordinator Question</option>
                    <option>Funding Inquiry</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>
              <label className={labelClass}>
                Email body
                <textarea
                  required
                  name="body"
                  value={emailForm.body}
                  onChange={updateForm(setEmailForm)}
                  rows="7"
                  placeholder="Write the email version here..."
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Change summary
                <input
                  name="changeSummary"
                  value={emailForm.changeSummary}
                  onChange={updateForm(setEmailForm)}
                  placeholder="Made the follow-up shorter and more specific"
                  className={fieldClass}
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {editingEmailId ? <Save size={16} /> : <Plus size={16} />}
                {editingEmailId ? 'Save Email Version' : 'Add Email Version'}
              </button>
              {editingEmailId ? (
                <button
                  type="button"
                  onClick={cancelEmailEdit}
                  className="ml-2 inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <X size={16} /> Cancel
                </button>
              ) : null}
            </form>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <FileEdit size={18} /> SOP Versions
              </span>
            }
          >
            <p className={`${helpTextClass} mb-4`}>{sopDrafts.length} saved SOP versions</p>
            <div className="space-y-3">
              {sopDrafts.map((draft) => renderDraftCard(draft, 'sop'))}
              {!sopDrafts.length ? <p className={helpTextClass}>No SOP versions yet.</p> : null}
            </div>
          </Card>

          <Card
            title={
              <span className="inline-flex items-center gap-2">
                <Mail size={18} /> Email Versions
              </span>
            }
          >
            <p className={`${helpTextClass} mb-4`}>{emailDrafts.length} saved email versions</p>
            <div className="space-y-3">
              {emailDrafts.map((draft) => renderDraftCard(draft, 'email'))}
              {!emailDrafts.length ? <p className={helpTextClass}>No email versions yet.</p> : null}
            </div>
          </Card>
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete draft version?"
        message={`This will permanently delete "${pendingDelete?.label}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
      <DetailDialog
        isOpen={Boolean(detailDraft)}
        title={detailDraft?.type === 'sop' ? detailDraft?.title : detailDraft?.subject}
        eyebrow={detailDraft ? `${detailDraft.type === 'sop' ? 'SOP' : 'Email'} version ${detailDraft.version}` : ''}
        onClose={() => setDetailDraft(null)}
      >
        {detailDraft ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {detailDraft.isActive ? <StatusBadge tone="green">Active</StatusBadge> : null}
              <StatusBadge tone="blue">{detailDraft.universityId?.name || 'General'}</StatusBadge>
              {detailDraft.professorId?.name ? <StatusBadge>{detailDraft.professorId.name}</StatusBadge> : null}
              {detailDraft.purpose ? <StatusBadge tone="amber">{detailDraft.purpose}</StatusBadge> : null}
            </div>
            {detailDraft.focusArea ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-500">Focus Area</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{detailDraft.focusArea}</p>
              </section>
            ) : null}
            {detailDraft.changeSummary ? (
              <section>
                <h3 className="text-sm font-semibold text-slate-500">Change Summary</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">{detailDraft.changeSummary}</p>
              </section>
            ) : null}
            <section>
              <h3 className="text-sm font-semibold text-slate-500">Full Draft</h3>
              <div className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800">
                {detailDraft.content || detailDraft.body}
              </div>
            </section>
          </div>
        ) : null}
      </DetailDialog>
    </div>
  );
}

export default DraftStudio;
