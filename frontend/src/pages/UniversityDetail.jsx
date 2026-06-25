import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  FileEdit,
  Mail,
  MailCheck,
  UserRound,
} from 'lucide-react';
import {
  getUniversity,
  listCoordinators,
  listEmailDrafts,
  listLorStatuses,
  listProfessors,
  listReminders,
  listRequirements,
  listSopDrafts,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';

const matchesUniversity = (value, id) => {
  if (!value) return false;
  if (typeof value === 'string') return value === id;
  return value._id === id;
};

function UniversityDetail() {
  const { id } = useParams();
  const [data, setData] = useState({
    university: null,
    professors: [],
    sopDrafts: [],
    emailDrafts: [],
    coordinators: [],
    reminders: [],
    lorStatuses: [],
    requirements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [
        university,
        professors,
        sopDrafts,
        emailDrafts,
        coordinators,
        reminders,
        lorStatuses,
        requirements,
      ] = await Promise.all([
        getUniversity(id),
        listProfessors(),
        listSopDrafts(),
        listEmailDrafts(),
        listCoordinators(),
        listReminders(),
        listLorStatuses(),
        listRequirements(),
      ]);

      setData({
        university,
        professors: professors.filter((item) => matchesUniversity(item.universityId, id)),
        sopDrafts: sopDrafts.filter((item) => matchesUniversity(item.universityId, id)),
        emailDrafts: emailDrafts.filter((item) => matchesUniversity(item.universityId, id)),
        coordinators: coordinators.filter((item) => matchesUniversity(item.universityId, id)),
        reminders: reminders.filter((item) => matchesUniversity(item.universityId, id)),
        lorStatuses: lorStatuses.filter((item) => matchesUniversity(item.universityId, id)),
        requirements: requirements.filter((item) => matchesUniversity(item.universityId, id)),
      });
    };

    setLoading(true);
    setError('');
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const { university, professors, sopDrafts, emailDrafts, coordinators, reminders, lorStatuses, requirements } = data;
  const submittedLors = lorStatuses.filter((item) => item.isSubmitted).length;
  const completedRequirements = requirements.filter((item) =>
    ['Submitted', 'Waived', 'Not Required'].includes(item.status)
  ).length;

  return (
    <div className="space-y-6">
      <Link
        to="/financials"
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-slate-950 hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Back to universities
      </Link>

      <PageState loading={loading} error={error}>
        {university ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    University Workspace
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">{university.name}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                    {university.notes || 'Track all funding, outreach, documents, and LOR work for this university.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={university.priority === 'High' ? 'red' : 'slate'}>
                    {university.priority}
                  </StatusBadge>
                  <StatusBadge tone="blue">{university.applicationStatus}</StatusBadge>
                  <StatusBadge tone={university.fundingType === 'Full Fund' ? 'green' : 'amber'}>
                    {university.fundingType}
                  </StatusBadge>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-sm font-medium text-slate-500">Deadline</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatDate(university.applicationDeadline)}
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">Application fee</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatCurrency(university.applicationFee)}
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">Annual stipend</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {formatCurrency(university.stipendAmount)}
                </p>
              </Card>
              <Card>
                <p className="text-sm font-medium text-slate-500">LOR submitted</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {submittedLors}/{lorStatuses.length}
                </p>
              </Card>
            </div>

            <Card title="Requirement Checklist">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  {completedRequirements}/{requirements.length} requirements complete for this university.
                </p>
                <Link
                  to="/requirements"
                  className="text-sm font-semibold text-slate-950 hover:underline"
                >
                  Manage checklist
                </Link>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {requirements.map((requirement) => (
                  <article key={requirement._id} className="rounded-md border border-slate-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{requirement.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {requirement.type} - Due {formatDate(requirement.dueDate)}
                        </p>
                      </div>
                      <StatusBadge
                        tone={['Submitted', 'Waived', 'Not Required'].includes(requirement.status) ? 'green' : 'amber'}
                      >
                        {requirement.status}
                      </StatusBadge>
                    </div>
                  </article>
                ))}
                {!requirements.length ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 lg:col-span-2">
                    No checklist items linked yet.
                  </p>
                ) : null}
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <Card title="Funding Details">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Scholarship</dt>
                    <dd className="mt-1 font-medium text-slate-950">{university.scholarshipName || 'Not set'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Assistantship</dt>
                    <dd className="mt-1 font-medium text-slate-950">{university.assistantshipType}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Fee waiver</dt>
                    <dd className="mt-1 font-medium text-slate-950">{university.feeWaiverStatus}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">IELTS score</dt>
                    <dd className="mt-1 font-medium text-slate-950">{university.ieltsRequiredScore || 'Not set'}</dd>
                  </div>
                </dl>
                {university.portalUrl ? (
                  <a
                    href={university.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open Portal <ExternalLink size={15} />
                  </a>
                ) : null}
              </Card>

              <Card title="Graduate Coordinators">
                <div className="space-y-3">
                  {coordinators.map((coordinator) => (
                    <article key={coordinator._id} className="rounded-md border border-slate-200 p-3 text-sm">
                      <p className="font-semibold text-slate-950">{coordinator.name}</p>
                      <p className="mt-1 text-slate-500">{coordinator.title || coordinator.department}</p>
                      <p className="mt-2 flex items-center gap-2 text-slate-700">
                        <Mail size={14} /> {coordinator.email}
                      </p>
                    </article>
                  ))}
                  {!coordinators.length ? <p className="text-sm text-slate-500">No coordinator linked yet.</p> : null}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card title="Professors">
                <div className="space-y-3">
                  {professors.map((professor) => (
                    <Link
                      key={professor._id}
                      to={`/professors/${professor._id}`}
                      className="block rounded-md border border-slate-200 p-3 text-sm hover:border-slate-400 hover:bg-slate-50"
                    >
                      <p className="font-semibold text-slate-950">{professor.name}</p>
                      <p className="mt-1 text-slate-500">{professor.researchArea || 'Research area not set'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusBadge tone="blue">{professor.outreachStatus}</StatusBadge>
                        <StatusBadge tone={professor.replyStatus === 'Positive' ? 'green' : 'slate'}>
                          {professor.replyStatus || 'No Reply'}
                        </StatusBadge>
                      </div>
                    </Link>
                  ))}
                  {!professors.length ? <p className="text-sm text-slate-500">No professors linked yet.</p> : null}
                </div>
              </Card>

              <Card title="Drafts">
                <div className="space-y-3 text-sm">
                  {[...sopDrafts, ...emailDrafts].map((draft) => (
                    <Link
                      key={draft._id}
                      to="/drafts"
                      className="block rounded-md border border-slate-200 p-3 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <p className="flex items-center gap-2 font-semibold text-slate-950">
                        <FileEdit size={15} />
                        {draft.title || draft.subject} v{draft.version}
                      </p>
                      <p className="mt-1 text-slate-500">{draft.changeSummary || draft.purpose || draft.focusArea}</p>
                    </Link>
                  ))}
                  {!sopDrafts.length && !emailDrafts.length ? (
                    <p className="text-sm text-slate-500">No SOP or email drafts linked yet.</p>
                  ) : null}
                </div>
              </Card>

              <Card title="Reminders & LOR">
                <div className="space-y-3 text-sm">
                  {reminders.map((reminder) => (
                    <Link
                      key={reminder._id}
                      to="/calendar"
                      className="block rounded-md border border-slate-200 p-3 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <p className="flex items-center gap-2 font-semibold text-slate-950">
                        <CalendarClock size={15} />
                        {reminder.title}
                      </p>
                      <p className="mt-1 text-slate-500">{formatDate(reminder.dueDate)}</p>
                    </Link>
                  ))}
                  {lorStatuses.map((lor) => (
                    <Link
                      key={lor._id}
                      to="/lor-tracker"
                      className="block rounded-md border border-slate-200 p-3 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <p className="flex items-center gap-2 font-semibold text-slate-950">
                        {lor.isSubmitted ? <MailCheck size={15} /> : <UserRound size={15} />}
                        {lor.recommenderId?.name || 'Recommender'}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {lor.isSubmitted ? `Submitted ${formatDate(lor.submissionDate)}` : 'Pending submission'}
                      </p>
                    </Link>
                  ))}
                  {!reminders.length && !lorStatuses.length ? (
                    <p className="text-sm text-slate-500">No reminders or LOR requests linked yet.</p>
                  ) : null}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </PageState>
    </div>
  );
}

export default UniversityDetail;
