import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, FileText, GraduationCap, MailCheck, Wallet } from 'lucide-react';
import { listDocuments, listLorStatuses, listProfessors, listUniversities } from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { daysUntil, formatCurrency, formatDate } from '../utils/format.js';

const getDeadlineTone = (days) => {
  if (days === null) return 'slate';
  if (days < 0) return 'red';
  if (days <= 14) return 'amber';
  return 'green';
};

function Dashboard() {
  const [data, setData] = useState({
    universities: [],
    professors: [],
    documents: [],
    lorStatuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [universities, professors, documents, lorStatuses] = await Promise.all([
          listUniversities(),
          listProfessors(),
          listDocuments(),
          listLorStatuses(),
        ]);

        setData({ universities, professors, documents, lorStatuses });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const submittedApplications = data.universities.filter(
    (university) => university.applicationStatus === 'Submitted'
  ).length;
  const fullFundTargets = data.universities.filter(
    (university) => university.fundingType === 'Full Fund'
  ).length;
  const submittedLors = data.lorStatuses.filter((lor) => lor.isSubmitted).length;
  const upcomingDeadlines = [...data.universities]
    .filter((university) => university.applicationDeadline)
    .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline))
    .slice(0, 5);
  const totalFees = data.universities.reduce(
    (total, university) => total + Number(university.applicationFee || 0),
    0
  );
  const unpaidFees = data.universities
    .filter((university) => !university.feePaid)
    .reduce((total, university) => total + Number(university.applicationFee || 0), 0);

  const stats = [
    { label: 'Universities', value: data.universities.length, icon: GraduationCap },
    { label: 'Full-Fund Targets', value: fullFundTargets, icon: Wallet },
    { label: 'Professors', value: data.professors.length, icon: MailCheck },
    { label: 'Documents', value: data.documents.length, icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-950">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Your live control panel for deadlines, funding targets, faculty outreach, documents, and
          recommendation letters.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <Icon size={18} className="text-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card title="Upcoming Deadlines">
            <div className="space-y-3">
              {upcomingDeadlines.map((university) => {
                const remaining = daysUntil(university.applicationDeadline);
                return (
                  <div
                    key={university._id}
                    className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link
                        to={`/universities/${university._id}`}
                        className="font-medium text-slate-950 hover:underline"
                      >
                        {university.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(university.applicationDeadline)}
                      </p>
                    </div>
                    <StatusBadge tone={getDeadlineTone(remaining)}>
                      {remaining < 0 ? `${Math.abs(remaining)} days late` : `${remaining} days left`}
                    </StatusBadge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Scholarship Readiness">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Submitted applications</span>
                <strong className="text-slate-950">{submittedApplications}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Submitted LORs</span>
                <strong className="text-slate-950">
                  {submittedLors}/{data.lorStatuses.length}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total application fees</span>
                <strong className="text-slate-950">{formatCurrency(totalFees)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Unpaid fees</span>
                <strong className="text-slate-950">{formatCurrency(unpaidFees)}</strong>
              </div>
              <div className="rounded-md bg-emerald-50 p-3 text-emerald-800">
                <CheckCircle2 size={18} className="mb-2" aria-hidden="true" />
                {fullFundTargets} universities are currently marked as full-fund targets.
              </div>
            </div>
          </Card>
        </div>

        <Card title="High-Priority Funding Targets">
          <div className="grid gap-3 lg:grid-cols-3">
            {data.universities
              .filter((university) => university.priority === 'High')
              .map((university) => (
                <article key={university._id} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/universities/${university._id}`}
                      className="font-semibold text-slate-950 hover:underline"
                    >
                      {university.name}
                    </Link>
                    <CalendarClock size={18} className="text-slate-400" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{university.scholarshipName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge tone="green">{university.fundingType}</StatusBadge>
                    <StatusBadge tone="blue">{university.assistantshipType}</StatusBadge>
                    <StatusBadge tone={university.tuitionWaiver ? 'green' : 'amber'}>
                      {university.tuitionWaiver ? 'Tuition waiver' : 'No waiver'}
                    </StatusBadge>
                  </div>
                </article>
              ))}
          </div>
        </Card>
      </PageState>
    </div>
  );
}

export default Dashboard;
