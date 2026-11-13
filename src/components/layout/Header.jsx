import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, ExternalLink, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { SITE_URL } from '../../config/site';

const TITLES = [
  ['/about', 'About'], ['/skills', 'Skills'], ['/projects', 'Projects'], ['/blogs', 'Blogs'],
  ['/certificates', 'Certificates'], ['/achievements', 'Achievements'], ['/experience', 'Experience'],
  ['/testimonials', 'Testimonials'], ['/services', 'Services'], ['/media', 'Media Library'],
  ['/messages', 'Messages'], ['/analytics', 'Analytics'],
];

const titleFor = (pathname) => TITLES.find(([p]) => pathname.startsWith(p))?.[1] || 'Dashboard';

const Header = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useMessages();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const name = user?.name || 'Admin';

  return (
    <header className="admin-header">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full border border-gray-200 bg-white lg:hidden"
          >
            <Menu size={18} />
          </button>
          <h2 className="font-display text-xl font-semibold">{titleFor(pathname)}</h2>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:border-ink sm:flex"
          >
            View site <ExternalLink size={13} />
          </a>

          <Link
            to="/messages"
            aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}
            className="relative grid size-10 place-items-center rounded-full border border-gray-200 bg-white hover:border-ink"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-marigold px-1 text-[0.65rem] font-bold text-ink">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 hover:border-ink"
            >
              <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-semibold text-porcelain">
                {name[0]?.toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:block">{name.split(' ')[0]}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-200 px-4 py-3">
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
