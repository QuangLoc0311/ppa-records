import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, XCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { Player, Gender } from '../types';
import { playerService, storageService, type CreatePlayerData } from '../services';
import UserAvatar from './UserAvatar';

export function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    skillLevel: 3.0,
    gender: 'male' as Gender
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (file: File) => {
    setUploadError('');
    
    // Validate file
    const validation = storageService.validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToStorage = async (): Promise<string | undefined> => {
    if (!uploadedImage) return undefined;

    setIsUploading(true);
    try {
      const imageUrl = await storageService.uploadImage(uploadedImage, 'avatars');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload image first if there's one
      let finalImageUrl = formData.avatar_url;
      if (uploadedImage) {
        const uploadedUrl = await uploadImageToStorage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          return; // Don't proceed if upload failed
        }
      }

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
          avatar_url: finalImageUrl || undefined,
          gender: formData.gender,
          score: formData.skillLevel,
        };
        await playerService.createPlayer(playerData);
        setIsAdding(false);
      }
      setFormData({ name: '', avatar_url: '', skillLevel: 3.0, gender: 'male' });
      setUploadedImage(null);
      setImagePreview('');
      setUploadError('');
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
    setImagePreview('');
    setUploadedImage(null);
    setUploadError('');
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
    setFormData({ name: '', avatar_url: '', skillLevel: 5.0, gender: 'male' });
    setUploadedImage(null);
    setImagePreview('');
    setUploadError('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold"> Player Management</h2>

          <p className="text-gray-600 mt-1">Manage your pickleball players and their profiles</p>
        </div>
        {!isAdding && !editingId && (
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Player' : 'Add New Player'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {editingId ? 'Update player information' : 'Create a new player profile'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    placeholder="Enter player name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Profile Picture
                </label>
                
                {/* Image Preview */}
                {(imagePreview || formData.avatar_url) && (
                  <div className="relative inline-block">
                    <div className="relative">
                      <img
                        src={imagePreview || formData.avatar_url}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                {!imagePreview && !formData.avatar_url && (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 py-8 rounded-xl"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Choose Image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WebP up to 5MB
                          </p>
                        </div>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Upload Error */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {uploadError}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Skill Level (0-10)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.skillLevel}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setFormData({ 
                          ...formData, 
                          skillLevel: isNaN(value) ? 0 : Math.max(0, Math.min(10, value))
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="5.0"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      /10
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto py-3"
                  disabled={isUploading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : (editingId ? 'Update Player' : 'Add Player')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit} 
                  className="w-full sm:w-auto py-3 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Players</h3>
            <p className="text-gray-600 mt-1">{players.length} player{players.length !== 1 ? 's' : ''} in your roster</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            {players.length} Total
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card key={player.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Player Avatar */}
                    <div className="relative">
                      <UserAvatar user={player} size="lg" />
                      
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg sm:text-xl truncate text-gray-800 group-hover:text-blue-600 transition-colors">
                        {player.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          player.gender === 'male' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {player.gender}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(player)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(player.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Skill Level</span>
                    <span className="text-lg font-bold text-blue-600">{player.score.toFixed(1)}</span>
                  </div>
                  
                  {/* Skill Level Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(player.score / 10) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {player.score < 3 ? 'Beginner' : 
                     player.score < 6 ? 'Intermediate' : 
                     player.score < 8 ? 'Advanced' : 'Expert'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {players.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-blue-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No players yet</h3>
              <p className="text-gray-600 mb-6">Add your first player to start building your pickleball roster</p>
              <Button 
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Player
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 