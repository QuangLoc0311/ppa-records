import { Card, CardContent } from './ui/card';
import { MatchCard } from './MatchCard';
import type { UIMatch } from '../types';

interface SessionProgressProps {
  sessionMatches: UIMatch[];
  onSaveMatchResult: (match: UIMatch, team1Score: number, team2Score: number) => void;
}

export function SessionProgress({ sessionMatches, onSaveMatchResult }: SessionProgressProps) {
  const completedMatches = sessionMatches.filter(m => m.winner).length;
  const totalMatches = sessionMatches.length;

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Session Progress</h3>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {completedMatches} of {totalMatches} completed
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
          ></div>
        </div>

        <div className="space-y-4">
          {sessionMatches.map((match) => (
            <div key={match.id} className="relative">
              <MatchCard 
                match={match} 
                variant="compact" 
                showActions={true}
                showScores={true}
                onSaveResult={onSaveMatchResult}
                className={''}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionProgress; 