import React from 'react';
import { useMessages } from '../../context/MessagesContext';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  User, 
  Code, 
  Briefcase, 
  FileText, 
  Calendar,
  MessageSquare,
  Settings,
  Image,
  BarChart3,
  Mail,
  Award,
  Trophy,
  BadgeCheck   
} from 'lucide-react';

const Sidebar = ({ isOpen = true, onClose }) => {
    const { unreadCount } = useMessages();
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/',
      exact: true,
    },
    {
      title: 'About',
      icon: User,
      path: '/about',
    },
    {
      title: 'Skills',
      icon: Award,
      path: '/skills',
    },
    {
      title: 'Projects',
      icon: Code,
      path: '/projects',
    },
    {
      title: 'Blogs',
      icon: FileText,
      path: '/blogs',
    },
     {
      title: 'Certificates',    
      icon: BadgeCheck,
      path: '/certificates',
    },
    {
      title: 'Achievements',    
      icon: Trophy,
      path: '/achievements',
    },
    {
      title: 'Experience',
      icon: Briefcase,
      path: '/experience',
    },
    {
      title: 'Testimonials',
      icon: MessageSquare,
      path: '/testimonials',
    },
    {
      title: 'Services',
      icon: Settings,
      path: '/services',
    },
    {
      title: 'Media Library',
      icon: Image,
      path: '/media',
    },
   {
    title: 'Messages',
    icon: Mail,
    path: '/messages',
    badge: unreadCount > 0 ? unreadCount : null,
  },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Websmith CMS</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-5rem)]">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* User info */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;