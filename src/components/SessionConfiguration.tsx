import { Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface SessionConfigurationProps {
  sessionMinutes: number;
  matchDuration: number;
  onSessionMinutesChange: (minutes: number) => void;
  onMatchDurationChange: (minutes: number) => void;
  onGenerateSession: () => void;
  isGenerating: boolean;
  showGenerateButton: boolean;
  disabled: boolean;
}

export function SessionConfiguration({
  sessionMinutes,
  matchDuration,
  onSessionMinutesChange,
  onMatchDurationChange,
  onGenerateSession,
  isGenerating,
  showGenerateButton,
  disabled
}: SessionConfigurationProps) {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
      <CardContent className="p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Session Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-1">
              <label className="text-sm font-semibold text-gray-700">Session Duration</label>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={sessionMinutes}
                  onChange={e => onSessionMinutesChange(Number(e.target.value))}
                  className="w-full h-[45px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">min</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col h-full">
            <div className="space-y-3 flex-1">
              <label className="text-sm font-semibold text-gray-700">Match Duration</label>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={matchDuration}
                  onChange={e => onMatchDurationChange(Number(e.target.value))}
                  className="w-full h-[45px] px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">min</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center h-full text-center">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Total Matches</p>
              <div className="h-[45px] flex items-center justify-center">
                <p className="text-4xl font-bold text-gray-700">{Math.floor(sessionMinutes / matchDuration)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end h-full">
            {showGenerateButton && (
              <Button 
                onClick={onGenerateSession} 
                disabled={disabled}
                className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full h-[45px] shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Session'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionConfiguration; 