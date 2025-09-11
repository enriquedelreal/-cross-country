import { notFound } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { RacesTable } from '@/components/RacesTable';
import { TrendChart } from '@/components/TrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import { getRunnerData } from '@/lib/actions';
import { formatTime, formatImprovementPct } from '@/lib/format';
import Link from 'next/link';

interface RunnerPageProps {
  params: {
    name: string;
  };
}

export default async function RunnerPage({ params }: RunnerPageProps) {
  const { name } = await params;
  const runnerName = decodeURIComponent(name);
  
  try {
    const runnerData = await getRunnerData(runnerName);
    
    if (runnerData.races.length === 0) {
      notFound();
    }

    const { races, best3miSec, avg3miSec, lastRace, improvementPctFromSeasonStart } = runnerData;
    
    // Calculate additional stats
    const firstRace = races[0];
    const totalRaces = races.length;
    const latestVsBest = lastRace && best3miSec ? lastRace.equiv3miSec - best3miSec : 0;

    // Prepare chart data
    const chartData = races.map(race => ({
      date: race.raceDate,
      value: race.equiv3miSec,
      raceName: race.raceName,
      rawTime: race.timeRaw,
      distance: race.distanceMi
    }));

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
                  <h1 className="text-3xl font-bold text-gray-900">{runnerName}</h1>
                  <p className="text-gray-600 mt-1">Individual performance tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {totalRaces} races
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Key Stats */}
              <div className="space-y-4">
                <StatCard
                  title="Season Best"
                  value={best3miSec ? formatTime(best3miSec) : 'N/A'}
                  subtitle="3-mile equivalent"
                  className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                />
                
                <StatCard
                  title="Latest Race"
                  value={lastRace ? formatTime(lastRace.equiv3miSec) : 'N/A'}
                  subtitle={lastRace ? lastRace.raceName : 'No races'}
                  delta={latestVsBest}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                />
                
                <StatCard
                  title="Improvement"
                  value={formatImprovementPct(improvementPctFromSeasonStart || 0)}
                  subtitle="First to latest race"
                  improvementPct={improvementPctFromSeasonStart || 0}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                />
                
                <StatCard
                  title="Average Time"
                  value={avg3miSec ? formatTime(avg3miSec) : 'N/A'}
                  subtitle="3-mile equivalent"
                  className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                />
              </div>

              {/* Race Summary */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Race Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Races:</span>
                      <span className="font-medium">{totalRaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">First Race:</span>
                      <span className="font-medium">{firstRace.raceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Latest Race:</span>
                      <span className="font-medium">{lastRace?.raceName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Best Race:</span>
                      <span className="font-medium">
                        {races.find(r => r.equiv3miSec === best3miSec)?.raceName || 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Charts and Tables */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Performance Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart 
                    data={chartData}
                    title=""
                    yAxisLabel="3-mile Equivalent Time"
                  />
                </CardContent>
              </Card>

              {/* Races Table */}
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <RacesTable 
                    races={races}
                    runnerName={runnerName}
                  />
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
