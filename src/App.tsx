import { useState } from 'react';
import { PlayersPage } from './pages/PlayersPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { RecordingPage } from './pages/RecordingPage';
import { StatsPage } from './pages/StatsPage';

type Tab = 'players' | 'generator' | 'recording' | 'stats';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('players');

  const renderContent = () => {
    switch (activeTab) {
      case 'players':
        return <PlayersPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'generator':
        return <GeneratorPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'recording':
        return <RecordingPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'stats':
        return <StatsPage activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <PlayersPage activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return renderContent();
}

export default App;
