import React, { useState } from 'react';
import { Bell, Search, User, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="admin-header">
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%', gap: '16px',
      }}>

        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {/* Hamburger */}
          <button
            id="hamburger-btn"
            onClick={onMenuClick}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px',
              cursor: 'pointer', color: 'var(--text-secondary)',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Menu size={17} />
          </button>

          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }} id="header-search">
            <Search size={13} style={{
              position: 'absolute', left: '11px',
              top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px 8px 32px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Bell */}
          <button style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px',
            cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '6px', height: '6px',
              background: '#ec4899', borderRadius: '50%',
              border: '1.5px solid var(--bg-primary)',
            }} />
          </button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '10px', padding: '7px 12px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '28px', height: '28px', flexShrink: 0,
                background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color="white" />
              </div>
              <div id="header-user-info" style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f1f0ff', margin: 0, lineHeight: 1.2 }}>
                  {user?.name?.split(' ')[0] || 'Admin'}
                </p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0, marginTop: '1px' }}>
                  Administrator
                </p>
              </div>
              <ChevronDown size={12} color="var(--text-muted)" id="header-chevron" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  onClick={() => setDropdownOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: '12px', minWidth: '190px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  zIndex: 50, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f0ff', margin: 0 }}>
                      {user?.name || 'Admin User'}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {user?.email || 'admin@portfolio.com'}
                    </p>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px',
                        background: 'none', border: 'none',
                        borderRadius: '8px', color: '#f87171',
                        fontSize: '0.82rem', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={13} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #hamburger-btn { display: flex !important; }
          #header-search { display: none !important; }
          #header-user-info, #header-chevron { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
