import { PlayerManagement } from '../components/PlayerManagement';
import { Layout } from '../components/Layout';

type Tab = 'players' | 'generator' | 'stats';

interface PlayersPageProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function PlayersPage({ activeTab, setActiveTab }: PlayersPageProps) {
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <PlayerManagement />
    </Layout>
  );
} 