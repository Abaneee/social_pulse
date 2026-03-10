import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  LineChart,
  Brain,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser, theme, toggleTheme } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const menuItems = [
    { path: '/dataset', icon: Database, label: 'Dataset Studio' },
    { path: '/refinery', icon: Sparkles, label: 'Refinery' },
    { path: '/eda', icon: FileText, label: 'EDA' },
    { path: '/insights', icon: LineChart, label: 'Insights Lab' },
    { path: '/ml', icon: Brain, label: 'ML Studio' },
    { path: '/vision', icon: BarChart3, label: 'Vision Deck' },
    { path: '/mis-dashboard', icon: LayoutDashboard, label: 'MIS Report' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const NavItem = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <button
        key={item.path}
        onClick={() => {
          navigate(item.path);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
          ? (isDark ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white' : 'bg-blue-600/10 text-blue-700')
          : (isDark ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900')
          }`}
      >
        {isActive && (
          <motion.div
            layoutId={isMobile ? "activeTabMobile" : "activeTabDesktop"}
            className={`absolute inset-0 border-l-2 ${isDark ? 'bg-white/5 border-blue-500' : 'bg-blue-600/5 border-blue-600'}`}
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'group-hover:text-blue-500 transition-colors'}`} />

        {(isSidebarOpen || isMobile) && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-bold text-sm relative z-10 whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </button>
    );
  };

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/5 text-yellow-400' : 'hover:bg-slate-100 text-slate-700'
        } ${!isSidebarOpen && 'justify-center'}`}
    >
      {isDark ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5 text-blue-600" />}
      {isSidebarOpen && <span className="font-bold text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
    </button>
  );

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`hidden md:flex flex-col border-r relative z-20 ${isDark ? 'border-white/5 bg-slate-900/50 backdrop-blur-xl' : 'border-slate-200 bg-white shadow-xl'
          }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-lg tracking-tighter"
              >
                SOCIAL<span className="text-blue-600">PULSE</span>
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        <div className={`p-4 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all ${isDark ? 'text-slate-500' : 'text-slate-400'} ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Top Nav */}
      <div className={`md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-xl border-b z-40 flex items-center justify-between px-6 ${isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200 shadow-sm'
        }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-black tracking-tighter">SOCIAL<span className="text-blue-600">PULSE</span></span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`p-2 rounded-lg ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'}`}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-[280px] z-[60] md:hidden flex flex-col border-r ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="font-black tracking-tighter">SOCIAL<span className="text-blue-600">PULSE</span></span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                  <NavItem key={item.path} item={item} isMobile={true} />
                ))}
              </nav>

              <div className={`p-4 border-t space-y-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col pt-16 md:pt-0">
        {/* Top Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex-shrink-0" />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          {/* Background Blobs */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-blue-600/5' : 'bg-blue-400/5'}`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-purple-600/5' : 'bg-purple-400/5'}`} />
          </div>

          <div className="relative z-10 p-4 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="max-w-7xl mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};


export default Layout;
