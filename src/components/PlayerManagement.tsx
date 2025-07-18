import { useState, useEffect } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Player, Gender } from '../types';
import { playerService, type CreatePlayerData } from '../services';

export function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    avatar_url: '',
    gender: 'male' as Gender,
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name) return;

    try {
      const playerData: CreatePlayerData = {
        name: newPlayer.name,
        avatar_url: newPlayer.avatar_url,
        gender: newPlayer.gender,
      };

      const data = await playerService.createPlayer(playerData);
      setPlayers([data, ...players]);
      setNewPlayer({ name: '', avatar_url: '', gender: 'male' });
      setIsAddingPlayer(false);
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
      await playerService.deletePlayer(playerId);
      setPlayers(players.filter(player => player.id !== playerId));
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Player Management</h2>
        <Button onClick={() => setIsAddingPlayer(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {isAddingPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <Select
                  value={newPlayer.gender}
                  onChange={(e) => setNewPlayer({ ...newPlayer, gender: e.target.value as Gender })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avatar URL (optional)</label>
                <Input
                  value={newPlayer.avatar_url}
                  onChange={(e) => setNewPlayer({ ...newPlayer, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addPlayer}>Add Player</Button>
              <Button variant="outline" onClick={() => setIsAddingPlayer(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <Card key={player.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{player.name}</h3>
                  <p className="text-sm text-gray-600">
                    {player.gender}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    Score: {player.score}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deletePlayer(player.id)}
                  className="absolute top-2 right-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {players.length === 0 && !isAddingPlayer && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players yet</h3>
            <p className="text-gray-600 mb-4">Add your first player to get started</p>
            <Button onClick={() => setIsAddingPlayer(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 