import { useState } from 'react';
import { Users, Zap, BarChart3, Menu, X } from 'lucide-react';

type Tab = 'players' | 'generator' | 'stats';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'players' as Tab, label: 'Players', icon: Users },
    { id: 'generator' as Tab, label: 'Session Planner', icon: Zap },
    { id: 'stats' as Tab, label: 'Statistics', icon: BarChart3 },
  ];

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">P</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Pickleball Match Tracker
              </h1>
            </div>
            
            {/* Desktop subtitle */}
            <div className="hidden sm:block text-sm text-gray-500">
              AI-Powered Matchmaking
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center space-x-3 py-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden sm:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>Pickleball Match Tracker - AI-Powered Matchmaking System</p>
            <p className="mt-1">Built with React, TypeScript, and Supabase</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 