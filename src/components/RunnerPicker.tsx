'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Users, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRunnersList, getRunnersByYearData, getAvailableYearsData } from '@/lib/actions';

interface RunnerPickerProps {
  onSelectRunner?: (name: string) => void;
  onSelectMultiple?: (names: string[]) => void;
  allowMultiple?: boolean;
  maxSelections?: number;
  selectedRunners?: string[];
  className?: string;
  year?: number;
  onYearChange?: (year: number) => void;
}

export function RunnerPicker({ 
  onSelectRunner, 
  onSelectMultiple,
  allowMultiple = false,
  maxSelections = 7,
  selectedRunners = [],
  className = '',
  year,
  onYearChange
}: RunnerPickerProps) {
  const [runners, setRunners] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(selectedRunners);
  const [selectedYear, setSelectedYear] = useState<number | null>(year || null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState<boolean>(allowMultiple);
  const router = useRouter();

  // Load available years on mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await getAvailableYearsData();
        setAvailableYears(years);
        if (years.length > 0 && selectedYear === null) {
          const newYear = years[0];
          setSelectedYear(newYear);
          onYearChange?.(newYear);
        }
      } catch (error) {
        console.error('Failed to load years:', error);
      }
    };
    loadYears();
  }, []);

  // Load runners when year changes
  useEffect(() => {
    const fetchRunners = async () => {
      if (selectedYear === null) return;
      
      setIsLoading(true);
      try {
        const runnersList = await getRunnersByYearData(selectedYear);
        setRunners(runnersList);
      } catch (error) {
        console.error('Failed to fetch runners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRunners();
  }, [selectedYear]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  const handleCompareModeToggle = () => {
    setCompareMode(!compareMode);
    if (!compareMode) {
      // Switching to compare mode - keep current selections
    } else {
      // Switching to single mode - clear selections and keep only first one
      if (selected.length > 0) {
        setSelected([selected[0]]);
      }
    }
  };

  const filteredRunners = runners.filter(runner =>
    runner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRunnerClick = (runner: string) => {
    if (compareMode) {
      const newSelected = selected.includes(runner)
        ? selected.filter(r => r !== runner)
        : [...selected, runner];
      
      setSelected(newSelected);
      onSelectMultiple?.(newSelected);
    } else {
      onSelectRunner?.(runner);
      router.push(`/runner/${encodeURIComponent(runner)}`);
    }
  };

  const handleCompare = () => {
    if (selected.length >= 2) {
      const queryParams = selected.map(name => encodeURIComponent(name)).join(',');
      router.push(`/compare?names=${queryParams}`);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              {compareMode ? 'Select Runners to Compare' : 'Find a Runner'}
            </h3>
            <p className="text-sm text-blue-700">
              {compareMode 
                ? 'Choose any number of runners to compare their performance'
                : 'Click on a runner to view their detailed stats'
              }
            </p>
          </div>

          {/* Compare Mode Toggle */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleCompareModeToggle}
              className="flex items-center gap-2 p-3 rounded-lg border-2 border-blue-300 hover:border-blue-500 transition-colors bg-white"
            >
              {compareMode ? (
                <ToggleRight className="h-6 w-6 text-blue-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm font-medium text-blue-700">
                {compareMode ? 'Compare Mode' : 'Single Mode'}
              </span>
            </button>
          </div>

          {/* Year Selection */}
          {availableYears.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <Select 
                value={selectedYear?.toString() || ''} 
                onValueChange={(value) => handleYearChange(parseInt(value))}
              >
                <SelectTrigger className="w-32 border-blue-300 focus:border-blue-600">
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              placeholder="Search runners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-blue-300 focus:border-blue-600 focus:ring-blue-600 rounded-lg"
            />
          </div>

          {/* Selected Runners */}
          {compareMode && selected.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Selected ({selected.length})
                  </span>
                </div>
                {compareMode && selected.length >= 2 && (
                  <Button 
                    onClick={handleCompare}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
                  >
                    Compare Runners
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.map(runner => (
                  <Badge 
                    key={runner} 
                    variant="secondary" 
                    className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
                    onClick={() => handleRunnerClick(runner)}
                  >
                    <User className="h-3 w-3 mr-1" />
                    {runner}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Runners Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-blue-800">
                {searchQuery ? `Search Results (${filteredRunners.length})` : `All Runners (${runners.length})`}
              </h4>
            </div>
            
            <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
              {filteredRunners.map(runner => {
                const isSelected = selected.includes(runner);
                
                return (
                  <Button
                    key={runner}
                    variant="ghost"
                    className={`justify-start h-auto p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 text-blue-900 shadow-md'
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleRunnerClick(runner)}
                  >
                    <div className="flex items-center w-full">
                      <div className={`p-2 rounded-full mr-3 ${
                        isSelected 
                          ? 'bg-blue-200 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-sm">{runner}</span>
                        {isSelected && compareMode && (
                          <div className="text-xs text-blue-600 mt-1">Selected</div>
                        )}
                        {!compareMode && (
                          <div className="text-xs text-gray-500 mt-1">Click to view stats</div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* No Results */}
          {filteredRunners.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No runners found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
