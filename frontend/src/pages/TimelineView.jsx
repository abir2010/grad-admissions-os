import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CheckSquare,
  FileEdit,
  GraduationCap,
  Mail,
  MailCheck,
  University,
} from 'lucide-react';
import {
  listEmailDrafts,
  listLorStatuses,
  listProfessors,
  listReminders,
  listRequirements,
  listSopDrafts,
  listUniversities,
} from '../api/admissionsApi.js';
import Card from '../components/Card.jsx';
import PageState from '../components/PageState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

const typeMeta = {
  deadline: { label: 'Deadline', icon: CalendarClock, tone: 'red' },
  professor: { label: 'Professor', icon: GraduationCap, tone: 'blue' },
  reminder: { label: 'Reminder', icon: MailCheck, tone: 'amber' },
  requirement: { label: 'Checklist', icon: CheckSquare, tone: 'green' },
  sop: { label: 'SOP', icon: FileEdit, tone: 'slate' },
  email: { label: 'Email', icon: Mail, tone: 'blue' },
  lor: { label: 'LOR', icon: MailCheck, tone: 'green' },
};

const addEvent = (events, event) => {
  if (event.date) events.push(event);
};

function TimelineView() {
  const [data, setData] = useState({
    universities: [],
    professors: [],
    reminders: [],
    requirements: [],
    sopDrafts: [],
    emailDrafts: [],
    lorStatuses: [],
  });
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [
        universities,
        professors,
        reminders,
        requirements,
        sopDrafts,
        emailDrafts,
        lorStatuses,
      ] = await Promise.all([
        listUniversities(),
        listProfessors(),
        listReminders(),
        listRequirements(),
        listSopDrafts(),
        listEmailDrafts(),
        listLorStatuses(),
      ]);
      setData({ universities, professors, reminders, requirements, sopDrafts, emailDrafts, lorStatuses });
    };

    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => {
    const items = [];

    data.universities.forEach((university) => {
      addEvent(items, {
        id: `deadline-${university._id}`,
        type: 'deadline',
        date: university.applicationDeadline,
        title: `${university.name} application deadline`,
        subtitle: `${university.applicationStatus} - ${university.fundingType}`,
        to: `/universities/${university._id}`,
      });
    });

    data.professors.forEach((professor) => {
      addEvent(items, {
        id: `first-email-${professor._id}`,
        type: 'professor',
        date: professor.firstEmailDate,
        title: `First email to ${professor.name}`,
        subtitle: professor.universityId?.name || professor.email,
        to: `/professors/${professor._id}`,
      });
      addEvent(items, {
        id: `follow-up-${professor._id}`,
        type: 'professor',
        date: professor.followUpDate,
        title: `Follow up with ${professor.name}`,
        subtitle: professor.nextAction || professor.outreachStatus,
        to: `/professors/${professor._id}`,
      });
      addEvent(items, {
        id: `reply-${professor._id}`,
        type: 'professor',
        date: professor.replyDate,
        title: `${professor.name} replied`,
        subtitle: `${professor.replyStatus || 'Reply'} - ${professor.interestLevel || 'Unknown'} interest`,
        to: `/professors/${professor._id}`,
      });
      addEvent(items, {
        id: `meeting-${professor._id}`,
        type: 'professor',
        date: professor.meetingDate,
        title: `Meeting with ${professor.name}`,
        subtitle: professor.researchArea || professor.universityId?.name,
        to: `/professors/${professor._id}`,
      });
    });

    data.reminders.forEach((reminder) => {
      addEvent(items, {
        id: `reminder-${reminder._id}`,
        type: 'reminder',
        date: reminder.dueDate,
        title: reminder.title,
        subtitle: `${reminder.category} - ${reminder.priority} priority`,
        to: '/calendar',
      });
    });

    data.requirements.forEach((requirement) => {
      addEvent(items, {
        id: `requirement-${requirement._id}`,
        type: 'requirement',
        date: requirement.dueDate,
        title: requirement.title,
        subtitle: `${requirement.universityId?.name || 'University'} • ${requirement.status}`,
        to: '/requirements',
      });
    });

    data.sopDrafts.forEach((draft) => {
      addEvent(items, {
        id: `sop-${draft._id}`,
        type: 'sop',
        date: draft.updatedAt || draft.createdAt,
        title: `${draft.title} v${draft.version}`,
        subtitle: draft.changeSummary || draft.focusArea,
        to: '/drafts',
      });
    });

    data.emailDrafts.forEach((draft) => {
      addEvent(items, {
        id: `email-${draft._id}`,
        type: 'email',
        date: draft.updatedAt || draft.createdAt,
        title: `${draft.subject} v${draft.version}`,
        subtitle: draft.purpose || draft.changeSummary,
        to: '/drafts',
      });
    });

    data.lorStatuses.forEach((lor) => {
      addEvent(items, {
        id: `lor-${lor._id}`,
        type: 'lor',
        date: lor.submissionDate,
        title: `${lor.recommenderId?.name || 'Recommender'} submitted LOR`,
        subtitle: lor.universityId?.name || 'University',
        to: '/lor-tracker',
      });
    });

    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const filteredEvents = filter === 'All' ? events : events.filter((event) => typeMeta[event.type].label === filter);
  const filterOptions = ['All', ...new Set(events.map((event) => typeMeta[event.type].label))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Timeline View</h2>
        <p className="mt-1 text-sm text-slate-600">
          A single chronological view of deadlines, outreach, replies, drafts, reminders, requirements, and LOR events.
        </p>
      </div>

      <PageState loading={loading} error={error}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Timeline events</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{events.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Upcoming</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {events.filter((event) => new Date(event.date) >= new Date()).length}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Universities tracked</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{data.universities.length}</p>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={[
                  'rounded-md px-3 py-2 text-sm font-semibold transition',
                  filter === option ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600',
                ].join(' ')}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="relative space-y-4 before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-slate-200">
            {filteredEvents.map((event) => {
              const meta = typeMeta[event.type];
              const Icon = meta.icon;
              return (
                <article key={event.id} className="relative grid gap-3 pl-10 sm:grid-cols-[10rem_1fr]">
                  <div className="absolute left-0 top-1 rounded-full border border-slate-200 bg-white p-2 text-slate-500">
                    <Icon size={16} />
                  </div>
                  <time className="text-sm font-semibold text-slate-500">{formatDate(event.date)}</time>
                  <Link
                    to={event.to}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-950">{event.title}</h3>
                        {event.subtitle ? <p className="mt-1 text-sm text-slate-600">{event.subtitle}</p> : null}
                      </div>
                      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    </div>
                  </Link>
                </article>
              );
            })}
            {!filteredEvents.length ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No timeline events for this filter yet.
              </p>
            ) : null}
          </div>
        </Card>
      </PageState>
    </div>
  );
}

export default TimelineView;
