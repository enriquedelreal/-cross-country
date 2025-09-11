'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/format';
import { getTeamTrendData } from '@/lib/actions';
import { TeamTrendPoint } from '@/lib/types';

interface RaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRace: (race: TeamTrendPoint) => void;
  year?: number;
}

export function RaceSelectorModal({ isOpen, onClose, onSelectRace, year }: RaceSelectorModalProps) {
  const [races, setRaces] = useState<TeamTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadRaces = async () => {
        setIsLoading(true);
        try {
          const raceData = await getTeamTrendData(year);
          setRaces(raceData);
        } catch (error) {
          console.error('Failed to load races:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadRaces();
    }
  }, [isOpen, year]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Race for Team Average</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading races...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {races.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No races available for {year || 'selected year'}
              </div>
            ) : (
              races.map((race, index) => (
                <div
                  key={race.date}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectRace(race);
                    onClose();
                  }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">{race.raceName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(race.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {race.participantCount} runner{race.participantCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(race.avg3miSec)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Team Average
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
