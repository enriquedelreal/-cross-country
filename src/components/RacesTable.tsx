'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Trophy, Download } from 'lucide-react';
import { RaceRow } from '@/lib/types';
import { formatTime, formatDelta, getPacePerMile } from '@/lib/format';

interface RacesTableProps {
  races: RaceRow[];
  runnerName: string;
  className?: string;
}

type SortField = 'raceDate' | 'raceName' | 'seconds' | 'equiv3miSec';
type SortDirection = 'asc' | 'desc';

export function RacesTable({ races, runnerName, className = '' }: RacesTableProps) {
  const [sortField, setSortField] = useState<SortField>('raceDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRaces = [...races].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === 'raceDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getBestTime = () => {
    return Math.min(...races.map(race => race.equiv3miSec));
  };

  const getPreviousRaceTime = (currentIndex: number) => {
    if (currentIndex === 0) return null;
    return sortedRaces[currentIndex - 1].equiv3miSec;
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Race', 'Time', '3-mi Equiv', 'Pace/Mile', 'vs Previous', 'vs Best'];
    const csvContent = [
      headers.join(','),
      ...sortedRaces.map((race, index) => {
        const date = new Date(race.raceDate).toLocaleDateString();
        const pace = getPacePerMile(race.seconds, race.distanceMi);
        const previousTime = getPreviousRaceTime(index);
        const bestTime = getBestTime();
        
        const vsPrevious = previousTime ? race.equiv3miSec - previousTime : '';
        const vsBest = race.equiv3miSec - bestTime;
        
        return [
          date,
          `"${race.raceName}"`,
          race.timeRaw,
          formatTime(race.equiv3miSec),
          pace,
          vsPrevious ? formatTime(Math.abs(vsPrevious)) : '',
          formatTime(Math.abs(vsBest))
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${runnerName.replace(/\s+/g, '_')}_races.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (races.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No races found for {runnerName}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Race History</h3>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('raceDate')}
                  className="h-auto p-0 font-semibold text-xs"
                >
                  Date {getSortIcon('raceDate')}
                </Button>
              </TableHead>
              <TableHead className="w-32 px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('raceName')}
                  className="h-auto p-0 font-semibold text-xs"
                >
                  Race {getSortIcon('raceName')}
                </Button>
              </TableHead>
              <TableHead className="w-20 px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('seconds')}
                  className="h-auto p-0 font-semibold text-xs"
                >
                  Time {getSortIcon('seconds')}
                </Button>
              </TableHead>
              <TableHead className="w-20 px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('equiv3miSec')}
                  className="h-auto p-0 font-semibold text-xs"
                >
                  3-mi {getSortIcon('equiv3miSec')}
                </Button>
              </TableHead>
              <TableHead className="w-16 px-2 py-2 text-xs">Pace</TableHead>
              <TableHead className="w-20 px-2 py-2 text-xs">vs Prev</TableHead>
              <TableHead className="w-16 px-2 py-2 text-xs">vs Best</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRaces.map((race, index) => {
              const isBest = race.equiv3miSec === getBestTime();
              const previousTime = getPreviousRaceTime(index);
              const bestTime = getBestTime();
              const vsPrevious = previousTime ? race.equiv3miSec - previousTime : null;
              const vsBest = race.equiv3miSec - bestTime;
              
              return (
                <TableRow key={`${race.raceDate}-${race.raceName}`}>
                  <TableCell className="px-2 py-2 text-xs">
                    {new Date(race.raceDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs font-medium truncate max-w-32" title={race.raceName}>
                    {race.raceName}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-mono">{race.timeRaw}</span>
                      {isBest && (
                        <Badge variant="default" className="text-xs px-1 py-0">
                          <Trophy className="h-2 w-2 mr-0.5" />
                          PR
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs font-mono">
                    {formatTime(race.equiv3miSec)}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs font-mono">
                    {getPacePerMile(race.seconds, race.distanceMi)}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs">
                    {vsPrevious !== null && (
                      <Badge 
                        variant={vsPrevious < 0 ? "default" : "destructive"} 
                        className="text-xs px-1 py-0"
                      >
                        {formatDelta(vsPrevious).text}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-xs">
                    <Badge 
                      variant={vsBest === 0 ? "default" : "secondary"} 
                      className="text-xs px-1 py-0"
                    >
                      {vsBest === 0 ? 'Best' : formatDelta(vsBest).text}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
