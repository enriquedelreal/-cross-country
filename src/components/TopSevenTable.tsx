'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar } from 'lucide-react';
import { TopSevenEntry } from '@/lib/types';
import { formatDelta } from '@/lib/format';
import { getTopSevenData, getAvailableYearsData } from '@/lib/actions';

interface TopSevenTableProps {
  data: TopSevenEntry[];
  className?: string;
}

export function TopSevenTable({ data, className = '' }: TopSevenTableProps) {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [topSevenData, setTopSevenData] = useState<TopSevenEntry[]>(data);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load available years
    const loadYears = async () => {
      try {
        const years = await getAvailableYearsData();
        setAvailableYears(years);
        if (years.length > 0 && selectedYear === null) {
          setSelectedYear(years[0]); // Set to most recent year by default
        }
      } catch (error) {
        console.error('Failed to load available years:', error);
      }
    };
    loadYears();
  }, []);

  useEffect(() => {
    // Load top seven data when year changes
    const loadTopSeven = async () => {
      if (selectedYear !== null) {
        setIsLoading(true);
        try {
          const data = await getTopSevenData(selectedYear);
          setTopSevenData(data);
        } catch (error) {
          console.error('Failed to load top seven data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadTopSeven();
  }, [selectedYear]);

  const handleRunnerClick = (runner: string) => {
    router.push(`/runner/${encodeURIComponent(runner)}`);
  };

  if (topSevenData.length === 0 && !isLoading) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        {selectedYear ? `No top seven data available for ${selectedYear}` : 'No top seven data available'}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Top Seven</h3>
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select
                value={selectedYear?.toString() || ''}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Runner</TableHead>
              <TableHead>Season Best</TableHead>
              <TableHead>Latest Time</TableHead>
              <TableHead>vs Latest</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              topSevenData.map((entry, index) => {
                const { text: deltaText, isPositive } = formatDelta(entry.deltaFromLatest);
                
                return (
                  <TableRow key={entry.runner}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">#{index + 1}</span>
                        {index < 3 && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleRunnerClick(entry.runner)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                      >
                        {entry.runner}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        {entry.seasonBest}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.latestTime}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isPositive ? "destructive" : "default"} 
                        className="text-xs"
                      >
                        {deltaText}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
