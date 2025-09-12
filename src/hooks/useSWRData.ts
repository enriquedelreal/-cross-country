import useSWR from 'swr';
import { 
  getAvailableYearsData, 
  getTopSevenData, 
  getMostImprovedData, 
  getTeamTrendData, 
  getUpcomingRacesData, 
  getRacesByYearData,
  getRunnersByYearData,
  getRunnerData
} from '@/lib/actions';
import { TopSevenEntry, MostImprovedEntry, TeamTrendPoint, RunnerSummary } from '@/lib/types';

// SWR fetcher function
const fetcher = (fn: () => Promise<any>) => fn();

// Custom hooks for each data type
export function useAvailableYears() {
  const { data, error, isLoading, mutate } = useSWR('available-years', () => fetcher(getAvailableYearsData), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 seconds
  });
  
  return {
    years: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useTopSeven(year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? ['top-seven', year] : null,
    () => fetcher(() => getTopSevenData(year)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    topSeven: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useMostImproved(year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? ['most-improved', year] : null,
    () => fetcher(() => getMostImprovedData(year)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    mostImproved: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useTeamTrends(year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? ['team-trends', year] : null,
    () => fetcher(() => getTeamTrendData(year)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    teamTrends: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useUpcomingRaces() {
  const { data, error, isLoading, mutate } = useSWR('upcoming-races', () => fetcher(getUpcomingRacesData), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
  });
  
  return {
    races: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useUpcomingRacesByYear(year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? ['upcoming-races-by-year', year] : null,
    () => fetcher(() => getRacesByYearData(year!)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return {
    races: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useRunnersByYear(year?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? ['runners-by-year', year] : 'all-runners',
    () => fetcher(() => getRunnersByYearData(year)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    runners: data || [],
    isLoading,
    error,
    mutate
  };
}

export function useRunnerData(name: string) {
  const { data, error, isLoading, mutate } = useSWR(
    name ? ['runner', name] : null,
    () => fetcher(() => getRunnerData(name)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return {
    runnerData: data,
    isLoading,
    error,
    mutate
  };
}

// Combined hook for dashboard data
export function useDashboardData(selectedYear: number | null) {
  const { years, isLoading: yearsLoading } = useAvailableYears();
  const { races: upcomingRaces, isLoading: racesLoading } = useUpcomingRacesByYear(selectedYear || undefined);
  const { runners: allRunners, isLoading: runnersLoading } = useRunnersByYear();
  
  const { topSeven, isLoading: topSevenLoading } = useTopSeven(selectedYear || undefined);
  const { mostImproved, isLoading: mostImprovedLoading } = useMostImproved(selectedYear || undefined);
  const { teamTrends, isLoading: teamTrendsLoading } = useTeamTrends(selectedYear || undefined);
  
  const isLoading = yearsLoading || racesLoading || runnersLoading || 
    topSevenLoading || mostImprovedLoading || teamTrendsLoading;
  
  return {
    years,
    upcomingRaces,
    allRunners,
    topSeven,
    mostImproved,
    teamTrends,
    isLoading
  };
}
