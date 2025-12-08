'use client';

import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Moon, Sun, FileText, BarChart3, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check for saved dark mode preference or default to dark
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode ? JSON.parse(savedMode) : true; // Default to dark mode
    setDarkMode(isDark);
    updateDarkMode(isDark);
  }, []);

  const updateDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    updateDarkMode(newMode);
  };

  return (
    <header className="bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Enhanced Professional Logo */}
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative">
                    {/* Document icon layers */}
                    <div className="w-8 h-10 bg-white dark:bg-gray-100 rounded-lg shadow-inner">
                      <div className="absolute top-1 left-1 right-1 h-0.5 bg-blue-500 rounded-full"></div>
                      <div className="absolute top-2.5 left-1 right-2 h-0.5 bg-gray-300 rounded-full"></div>
                      <div className="absolute top-4 left-1 right-1.5 h-0.5 bg-gray-300 rounded-full"></div>
                      <div className="absolute top-5.5 left-1 right-3 h-0.5 bg-blue-400 rounded-full"></div>
                      <div className="absolute top-7 left-1 right-2 h-0.5 bg-gray-300 rounded-full"></div>
                    </div>
                    {/* Checkmark overlay */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 border-white border-r-2 border-b-2 transform rotate-45 translate-x-[-1px] translate-y-[-1px]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  SOP<span className="text-primary-500">ify</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold tracking-wide">
                  ENTERPRISE OPERATIONS PLATFORM
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  pathname === '/'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>SOP Generator</span>
              </Link>
              
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  pathname === '/dashboard'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
              
              <Link
                href="/chatbot"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  pathname === '/chatbot'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>AI Assistant</span>
              </Link>
            </nav>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
