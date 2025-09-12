'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/StatCard';
import { RacesTable } from '@/components/RacesTable';
import { TrendChart } from '@/components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { formatTime, formatImprovementPct } from '@/lib/format';
import { useRunnerData, useAvailableYears } from '@/hooks/useSWRData';
import Link from 'next/link';

interface RunnerPageClientProps {
  runnerName: string;
}

export default function RunnerPageClient({ runnerName }: RunnerPageClientProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Use SWR for data fetching
  const { runnerData, isLoading, error } = useRunnerData(runnerName);
  const { years: availableYears } = useAvailableYears();

  // Set initial year when data loads
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading runner data...</p>
        </div>
      </div>
    );
  }

  if (error || !runnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Runner Not Found</h1>
          <p className="text-gray-600 mb-4">The runner "{runnerName}" could not be found.</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter races by selected year
  const filteredRaces = selectedYear 
    ? runnerData.races.filter((race: any) => new Date(race.raceDate).getFullYear() === selectedYear)
    : runnerData.races;

  return (
    <div className="min-h-screen bg-gray-50 print-min-h-screen print-bg-gray-50" data-testid="runner-data-loaded">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 print-border-b print-border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 print-px-1 print-py-1">
          <div className="flex items-center justify-between print-flex print-justify-between">
            <div className="flex items-center gap-4 print-flex print-items-center print-gap-1">
              <Link href="/" className="print-hidden">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print-text-lg print-font-bold print-text-gray-900">{runnerData.runner}</h1>
                <p className="text-gray-600 mt-1 hidden">Individual Performance Report</p>
              </div>
            </div>
            <div className="flex items-center gap-2 hidden">
              <Badge variant="outline" className="text-sm print-badge print-badge-default">
                <Trophy className="h-3 w-3 mr-1 print-h-3 print-w-3" />
                {runnerData.races.length} races
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print-px-1 print-py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print-grid-cols-2 print-gap-2">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6 print-space-y-1 print-col-span-1">
            {/* Year Selector - Hidden in print */}
            <Card className="shadow-sm print-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Filter by Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedYear?.toString() || 'all'} 
                  onValueChange={(value) => setSelectedYear(value === 'all' ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year: number) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="space-y-4 print-space-y-1 print-grid print-grid-cols-2 print-gap-1">
              <StatCard
                title="Season Best"
                value={runnerData.best3miSec ? formatTime(runnerData.best3miSec) : 'N/A'}
                subtitle="3-mile equivalent"
                className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 print-bg-blue-50 print-border-blue-300"
              />
              <StatCard
                title="Average Time"
                value={runnerData.avg3miSec ? formatTime(runnerData.avg3miSec) : 'N/A'}
                subtitle="All races"
                className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 print-bg-green-50 print-border-green-300"
              />
              <StatCard
                title="Improvement"
                value={formatImprovementPct(runnerData.improvementPctFromSeasonStart || 0)}
                subtitle="Season to date"
                improvementPct={runnerData.improvementPctFromSeasonStart || 0}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 print-bg-yellow-50 print-border-yellow-300 print-col-span-2"
              />
            </div>
          </div>

          {/* Right Column - Charts and Tables */}
          <div className="lg:col-span-2 space-y-6 print-col-span-1 print-space-y-1">
            {/* Performance Trend Chart */}
            <Card className="shadow-sm print-shadow-sm print-border print-rounded">
              <CardHeader className="print-p-1 hidden">
                <CardTitle className="flex items-center gap-2 print-flex print-items-center print-gap-1 print-text-xs print-font-semibold">
                  <TrendingUp className="h-5 w-5 text-green-500 print-h-3 print-w-3" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 print-p-1">
                <div className="print-chart">
                  <TrendChart 
                    data={filteredRaces.map((race: any) => ({
                      date: race.raceDate,
                      value: race.equiv3miSec,
                      raceName: race.raceName
                    }))}
                    title=""
                    yAxisLabel="3-mile Equivalent Time"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Races Table */}
            <Card className="shadow-sm print-shadow-sm print-border print-rounded print-avoid-break">
              <CardHeader className="print-p-1 hidden">
                <CardTitle className="flex items-center gap-2 print-flex print-items-center print-gap-1 print-text-xs print-font-semibold">
                  <Trophy className="h-5 w-5 text-yellow-500 print-h-3 print-w-3" />
                  Race Results
                </CardTitle>
              </CardHeader>
              <CardContent className="print-p-1">
                <RacesTable 
                  races={filteredRaces}
                  runnerName={runnerData.runner}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

