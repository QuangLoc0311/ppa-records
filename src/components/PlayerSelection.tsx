import { Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../types';

interface PlayerSelectionProps {
  players: Player[];
  selectedPlayers: Set<string>;
  onPlayerToggle: (playerId: string) => void;
  onSelectAll: () => void;
}

export function PlayerSelection({ 
  players, 
  selectedPlayers, 
  onPlayerToggle, 
  onSelectAll 
}: PlayerSelectionProps) {
  const selectedPlayersList = players.filter(player => selectedPlayers.has(player.id));

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Select Players</h3>
            <p className="text-sm text-gray-600">Choose which players will participate in this session</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-blue-700">
                {selectedPlayersList.length} of {players.length} selected
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {selectedPlayers.size === players.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No players available</p>
            <p className="text-gray-400 text-sm">Add players first to start generating matches</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => {
              const isSelected = selectedPlayers.has(player.id);
              return (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isSelected={isSelected}
                  onClick={onPlayerToggle}
                  variant="selection"
                  showScore={true}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlayerSelection; 