'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { RacesTable } from '@/components/RacesTable';
import { TrendChart } from '@/components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { getRunnerData, getRunnersList, getAvailableYearsData } from '@/lib/actions';
import { formatTime, formatImprovementPct } from '@/lib/format';
import Link from 'next/link';

interface RunnerPageProps {
  params: {
    name: string;
  };
}

export async function generateStaticParams() {
  // Return empty array to disable static generation
  // This allows the page to be generated at request time
  return [];
}

export default function RunnerPage({ params }: RunnerPageProps) {
  const [runnerName, setRunnerName] = useState<string>('');
  const [runnerData, setRunnerData] = useState<any>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { name } = await params;
        const decodedName = decodeURIComponent(name);
        setRunnerName(decodedName);

        const [data, years] = await Promise.all([
          getRunnerData(decodedName),
          getAvailableYearsData()
        ]);

        if (!data || data.races.length === 0) {
          setError('Runner not found');
          return;
        }

        setRunnerData(data);
        setAvailableYears(years);
        
        // Set to most recent year by default
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (err) {
        console.error('Error loading runner data:', err);
        setError('Failed to load runner data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params]);

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
    notFound();
  }

  // Filter races by selected year
  const filteredRaces = selectedYear 
    ? runnerData.races.filter((race: any) => new Date(race.raceDate).getFullYear() === selectedYear)
    : runnerData.races;

  // Calculate stats based on filtered races
  const best3miSec = filteredRaces.length > 0 ? Math.min(...filteredRaces.map((race: any) => race.equiv3miSec)) : 0;
  const avg3miSec = filteredRaces.length > 0 ? filteredRaces.reduce((sum: number, race: any) => sum + race.equiv3miSec, 0) / filteredRaces.length : 0;
  const lastRace = filteredRaces.length > 0 ? filteredRaces[filteredRaces.length - 1] : null;
  
  // Calculate improvement percentage for filtered races
  const improvementPct = filteredRaces.length > 1 
    ? ((filteredRaces[0].equiv3miSec - filteredRaces[filteredRaces.length - 1].equiv3miSec) / filteredRaces[0].equiv3miSec) * 100
    : 0;
  
  // Calculate additional stats
  const firstRace = filteredRaces[0];
  const latestRace = filteredRaces[filteredRaces.length - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{runnerName}</h1>
                <p className="text-sm text-gray-600">Runner Profile</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={selectedYear?.toString() || "all"} onValueChange={(value) => setSelectedYear(value === "all" ? null : parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-4">
            <StatCard
              title="Best Time"
              value={best3miSec > 0 ? formatTime(best3miSec) : "N/A"}
              subtitle="3-mile equivalent"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
            />
            
            <StatCard
              title="Average Time"
              value={avg3miSec > 0 ? formatTime(avg3miSec) : "N/A"}
              subtitle="Season average"
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-300"
            />
            
            <StatCard
              title="Latest Race"
              value={lastRace ? formatTime(lastRace.equiv3miSec) : "N/A"}
              subtitle={lastRace ? lastRace.raceName : "No races"}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300"
            />
            
            <StatCard
              title="Improvement"
              value={formatImprovementPct(improvementPct)}
              subtitle="Since season start"
              improvementPct={improvementPct}
              className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
            />
          </div>

          {/* Right Column - Charts and Tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <Card className="shadow-sm border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TrendChart 
                  data={filteredRaces.map(race => ({
                    date: race.raceDate,
                    value: race.equiv3miSec,
                    raceName: race.raceName
                  }))}
                  title=""
                  yAxisLabel="3-mile Equivalent Time"
                />
              </CardContent>
            </Card>

            {/* Races Table */}
            <Card className="shadow-sm border-blue-200">
              <CardHeader className="bg-blue-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Race History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRaces.length > 0 ? (
                  <RacesTable races={filteredRaces} runnerName={runnerName} />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No races found</p>
                    <p className="text-sm">
                      {selectedYear 
                        ? `No races found for ${selectedYear}` 
                        : 'No races available'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
  } catch (error) {
    console.error('Error fetching runner data:', error);
    notFound();
  }
}