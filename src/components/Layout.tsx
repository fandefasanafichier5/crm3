import React from 'react';
import { Home, Users, Clock, Plus, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'contacts' | 'orders' | 'products' | 'timeline';
  onTabChange: (tab: 'dashboard' | 'contacts' | 'orders' | 'products' | 'timeline') => void;
  onNewNote: () => void;
  onVendorSettings: () => void;
  onMigrateToFirebase: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onNewNote, onVendorSettings, onMigrateToFirebase }) => {
  const tabs = [
    { id: 'dashboard' as const, label: 'Tableau de bord', icon: BarChart3 },
    { id: 'contacts' as const, label: 'Clients', icon: Users },
    { id: 'orders' as const, label: 'Commandes', icon: ShoppingCart },
    { id: 'products' as const, label: 'Produits', icon: Package },
    { id: 'timeline' as const, label: 'Mémoire', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Connections</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your personal relationship journal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu />
              <button
                onClick={onMigrateToFirebase}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 text-sm"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Migrer vers Firebase</span>
              </button>
              <button
                onClick={onVendorSettings}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Paramètres</span>
              </button>
              <button
                onClick={onNewNote}
                className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter une note</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-20 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'bg-sage-600/20 text-sage-600 dark:text-sage-400 border-sage-600 dark:border-sage-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;