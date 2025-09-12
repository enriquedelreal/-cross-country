'use client';

import { useState, useEffect } from 'react';
import { RunnerPicker } from '@/components/RunnerPicker';
import { TopSevenTable } from '@/components/TopSevenTable';
import { TrendChart } from '@/components/TrendChart';
import { StatCard } from '@/components/StatCard';
import { RaceSelectorModal } from '@/components/RaceSelectorModal';
import { ScheduleModal } from '@/components/ScheduleModal';
import { SkeletonCard, SkeletonTable, SkeletonChart, SkeletonRunnerPicker } from '@/components/SkeletonLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, TrendingUp, Printer, Clock, Search } from 'lucide-react';
import { getTopSevenData, getMostImprovedData, getTeamTrendData, getAvailableYearsData, getUpcomingRacesData, getRunnersByYearData } from '@/lib/actions';
import { formatTime, formatImprovementPct } from '@/lib/format';
import { TopSevenEntry, MostImprovedEntry, TeamTrendPoint } from '@/lib/types';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [topSeven, setTopSeven] = useState<TopSevenEntry[]>([]);
  const [mostImproved, setMostImproved] = useState<MostImprovedEntry[]>([]);
  const [teamTrends, setTeamTrends] = useState<TeamTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<TeamTrendPoint | null>(null);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [nextRace, setNextRace] = useState<{name: string, date: string, location?: string, notes?: string} | null>(null);
  const [allUpcomingRaces, setAllUpcomingRaces] = useState<{name: string, date: string, location?: string, notes?: string}[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [allRunners, setAllRunners] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load available years on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load years first, then other data
        const years = await getAvailableYearsData();
        setAvailableYears(years);
        
        if (years.length > 0) {
          setSelectedYear(years[0]); // Set to most recent year
        }
        
        // Load other data in parallel after years are set
        console.log('Loading additional data...');
        const [races, runners] = await Promise.all([
          getUpcomingRacesData(),
          getRunnersByYearData()
        ]);
        console.log('Additional data loaded successfully');
        
        setAllRunners(runners);
        setAllUpcomingRaces(races);
        
        // Set the next upcoming race
        if (races.length > 0) {
          setNextRace(races[0]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to hardcoded race if sheet fails
        calculateNextRace();
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Load data when year changes
  useEffect(() => {
    if (selectedYear === null) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [topSevenData, mostImprovedData, teamTrendsData, runnersData] = await Promise.all([
          getTopSevenData(selectedYear),
          getMostImprovedData(selectedYear),
          getTeamTrendData(selectedYear),
          getRunnersByYearData(selectedYear)
        ]);
        setTopSeven(topSevenData);
        setMostImproved(mostImprovedData);
        setTeamTrends(teamTrendsData);
        setAllRunners(runnersData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

  const latestTrend = teamTrends[teamTrends.length - 1];
  const avgImprovement = mostImproved.length > 0 
    ? mostImproved.reduce((sum, runner) => sum + runner.improvementPct, 0) / mostImproved.length 
    : 0;

  const handleTeamAverageClick = () => {
    setIsRaceModalOpen(true);
  };

  const handleRaceSelect = (race: TeamTrendPoint) => {
    setSelectedRace(race);
  };

  const handlePrintRunnerReport = (runnerName: string) => {
    // Open runner page in new window for printing
    const runnerUrl = `/runner/${encodeURIComponent(runnerName)}`;
    const printWindow = window.open(runnerUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const calculateNextRace = () => {
    // This would typically come from your data, but for now we'll use a placeholder
    const today = new Date();
    const nextRaceDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    setNextRace({
      name: "State Championships",
      date: nextRaceDate.toISOString().split('T')[0]
    });
  };

  const getDaysUntilNextRace = () => {
    if (!nextRace) return 0;
    const today = new Date();
    const raceDate = new Date(nextRace.date);
    const diffTime = raceDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const displayTrend = selectedRace || latestTrend;
  
  // Filter runners based on search query
  const filteredRunners = allRunners.filter(runner =>
    runner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                <img 
                  src="/logo_Ravis-Township-HSD-web.png" 
                  alt="Reavis R Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  Reavis Cross Country
                </h1>
                <p className="text-blue-700 mt-1 font-medium">Once a Ram, Always a Ram!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm border-blue-300 text-blue-700">
                Season {selectedYear || 'Loading...'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            {isLoading ? (
              <SkeletonRunnerPicker />
            ) : (
              <RunnerPicker 
                allowMultiple={true}
                className="h-fit"
                year={selectedYear || undefined}
                onYearChange={setSelectedYear}
              />
            )}
            
            {/* Next Race Countdown */}
            {nextRace && selectedYear && selectedYear >= new Date().getFullYear() ? (
              <Card 
                className="border-blue-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
                onClick={() => setIsScheduleModalOpen(true)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Next Race
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {getDaysUntilNextRace()}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">days until</div>
                    <div className="text-sm font-medium text-gray-900">{nextRace.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(nextRace.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-blue-500 mt-2 hover:text-blue-700">
                      Click to view full schedule
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Next Race
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center text-xs text-gray-500">
                    Loading race dates...
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Print Reports */}
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                  <Printer className="h-4 w-4 text-blue-600" />
                  Print Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-3">
                    Print individual runner reports
                  </p>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search runners..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Runners List */}
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filteredRunners.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-2">
                        {searchQuery ? 'No runners found' : `No runners available (${allRunners.length} total)`}
                      </div>
                    ) : (
                      filteredRunners.slice(0, 10).map((runner, index) => (
                        <button
                          key={runner}
                          onClick={() => handlePrintRunnerReport(runner)}
                          className="w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-gray-700">{runner}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Team Overview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Team Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <StatCard
                    title="Team Average"
                    value={displayTrend ? formatTime(displayTrend.avg3miSec) : 'N/A'}
                    subtitle={`${selectedRace ? 'Selected' : 'Latest'}: ${displayTrend?.raceName || 'No races'}`}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover:border-blue-400"
                    clickable={teamTrends.length > 0}
                    onClick={handleTeamAverageClick}
                  />
                  <StatCard
                    title="Best Time"
                    value={topSeven[0]?.seasonBest || 'N/A'}
                    subtitle={topSeven[0]?.runner || 'No data'}
                    className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 hover:border-blue-500"
                  />
                  <StatCard
                    title="Avg Improvement"
                    value={formatImprovementPct(avgImprovement)}
                    subtitle="Season to date"
                    improvementPct={avgImprovement}
                    className="bg-gradient-to-br from-blue-200 to-blue-300 border-blue-500 hover:border-blue-600"
                  />
                </>
              )}
            </div>

            {/* Top Seven Table */}
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <Card className="shadow-sm border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    Top Seven
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopSevenTable data={topSeven} />
                </CardContent>
              </Card>
            )}

            {/* Most Improved */}
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <Card className="shadow-sm border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Most Improved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mostImproved.length > 0 ? (
                    <div className="space-y-3">
                      {mostImproved.map((runner) => (
                        <div key={runner.runner} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{runner.runner}</div>
                            <div className="text-sm text-gray-600">
                              {runner.firstRace} → {runner.latestRace}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="text-sm">
                              {formatImprovementPct(runner.improvementPct)}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {runner.firstTime} → {runner.latestTime}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">No improvement data available</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Team Trends Chart */}
            {isLoading ? (
              <SkeletonChart />
            ) : (
              <Card className="shadow-sm border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5 text-blue-600" />
                    Team Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamTrends.length > 0 ? (
                    <TrendChart 
                      data={teamTrends.map(trend => ({
                        date: trend.date,
                        value: trend.avg3miSec,
                        raceName: trend.raceName,
                        participantCount: trend.participantCount
                      }))}
                      title=""
                      yAxisLabel="Average 3-mile Equivalent"
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-8">No team trends data available</div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Race Selector Modal */}
      <RaceSelectorModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
        onSelectRace={handleRaceSelect}
        year={selectedYear || undefined}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        races={allUpcomingRaces}
      />
    </div>
  );
}
