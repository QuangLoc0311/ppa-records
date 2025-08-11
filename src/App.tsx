import { useEffect, useState } from 'react';
import { PlayersPage } from './pages/PlayersPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { StatsPage } from './pages/StatsPage';
import { authService } from './services/authService';
import type { User } from './types';
import Login from './pages/LoginPage';

type Tab = 'players' | 'generator' | 'stats';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('players');

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return <PlayersPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'generator':
        return <GeneratorPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'stats':
        return <StatsPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <PlayersPage activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">PPA Records</h1>
              
              {/* Navigation tabs */}
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('players')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'players'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Players
                </button>
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'generator'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'stats'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Stats
                </button>
              </nav>
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user.display_name || user.username}!
              </div>
              <button
                onClick={() => authService.logout()}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;