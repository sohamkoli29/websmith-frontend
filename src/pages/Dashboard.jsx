import React, { useState, useEffect } from 'react';
import {
  BarChart3, FileText, Briefcase, MessageSquare,
  ArrowUp, ArrowDown, Activity, Award, Trophy,
  TrendingUp, Users, Eye, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card } from '../components/ui';
import contentService from '../services/content';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const statsResponse = await contentService.getStats();
      if (statsResponse.data.success) setStats(statsResponse.data.data);
      await fetchRecentActivities();
      await generateChartData();
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  const fetchRecentActivities = async () => {
    try {
      const activities = [];
      const [pr, bl, ms] = await Promise.all([
        contentService.getProjects(),
        contentService.getBlogs(),
        contentService.getMessages()
      ]);
      const push = (arr, type, label) => arr?.data?.data
        ?.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        ?.slice(0, 2)
        ?.forEach(x => activities.push({ id: `${type}-${x.id}`, user: x.name || x.author || 'Admin', action: `${label} "${x.title || x.name || 'item'}"`, time: formatTimeAgo(x.created_at), timestamp: new Date(x.created_at), type }));
      push(pr, 'project', 'Added project');
      push(bl, 'blog', 'Published blog');
      ms?.data?.data?.slice(0,2).forEach(m => activities.push({ id: `msg-${m.id}`, user: m.name, action: 'sent a message', time: formatTimeAgo(m.created_at), timestamp: new Date(m.created_at), type: 'message' }));
      setRecentActivities(activities.sort((a,b) => b.timestamp - a.timestamp).slice(0,5));
    } catch(e) { console.error(e); }
  };

  const generateChartData = async () => {
    try {
      const [pr, bl, ms] = await Promise.all([
        contentService.getProjects(),
        contentService.getBlogs(),
        contentService.getMessages()
      ]);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const s = new Date(d.getFullYear(), d.getMonth(), 1);
        const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const count = (arr) => arr?.data?.data?.filter(x => { const t = new Date(x.created_at); return t >= s && t <= e; }).length || 0;
        data.push({ month: months[d.getMonth()], projects: count(pr), blogs: count(bl), messages: count(ms) });
      }
      setChartData(data);
    } catch(e) { console.error(e); }
  };

  const statCards = [
    { title: 'Total Projects',   value: stats?.counts?.projects || 0,       icon: Briefcase,    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', trend: '+12%', up: true },
    { title: 'Published Blogs',  value: stats?.counts?.blogs || 0,          icon: FileText,     gradient: 'linear-gradient(135deg,#10b981,#06b6d4)', trend: '+8%',  up: true },
    { title: 'Unread Messages',  value: stats?.counts?.unreadMessages || 0, icon: MessageSquare,gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', trend: '-3%',  up: false },
    { title: 'Total Skills',     value: stats?.counts?.skills || 0,         icon: Award,        gradient: 'linear-gradient(135deg,#7c3aed,#ec4899)', trend: '+5%',  up: true },
  ];

  const typeBadge = (type) => {
    const map = { project: { bg: '#3b82f620', color: '#93c5fd', label: 'Project' }, blog: { bg: '#10b98120', color: '#6ee7b7', label: 'Blog' }, message: { bg: '#f59e0b20', color: '#fcd34d', label: 'Message' } };
    const s = map[type] || { bg: '#7c3aed20', color: '#c4b5fd', label: type };
    return <span style={{ background: s.bg, color: s.color, fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px' }}>{s.label}</span>;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '10px', padding: '10px 14px' }}>
        <p style={{ color: '#9490b5', fontSize: '0.75rem', marginBottom: '6px' }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, fontSize: '0.82rem' }}>
            {p.name}: <strong style={{ color: '#f1f0ff' }}>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ color: '#9490b5', fontSize: '0.85rem', marginTop: '4px' }}>Welcome back! Here's your portfolio overview.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }} className="grid-cols-4-resp">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '38px', height: '38px', background: s.gradient, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color="white" />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: s.up ? '#86efac' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {s.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {s.trend}
                </span>
              </div>
              {isLoading
                ? <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '4px' }} />
                : <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f1f0ff', lineHeight: 1 }}>{s.value}</p>
              }
              <p style={{ color: '#9490b5', fontSize: '0.78rem', marginTop: '4px' }}>{s.title}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }} className="grid-cols-2-resp">
        {/* Chart */}
        <Card title="Performance Overview" subtitle="Last 6 months">
          {chartData.length > 0 ? (
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                  <XAxis dataKey="month" stroke="#524f6e" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#524f6e" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#9490b5' }} />
                  <Line type="monotone" dataKey="projects" stroke="#7c3aed" strokeWidth={2} dot={false} name="Projects" />
                  <Line type="monotone" dataKey="blogs"    stroke="#06b6d4" strokeWidth={2} dot={false} name="Blogs" />
                  <Line type="monotone" dataKey="messages" stroke="#ec4899" strokeWidth={2} dot={false} name="Messages" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <BarChart3 size={32} color="#524f6e" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#524f6e', fontSize: '0.82rem' }}>Loading chart data...</p>
              </div>
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card title="Quick Actions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Add New Project', href: '/projects', icon: Briefcase, color: '#3b82f6' },
              { label: 'Write Blog Post', href: '/blogs',    icon: FileText,  color: '#06b6d4' },
              { label: 'View Messages',   href: '/messages', icon: MessageSquare, color: '#f59e0b' },
              { label: 'Analytics',       href: '/analytics',icon: TrendingUp, color: '#7c3aed' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <a key={a.href} href={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border)', transition: 'all 0.2s', color: '#9490b5' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'none'; }}
                >
                  <div style={{ width: '30px', height: '30px', background: `${a.color}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} color={a.color} />
                  </div>
                  <span style={{ fontSize: '0.83rem', color: '#c4b5fd', fontWeight: 500 }}>{a.label}</span>
                </a>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card title="Recent Activity" subtitle="Latest actions in your CMS"
        headerActions={
          <button onClick={fetchRecentActivities} style={{ fontSize: '0.75rem', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer' }}>
            Refresh
          </button>
        }
      >
        {recentActivities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Activity size={32} color="#524f6e" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ color: '#524f6e', fontSize: '0.85rem' }}>No recent activity</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Time</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{a.user[0]}</span>
                        </div>
                        <span style={{ fontWeight: 500, color: '#f1f0ff', fontSize: '0.82rem' }}>{a.user}</span>
                      </div>
                    </td>
                    <td style={{ color: '#9490b5', fontSize: '0.82rem' }}>{a.action}</td>
                    <td style={{ color: '#524f6e', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {a.time}
                      </div>
                    </td>
                    <td>{typeBadge(a.type)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent messages */}
      {stats?.recent?.messages?.length > 0 && (
        <Card title="Recent Messages"
          headerActions={
            <a href="/messages" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none' }}>View All</a>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recent.messages.slice(0, 3).map((m, i) => (
              <div key={i} style={{ padding: '0.85rem', background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#f1f0ff', fontSize: '0.85rem' }}>{m.name}</p>
                  <p style={{ color: '#9490b5', fontSize: '0.78rem', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.message?.substring(0, 80)}...
                  </p>
                  <p style={{ color: '#524f6e', fontSize: '0.72rem', marginTop: '4px' }}>{m.email}</p>
                </div>
                <span className={m.read ? 'badge badge-purple' : 'badge badge-blue'} style={{ flexShrink: 0 }}>
                  {m.read ? 'Read' : 'Unread'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
