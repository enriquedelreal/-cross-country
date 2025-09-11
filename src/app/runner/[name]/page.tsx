import { notFound } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { RacesTable } from '@/components/RacesTable';
import { TrendChart } from '@/components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { getRunnerData, getRunnersList } from '@/lib/actions';
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

export default async function RunnerPage({ params }: RunnerPageProps) {
  const { name } = await params;
  const runnerName = decodeURIComponent(name);
  
  try {
    const runnerData = await getRunnerData(runnerName);
    
    if (!runnerData || runnerData.races.length === 0) {
      notFound();
    }

    const { races, best3miSec, avg3miSec, lastRace, improvementPctFromSeasonStart } = runnerData;
  
  // Calculate additional stats
  const firstRace = races[0];
  const latestRace = races[races.length - 1];
  const improvementPct = improvementPctFromSeasonStart || 0;

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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-4">
            <StatCard
              title="Best Time"
              value={formatTime(best3miSec)}
              subtitle="3-mile equivalent"
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
            />
            
            <StatCard
              title="Average Time"
              value={formatTime(avg3miSec)}
              subtitle="Season average"
              className="bg-gradient-to-br from-green-50 to-green-100 border-green-300"
            />
            
            <StatCard
              title="Latest Race"
              value={formatTime(lastRace.equiv3miSec)}
              subtitle={lastRace.raceName}
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
                  data={races.map(race => ({
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
                <RacesTable races={races} runnerName={runnerName} />
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