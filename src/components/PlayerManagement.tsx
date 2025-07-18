import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { Player, Gender } from '../types';
import { playerService, type CreatePlayerData } from '../services';

export function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    skillLevel: 1000,
    gender: 'male' as Gender
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // For now, we'll just update the score since updatePlayer doesn't exist
        const currentPlayer = players.find(p => p.id === editingId);
        if (currentPlayer && formData.skillLevel !== currentPlayer.score) {
          const scoreChange = formData.skillLevel - currentPlayer.score;
          await playerService.updatePlayerScore(editingId, scoreChange);
        }
        setEditingId(null);
      } else {
        const playerData: CreatePlayerData = {
          name: formData.name,
          avatar_url: formData.avatar_url || undefined,
          gender: formData.gender,
        };
        await playerService.createPlayer(playerData);
        setIsAdding(false);
      }
      setFormData({ name: '', avatar_url: '', skillLevel: 1000, gender: 'male' });
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      avatar_url: player.avatar_url || '',
      skillLevel: player.score,
      gender: player.gender
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await playerService.deletePlayer(id);
        fetchPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', avatar_url: '', skillLevel: 1000, gender: 'male' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Player Management</h2>
        {!isAdding && !editingId && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-800">
                {editingId ? 'Edit Player' : 'Add New Player'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter player name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Avatar URL (optional)</label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Skill Level (Score)</label>
                  <input
                    type="number"
                    min="0"
                    max="3000"
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Player' : 'Add Player'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">Players ({players.length})</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <Card key={player.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg sm:text-xl truncate">{player.name}</h4>
                    {player.avatar_url && (
                      <p className="text-sm text-gray-600 truncate">Avatar: {player.avatar_url}</p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(player)}
                      className="text-blue-600 hover:text-blue-800 p-1 sm:p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(player.id)}
                      className="text-red-600 hover:text-red-800 p-1 sm:p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className="ml-1 font-semibold text-blue-600">{player.score}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <span className="ml-1 font-semibold capitalize">{player.gender}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {players.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No players found. Add your first player to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 