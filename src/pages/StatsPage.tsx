import { BarChart3 } from 'lucide-react';
import { Layout } from '../components/Layout';

type Tab = 'players' | 'generator' | 'recording' | 'stats';

interface StatsPageProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function StatsPage({ activeTab, setActiveTab }: StatsPageProps) {
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Statistics</h2>
        <div className="text-center p-12">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics Coming Soon</h3>
          <p className="text-gray-600">
            Player rankings, match history, and performance analytics will be available here.
          </p>
        </div>
      </div>
    </Layout>
  );
} 