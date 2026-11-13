import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Award, Briefcase, Calendar, ExternalLink, FileText, MessageSquare, TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import contentService from '../services/content';
import { SITE_URL } from '../config/site';
import { monthlyCounts, recentActivity, timeAgo } from '../utils/dashboardData';
import Card from '../components/ui/Card';
import ErrorMessage from '../components/shared/ErrorMessage';

const SERIES = [
  { key: 'projects', name: 'Projects', color: '#3a3fa8' },
  { key: 'blogs', name: 'Blogs', color: '#f2a93b' },
  { key: 'messages', name: 'Messages', color: '#1b1a17' },
];

const BADGE = { project: 'badge-blue', blog: 'badge-yellow', message: 'badge-green' };
const TYPE_LABEL = { project: 'Project', blog: 'Blog', message: 'Message' };

const list = (response) => response?.data?.data ?? [];

async function fetchAll() {
  const [projects, blogs, messages, skills] = await Promise.all([
    contentService.getProjects(),
    contentService.getBlogs(),
    contentService.getMessages(),
    contentService.getSkills(),
  ]);
  return { projects: list(projects), blogs: list(blogs), messages: list(messages), skills: list(skills) };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
          {p.name}: <strong className="text-ink">{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

const Dashboard = () => {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAll()
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch(() => !cancelled && setState({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'loading', data: null });
    setAttempt((n) => n + 1);
  };

  const { data } = state;
  const loading = state.status === 'loading';
  const chart = useMemo(() => (data ? monthlyCounts(data) : []), [data]);
  const activity = useMemo(() => (data ? recentActivity(data) : []), [data]);

  const published = data ? data.blogs.filter((b) => b.published).length : 0;
  const unread = data ? data.messages.filter((m) => !m.read).length : 0;
  const featured = data ? data.projects.filter((p) => p.featured).length : 0;

  const stats = [
    { title: 'Projects', value: data?.projects.length, note: `${featured} featured`, icon: Briefcase, tone: 'bg-marigold text-ink' },
    { title: 'Blog posts', value: data?.blogs.length, note: `${published} published`, icon: FileText, tone: 'bg-dusk text-white' },
    { title: 'Unread messages', value: unread, note: `${data?.messages.length ?? 0} in total`, icon: MessageSquare, tone: 'bg-ink text-porcelain' },
    { title: 'Skills', value: data?.skills.length, note: 'shown on the portfolio', icon: Award, tone: 'bg-sand text-ink' },
  ];

  const actions = [
    { label: 'Add a project', to: '/projects', icon: Briefcase },
    { label: 'Write a blog post', to: '/blogs', icon: FileText },
    { label: 'Read messages', to: '/messages', icon: MessageSquare },
    { label: 'See analytics', to: '/analytics', icon: TrendingUp },
  ];

  const latestMessages = data ? [...data.messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">Dashboard</h1>
        <p className="mt-1 text-gray-600">An overview of what is on your portfolio right now.</p>
      </div>

      {state.status === 'error' && (
        <ErrorMessage message="Could not load the dashboard. The server may be waking up." onRetry={retry} />
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="stat-card">
              <span className={`grid size-10 place-items-center rounded-xl ${s.tone}`}>
                <Icon size={18} />
              </span>
              <div>
                {loading ? (
                  <div className="skeleton h-9 w-16" />
                ) : (
                  <p className="font-display text-4xl font-semibold leading-none">{s.value ?? '–'}</p>
                )}
                <p className="mt-2 text-sm font-medium">{s.title}</p>
                <p className="text-xs text-gray-500">{loading ? '\u00a0' : s.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Activity by month" subtitle="New items in the last six months" className="xl:col-span-2">
          {loading ? (
            <div className="skeleton h-64 w-full" />
          ) : (
            <div className="h-64" role="img" aria-label="Line chart of new projects, blogs and messages per month">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece6db" vertical={false} />
                  <XAxis dataKey="month" stroke="#a39c90" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis stroke="#a39c90" tick={{ fontSize: 12 }} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                  {SERIES.map((s) => (
                    <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Quick actions">
          <ul className="flex flex-col gap-2">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.to}>
                  <Link to={a.to} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium hover:border-ink">
                    <span className="flex items-center gap-3"><Icon size={16} className="text-dusk" /> {a.label}</span>
                    <ArrowUpRight size={14} className="text-gray-400" />
                  </Link>
                </li>
              );
            })}
            <li>
              <a href={SITE_URL} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-marigold px-4 py-3 text-sm font-semibold text-ink hover:brightness-95">
                Open the portfolio <ExternalLink size={14} />
              </a>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Recent activity" subtitle="Newest projects, posts and messages" className="xl:col-span-2">
          {loading ? (
            <div className="skeleton h-40 w-full" />
          ) : activity.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Nothing yet. New content will show up here.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>What happened</th><th>Details</th><th>When</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {activity.map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium text-ink">{a.label}</td>
                      <td className="max-w-[16rem] truncate">{a.detail}</td>
                      <td className="whitespace-nowrap"><span className="inline-flex items-center gap-1.5"><Calendar size={12} /> {a.ago}</span></td>
                      <td><span className={`badge ${BADGE[a.type]}`}>{TYPE_LABEL[a.type]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Latest messages"
          headerActions={<Link to="/messages" className="text-sm font-medium text-dusk underline">View all</Link>}
        >
          {loading ? (
            <div className="skeleton h-32 w-full" />
          ) : latestMessages.length === 0 ? (
            <p className="py-6 text-center text-gray-500">No messages yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {latestMessages.map((m) => (
                <li key={m.id} className="rounded-xl border border-gray-200 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <span className={`badge ${m.read ? 'badge-purple' : 'badge-yellow'}`}>{m.read ? 'Read' : 'New'}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{m.message}</p>
                  <p className="mt-1.5 text-xs text-gray-500">{m.email} · {timeAgo(m.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
