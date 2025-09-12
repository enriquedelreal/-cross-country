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
import { formatTime, formatImprovementPct } from '@/lib/format';
import { TopSevenEntry, MostImprovedEntry, TeamTrendPoint } from '@/lib/types';
import { useDashboardData } from '@/hooks/useSWRData';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedRace, setSelectedRace] = useState<TeamTrendPoint | null>(null);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [printingRunner, setPrintingRunner] = useState<string | null>(null);

  // Use SWR for data fetching
  const {
    years: availableYears,
    upcomingRaces: allUpcomingRaces,
    allRunners,
    topSeven,
    mostImproved,
    teamTrends,
    isLoading
  } = useDashboardData(selectedYear);

  // Set initial year when data loads
  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Get next race
  const nextRace = allUpcomingRaces.length > 0 ? allUpcomingRaces[0] : null;


  const latestTrend = teamTrends[teamTrends.length - 1];
  const avgImprovement = mostImproved.length > 0 
    ? mostImproved.reduce((sum: number, runner: any) => sum + runner.improvementPct, 0) / mostImproved.length 
    : 0;

  const handleTeamAverageClick = () => {
    setIsRaceModalOpen(true);
  };

  const handleRaceSelect = (race: TeamTrendPoint) => {
    setSelectedRace(race);
  };

  const handlePrintRunnerReport = (runnerName: string) => {
    setPrintingRunner(runnerName);
    
    // Open runner page in new window for printing
    const runnerUrl = `/runner/${encodeURIComponent(runnerName)}`;
    const printWindow = window.open(runnerUrl, '_blank');
    if (printWindow) {
      // Wait for the page to fully load and data to be available
      const checkForData = () => {
        try {
          // Check if the page has loaded and data is available
          const isDataLoaded = printWindow.document.querySelector('[data-testid="runner-data-loaded"]') ||
                              printWindow.document.querySelector('.animate-spin') === null; // No loading spinner
          
          if (isDataLoaded) {
            // Small delay to ensure rendering is complete
            setTimeout(() => {
              printWindow.print();
              setPrintingRunner(null); // Clear loading state
            }, 500);
          } else {
            // Check again in 100ms
            setTimeout(checkForData, 100);
          }
        } catch (error) {
          // If we can't access the document yet, wait and try again
          setTimeout(checkForData, 100);
        }
      };
      
      printWindow.onload = () => {
        // Start checking for data after the page loads
        setTimeout(checkForData, 100);
      };
      
      printWindow.onerror = (error) => {
        console.error('Error loading print window:', error);
        setPrintingRunner(null); // Clear loading state on error
      };
      
      // Clear loading state if window is closed
      printWindow.addEventListener('beforeunload', () => {
        setPrintingRunner(null);
      });
    } else {
      console.error('Failed to open print window - popup blocked?');
      setPrintingRunner(null); // Clear loading state on error
    }
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
  const filteredRunners = allRunners.filter((runner: string) =>
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
            
            {/* Next Race Countdown / Schedule */}
            {nextRace && selectedYear ? (
              <Card 
                className="border-blue-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
                onClick={() => setIsScheduleModalOpen(true)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    {selectedYear >= new Date().getFullYear() ? `Next Race - ${selectedYear}` : `Race Schedule - ${selectedYear}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {selectedYear >= new Date().getFullYear() ? (
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
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {allUpcomingRaces.length}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">races in {selectedYear}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {allUpcomingRaces.length > 0 ? allUpcomingRaces[0].name : 'No races'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {allUpcomingRaces.length > 0 ? new Date(allUpcomingRaces[0].date).toLocaleDateString() : ''}
                      </div>
                      <div className="text-xs text-blue-500 mt-2 hover:text-blue-700">
                        Click to view {selectedYear} schedule
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : selectedYear && allUpcomingRaces.length === 0 ? (
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Race Schedule - {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center text-xs text-gray-500">
                    No races scheduled for {selectedYear}
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
                      filteredRunners.slice(0, 10).map((runner: string, index: number) => (
                        <button
                          key={runner}
                          onClick={() => handlePrintRunnerReport(runner)}
                          disabled={printingRunner === runner}
                          className="w-full text-left p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">{runner}</span>
                            {printingRunner === runner && (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            )}
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
                  <TopSevenTable data={topSeven} year={selectedYear || undefined} onYearChange={setSelectedYear} />
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
                      {mostImproved.map((runner: any) => (
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
                      data={teamTrends.map((trend: any) => ({
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
        year={selectedYear || undefined}
      />
    </div>
  );
}
