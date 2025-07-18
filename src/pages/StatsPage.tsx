import { useState, useEffect } from 'react';
import { BarChart3, Trophy, TrendingUp, Users } from 'lucide-react';
import { Layout } from '../components/Layout';
import { MatchCard } from '../components/MatchCard';
import { Card, CardContent } from '../components/ui/card';
import type { Player, UIMatch } from '../types';
import { playerService, matchService } from '../services';

type Tab = 'players' | 'generator' | 'stats';

interface StatsPageProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function StatsPage({ activeTab, setActiveTab }: StatsPageProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [recentMatches, setRecentMatches] = useState<UIMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [playersData, matchesData] = await Promise.all([
        playerService.getPlayersByScore(),
        matchService.getRecentMatches(20)
      ]);
      setPlayers(playersData);
      setRecentMatches(matchesData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopPlayers = () => {
    return players.slice(0, 5);
  };

  const getMatchStats = () => {
    const totalMatches = recentMatches.length;
    const completedMatches = recentMatches.filter(m => m.winner !== null).length;
    const avgScore = totalMatches > 0 
      ? recentMatches.reduce((sum, m) => sum + m.team1Score + m.team2Score, 0) / totalMatches 
      : 0;

    return { totalMatches, completedMatches, avgScore };
  };

  const stats = getMatchStats();

  if (isLoading) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Statistics & History</h2>
          <p className="text-gray-600 mt-1">Track player performance and match history</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Players</p>
                  <p className="text-2xl font-bold text-blue-800">{players.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Total Matches</p>
                  <p className="text-2xl font-bold text-green-800">{stats.totalMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.completedMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Score</p>
                  <p className="text-2xl font-bold text-orange-800">{stats.avgScore.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Players */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top Players</h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No players found</p>
            ) : (
              <div className="space-y-3">
                {getTopPlayers().map((player, index) => (
                  <div key={player.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{player.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{player.gender}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{player.score}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Matches</h3>
            {recentMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No matches recorded yet</p>
            ) : (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    variant="compact" 
                    showActions={false}
                    showScores={true}
                    className="shadow-sm"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 