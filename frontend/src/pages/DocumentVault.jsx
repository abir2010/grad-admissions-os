import { useEffect, useState } from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { createDocument, deleteDocument, listDocuments } from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const documentTypes = ['SOP', 'CV', 'IELTS', 'Transcript', 'Essay', 'Portfolio', 'Cover Letter', 'Other'];

const emptyDocument = {
  title: '',
  type: 'SOP',
  fileUrl: '',
  tags: '',
  uploadDate: '',
};

function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyDocument);
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadDocuments = async () => {
    const items = await listDocuments();
    setDocuments(items);
  };

  useEffect(() => {
    loadDocuments()
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
      await createDocument({
        ...form,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        uploadDate: form.uploadDate || undefined,
      });
      setForm(emptyDocument);
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await deleteDocument(pendingDelete.id);
    setPendingDelete(null);
    await loadDocuments();
  };

  const filteredDocuments =
    typeFilter === 'All' ? documents : documents.filter((document) => document.type === typeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Document Vault</h2>
        <p className="mt-1 text-sm text-slate-600">
          Store SOPs, CVs, IELTS reports, transcripts, essays, portfolios, and scholarship files.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <Card title="Add Document">
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-5">
            <input
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Document title"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {documentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              name="uploadDate"
              value={form.uploadDate}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="File URL"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Tags separated by commas"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm lg:col-span-4"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Adding...' : 'Add File'}
            </button>
          </form>
        </Card>

        <div className="flex flex-wrap gap-2">
          {['All', ...documentTypes].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                typeFilter === type
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Upload Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDocuments.map((document) => (
                <tr key={document._id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-950">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      {document.title}
                      <ExternalLink size={14} />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <StatusBadge tone="blue">{document.type}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{document.tags.join(', ')}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatDate(document.uploadDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ id: document._id, label: document.title })}
                      className="rounded-md border border-rose-200 p-2 text-rose-600"
                      aria-label={`Delete ${document.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete document?"
        message={`This will permanently delete "${pendingDelete?.label}".`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default DocumentVault;
