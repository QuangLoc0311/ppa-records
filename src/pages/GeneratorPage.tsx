import { MatchGenerator } from '../components/MatchGenerator';
import { Layout } from '../components/Layout';

type Tab = 'players' | 'generator' | 'recording' | 'stats';

interface GeneratorPageProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function GeneratorPage({ activeTab, setActiveTab }: GeneratorPageProps) {
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <MatchGenerator />
    </Layout>
  );
} 