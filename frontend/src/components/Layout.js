import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  DollarSign,
  Brain,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  GitBranch,
  Mail,
  FileSearch,
  MessageSquare,
  Plug,
  BarChart3,
  Building2,
  Shield,
  FolderKanban,
  Briefcase
} from 'lucide-react';

const Layout = ({ user, onLogout, children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'CRM', path: '/crm', icon: Users },
    { name: 'CPQ', path: '/cpq', icon: FileText },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Financial', path: '/financial', icon: DollarSign },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', path: '/ai', icon: Brain },
    { name: 'Workflows', path: '/workflows', icon: GitBranch },
    { name: 'Email AI', path: '/email', icon: Mail },
    { name: 'Documents', path: '/documents', icon: FileSearch },
    { name: 'Team', path: '/collaboration', icon: MessageSquare },
    { name: 'Integrations', path: '/integrations', icon: Plug },
    { name: 'Industry', path: '/industry', icon: Building2 },
    { name: 'Compliance', path: '/compliance', icon: Shield },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'HR', path: '/hr', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex flex-col items-center">
              <div className="w-48 h-40 flex items-center justify-center -mb-4">
                <img 
                  src="https://customer-assets.emergentagent.com/job_powerstack-crm/artifacts/vmahta5p_Photoroom_005_20250925_011212.PNG" 
                  alt="Agentix AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Agentix AI
                </h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                      data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="p-3 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl mb-3">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{user?.email}</p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="w-full justify-start gap-2 mb-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              data-testid="theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              data-testid="mobile-menu-button"
            >
              {sidebarOpen ? <X className="w-6 h-6 dark:text-gray-200" /> : <Menu className="w-6 h-6 dark:text-gray-200" />}
            </button>
            <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-300">
              Welcome back, <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
