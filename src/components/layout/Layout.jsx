import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { pathname } = useLocation();
  // The mobile menu counts as open only for the page it was opened on,
  // so it closes by itself when you navigate.
  const [openFor, setOpenFor] = useState(null);
  const sidebarOpen = openFor === pathname;
  const close = () => setOpenFor(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="admin-shell">
      <a href="#main" className="skip-link">Skip to content</a>

      {sidebarOpen && <div className="sidebar-overlay" onClick={close} aria-hidden="true" />}
      <Sidebar isOpen={sidebarOpen} onClose={close} />

      <div className="admin-main">
        <Header onMenuClick={() => setOpenFor(pathname)} />
        <main id="main" className="admin-content fade-in" key={pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
