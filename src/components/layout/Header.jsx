  import React from 'react';
  import { Bell, Search, User, Menu, LogOut } from 'lucide-react';
  import { useAuth } from '../../context/AuthContext';
  import { Button } from '../ui';

  const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <button
                onClick={onMenuClick}
                className="p-2 text-gray-500 hover:text-gray-600 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search */}
              <div className="ml-4 lg:ml-0 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 text-black pr-4 py-2 w-full lg:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'admin@portfolio.com'}
                    </p>
                  </div>
                </button>

                {/* Dropdown menu */}
                <div className="
  absolute right-0 top-full mt-2 w-48
  bg-white rounded-lg shadow-lg border border-gray-200
  opacity-0 pointer-events-none
  group-hover:opacity-100 group-hover:pointer-events-auto
  group-focus-within:opacity-100 group-focus-within:pointer-events-auto
  transition-all duration-200
">

                  <div className="py-2">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Account Settings
                    </a>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  export default Header;