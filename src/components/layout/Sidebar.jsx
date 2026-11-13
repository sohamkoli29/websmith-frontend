import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, User, Code, Briefcase, FileText, MessageSquare, Settings, Image,
  BarChart3, Mail, Award, Trophy, BadgeCheck, X, ExternalLink,
} from 'lucide-react';
import { useMessages } from '../../context/MessagesContext';
import { SITE_URL } from '../../config/site';

const groups = [
  { label: null, items: [{ title: 'Dashboard', icon: Home, path: '/', end: true }] },
  {
    label: 'Content',
    items: [
      { title: 'About', icon: User, path: '/about' },
      { title: 'Skills', icon: Award, path: '/skills' },
      { title: 'Projects', icon: Code, path: '/projects' },
      { title: 'Blogs', icon: FileText, path: '/blogs' },
      { title: 'Certificates', icon: BadgeCheck, path: '/certificates' },
      { title: 'Achievements', icon: Trophy, path: '/achievements' },
      { title: 'Experience', icon: Briefcase, path: '/experience' },
      { title: 'Testimonials', icon: MessageSquare, path: '/testimonials' },
      { title: 'Services', icon: Settings, path: '/services' },
    ],
  },
  { label: 'Library', items: [{ title: 'Media Library', icon: Image, path: '/media' }] },
  { label: 'Inbox', items: [{ title: 'Messages', icon: Mail, path: '/messages', badge: true }] },
  { label: 'Insights', items: [{ title: 'Analytics', icon: BarChart3, path: '/analytics' }] },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const { unreadCount } = useMessages();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} aria-label="Sidebar">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-marigold font-display text-lg font-bold text-ink">SK</span>
          <div>
            <p className="font-display text-base font-semibold leading-tight">Portfolio CMS</p>
            <p className="text-xs text-gray-500">Soham Koli</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-9 place-items-center rounded-full border border-gray-200 text-gray-600 lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && <p className="nav-group-label">{group.label}</p>}
            <ul className={`flex flex-col gap-0.5 ${group.label ? '' : 'pt-3'}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && unreadCount > 0 && (
                        <span className="rounded-full bg-marigold px-2 py-0.5 text-[0.68rem] font-bold text-ink">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 px-5 py-4">
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:border-ink"
        >
          View live site <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
