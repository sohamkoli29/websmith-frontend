import React from 'react';
import { useMessages } from '../../context/MessagesContext';
import { NavLink } from 'react-router-dom';
import {
  Home, User, Code, Briefcase, FileText, MessageSquare,
  Settings, Image, BarChart3, Mail, Award, Trophy, BadgeCheck, X, Code2
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard',     icon: Home,          path: '/', exact: true },
  { title: 'About',         icon: User,          path: '/about' },
  { title: 'Skills',        icon: Award,         path: '/skills' },
  { title: 'Projects',      icon: Code,          path: '/projects' },
  { title: 'Blogs',         icon: FileText,      path: '/blogs' },
  { title: 'Certificates',  icon: BadgeCheck,    path: '/certificates' },
  { title: 'Achievements',  icon: Trophy,        path: '/achievements' },
  { title: 'Experience',    icon: Briefcase,     path: '/experience' },
  { title: 'Testimonials',  icon: MessageSquare, path: '/testimonials' },
  { title: 'Services',      icon: Settings,      path: '/services' },
  { title: 'Media Library', icon: Image,         path: '/media' },
  { title: 'Messages',      icon: Mail,          path: '/messages' },
  { title: 'Analytics',     icon: BarChart3,     path: '/analytics' },
];

const Sidebar = ({ isOpen = true, onClose }) => {
  const { unreadCount } = useMessages();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>

      {/* Logo area */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '34px', height: '34px', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Code2 size={16} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#f1f0ff', margin: 0, lineHeight: 1.2 }}>
              Websmith
            </p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>CMS Admin</p>
          </div>
        </div>

        {/* Mobile close button — shown via CSS */}
        <button
          onClick={onClose}
          id="sidebar-close-btn"
          style={{
            display: 'none',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isMsgs = item.path === '/messages';
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.title}</span>
                  {isMsgs && unreadCount > 0 && (
                    <span style={{
                      background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                      color: 'white', fontSize: '0.6rem', fontWeight: 700,
                      padding: '2px 7px', borderRadius: '99px',
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Version */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          Portfolio CMS v1.0.0
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
