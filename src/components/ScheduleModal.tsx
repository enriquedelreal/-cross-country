'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, FileText, X, Globe } from 'lucide-react';
import { AthleticCalendar } from './AthleticCalendar';

interface Race {
  name: string;
  date: string;
  location?: string;
  notes?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  races: Race[];
}

export function ScheduleModal({ isOpen, onClose, races }: ScheduleModalProps) {
  const [viewMode, setViewMode] = useState<'local' | 'athletic'>('local');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const raceDate = new Date(dateString);
    const diffTime = raceDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Past';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getDaysUntilColor = (dateString: string) => {
    const today = new Date();
    const raceDate = new Date(dateString);
    const diffTime = raceDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'bg-gray-100 text-gray-600';
    if (days === 0) return 'bg-red-100 text-red-700';
    if (days <= 7) return 'bg-orange-100 text-orange-700';
    if (days <= 30) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Calendar className="h-5 w-5 text-blue-600" />
            2025 Race Schedule
          </DialogTitle>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={viewMode === 'local' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('local')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Local Schedule
            </Button>
            <Button
              variant={viewMode === 'athletic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('athletic')}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Athletic.net Calendar
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {viewMode === 'athletic' ? (
            <AthleticCalendar schoolId="16117" season="2025" />
          ) : races.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p>No upcoming races scheduled</p>
            </div>
          ) : (
            races.map((race, index) => (
              <div
                key={`${race.date}-${race.name}`}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {race.name}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDaysUntilColor(race.date)}`}
                      >
                        {getDaysUntil(race.date)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{formatDate(race.date)}</span>
                      </div>
                      
                      {race.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>{race.location}</span>
                        </div>
                      )}
                      
                      {race.notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-gray-500">{race.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
