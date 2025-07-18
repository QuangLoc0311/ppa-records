import { MatchRecording } from '../components/MatchRecording';
import { Layout } from '../components/Layout';

type Tab = 'players' | 'generator' | 'recording' | 'stats';

interface RecordingPageProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function RecordingPage({ activeTab, setActiveTab }: RecordingPageProps) {
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <MatchRecording />
    </Layout>
  );
} 