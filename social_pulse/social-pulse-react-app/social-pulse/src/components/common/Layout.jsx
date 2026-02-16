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
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutUser } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dataset', icon: Database, label: 'Dataset Studio' },
    { path: '/refinery', icon: Sparkles, label: 'Refinery' },
    { path: '/eda', icon: FileText, label: 'EDA' },
    { path: '/insights', icon: LineChart, label: 'Insights Lab' },
    { path: '/ml', icon: Brain, label: 'ML Studio' },
    { path: '/vision', icon: BarChart3, label: 'Vision Deck' },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-midnight-dark text-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col border-r border-white/10 bg-midnight-darker/50 backdrop-blur-xl relative z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex-shrink-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg whitespace-nowrap"
              >
                Social Pulse
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white'
                  : 'hover:bg-white/5 text-white/60 hover:text-white'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/5 border-l-2 border-neon-blue"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-neon-blue' : 'group-hover:text-white transition-colors'}`} />

                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-medium relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-all ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          {/* Background Blobs */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-blue/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
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
