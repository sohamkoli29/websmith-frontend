// Pure helpers for the dashboard (kept separate so they are easy to test).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function timeAgo(date, now = Date.now()) {
  const s = Math.floor((now - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)} d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Items created in each of the last `months` calendar months.
export function monthlyCounts({ projects, blogs, messages }, now = new Date(), months = 6) {
  const out = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inMonth = (x) => {
      const t = new Date(x.created_at);
      return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
    };
    out.push({
      month: MONTHS[d.getMonth()],
      projects: projects.filter(inMonth).length,
      blogs: blogs.filter(inMonth).length,
      messages: messages.filter(inMonth).length,
    });
  }
  return out;
}

// The newest things that happened across projects, blogs and messages.
export function recentActivity({ projects, blogs, messages }, limit = 6, now = Date.now()) {
  const items = [
    ...projects.map((p) => ({ id: `project-${p.id}`, type: 'project', label: 'Project added', detail: p.title, at: p.created_at })),
    ...blogs.map((b) => ({ id: `blog-${b.id}`, type: 'blog', label: b.published ? 'Blog published' : 'Blog drafted', detail: b.title, at: b.published_at || b.created_at })),
    ...messages.map((m) => ({ id: `message-${m.id}`, type: 'message', label: 'Message received', detail: `From ${m.name}`, at: m.created_at })),
  ];
  return items
    .filter((i) => i.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit)
    .map((i) => ({ ...i, ago: timeAgo(i.at, now) }));
}
