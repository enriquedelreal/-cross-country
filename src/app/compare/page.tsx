'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CompareChart } from '@/components/CompareChart';
import { RunnerPicker } from '@/components/RunnerPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, BarChart3, Calendar } from 'lucide-react';
import { getMultipleRunners } from '@/lib/actions';
import { RunnerSummary, ComparisonEntry } from '@/lib/types';
import { formatTime, formatImprovementPct } from '@/lib/format';
import Link from 'next/link';

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedRunners, setSelectedRunners] = useState<string[]>([]);
  const [runnerData, setRunnerData] = useState<RunnerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'date' | 'raceIndex'>('date');

  useEffect(() => {
    const namesParam = searchParams.get('names');
    if (namesParam) {
      const names = namesParam.split(',').map(name => decodeURIComponent(name));
      setSelectedRunners(names);
      fetchRunnerData(names);
    }
  }, [searchParams]);

  const fetchRunnerData = async (names: string[]) => {
    if (names.length === 0) return;
    
    setIsLoading(true);
    try {
      const data = await getMultipleRunners(names);
      setRunnerData(data);
    } catch (error) {
      console.error('Failed to fetch runner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunnerSelection = (names: string[]) => {
    setSelectedRunners(names);
    if (names.length > 0) {
      const queryParams = names.map(name => encodeURIComponent(name)).join(',');
      router.push(`/compare?names=${queryParams}`);
    }
  };

  const prepareChartData = () => {
    if (runnerData.length === 0) return [];

    // Get all unique dates across all runners
    const allDates = new Set<string>();
    runnerData.forEach(runner => {
      runner.races.forEach(race => {
        allDates.add(race.raceDate);
      });
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map(date => {
      const dataPoint: Record<string, string | number | null> = { date };
      runnerData.forEach(runner => {
        const race = runner.races.find(r => r.raceDate === date);
        dataPoint[runner.runner] = race ? race.equiv3miSec : null;
      });
      return dataPoint;
    });
  };

  const prepareRaceIndexData = () => {
    if (runnerData.length === 0) return [];

    // Find the maximum number of races any runner has
    const maxRaces = Math.max(...runnerData.map(runner => runner.races.length));

    return Array.from({ length: maxRaces }, (_, index) => {
      const dataPoint: Record<string, string | number | null> = { raceIndex: index + 1 };
      runnerData.forEach(runner => {
        const race = runner.races[index];
        dataPoint[runner.runner] = race ? race.equiv3miSec : null;
      });
      return dataPoint;
    });
  };

  const getComparisonData = (): ComparisonEntry[] => {
    return runnerData.map(runner => ({
      runner: runner.runner,
      seasonBest: runner.best3miSec ? formatTime(runner.best3miSec) : 'N/A',
      lastRace: runner.lastRace ? formatTime(runner.lastRace.equiv3miSec) : 'N/A',
      avg3miSec: runner.avg3miSec ? formatTime(runner.avg3miSec) : 'N/A',
      improvementPct: runner.improvementPctFromSeasonStart || 0
    }));
  };

  const chartData = viewMode === 'date' ? prepareChartData() : prepareRaceIndexData();
  const comparisonData = getComparisonData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Runner Comparison</h1>
                <p className="text-gray-600 mt-1">Compare performance across multiple runners</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                {selectedRunners.length} runners
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Runner Selection */}
          <div className="lg:col-span-1">
            <RunnerPicker 
              allowMultiple={true}
              maxSelections={7}
              selectedRunners={selectedRunners}
              onSelectMultiple={handleRunnerSelection}
              className="h-fit"
            />
          </div>

          {/* Right Column - Comparison */}
          <div className="lg:col-span-3 space-y-6">
            {selectedRunners.length > 0 && (
              <>
                {/* View Mode Toggle */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Chart View</span>
                      </div>
                      <Select value={viewMode} onValueChange={(value: 'date' | 'raceIndex') => setViewMode(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              By Date
                            </div>
                          </SelectItem>
                          <SelectItem value="raceIndex">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              By Race Number
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison Chart */}
                {!isLoading && chartData.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Performance Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CompareChart 
                        data={chartData}
                        runners={selectedRunners}
                        title=""
                        yAxisLabel="3-mile Equivalent Time"
                        viewMode={viewMode}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Comparison Table */}
                {!isLoading && comparisonData.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        Comparison Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold">Runner</th>
                              <th className="text-left py-3 px-4 font-semibold">Season Best</th>
                              <th className="text-left py-3 px-4 font-semibold">Latest Race</th>
                              <th className="text-left py-3 px-4 font-semibold">Average</th>
                              <th className="text-left py-3 px-4 font-semibold">Improvement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonData.map((runner) => (
                              <tr key={runner.runner} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{runner.runner}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="default" className="text-xs">
                                    {runner.seasonBest}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">{runner.lastRace}</td>
                                <td className="py-3 px-4">{runner.avg3miSec}</td>
                                <td className="py-3 px-4">
                                  <Badge 
                                    variant={runner.improvementPct > 0 ? "default" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {formatImprovementPct(runner.improvementPct)}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {isLoading && (
                  <Card className="shadow-sm">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading runner data...</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Empty State */}
            {selectedRunners.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Runners to Compare</h3>
                  <p className="text-gray-600">
                    Choose up to 7 runners from the left panel to start comparing their performance.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}
