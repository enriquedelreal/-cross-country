// Client-side data fetching for static export
import { demoRunners, demoRaces, demoRaceData } from './demo-data';
import { RaceRow, RunnerSummary, TeamTrendPoint, TopSevenEntry, MostImprovedEntry } from './types';

export async function getAllRaces(): Promise<RaceRow[]> {
  return demoRaceData;
}

export async function getRunnersList(): Promise<string[]> {
  return demoRunners;
}

export async function getRunnerData(name: string): Promise<RunnerSummary> {
  const runnerRaces = demoRaceData.filter(race => race.runner === name);
  
  if (runnerRaces.length === 0) {
    throw new Error(`Runner ${name} not found`);
  }

  const best3miSec = Math.min(...runnerRaces.map(race => race.equiv3miSec));
  const avg3miSec = runnerRaces.reduce((sum, race) => sum + race.equiv3miSec, 0) / runnerRaces.length;
  const lastRace = runnerRaces[runnerRaces.length - 1];
  
  return {
    runner: name,
    races: runnerRaces,
    best3miSec,
    avg3miSec,
    lastRace,
    improvementPctFromSeasonStart: 0
  };
}

export async function getMultipleRunners(names: string[]): Promise<RunnerSummary[]> {
  const results = [];
  for (const name of names) {
    try {
      const data = await getRunnerData(name);
      results.push(data);
    } catch (error) {
      console.error(`Error fetching data for ${name}:`, error);
    }
  }
  return results;
}

export async function getTopRunners(n: number = 7): Promise<RunnerSummary[]> {
  const allRunners = await getMultipleRunners(demoRunners);
  return allRunners
    .sort((a, b) => a.best3miSec - b.best3miSec)
    .slice(0, n)
    .map((runner, index) => ({
      runner: runner.runner,
      seasonBest: runner.best3miSec,
      latestTime: runner.lastRace.equiv3miSec,
      deltaFromLatest: runner.lastRace.equiv3miSec - runner.best3miSec
    }));
}

export async function searchRacesData(query: string): Promise<RaceRow[]> {
  return demoRaceData.filter(race => 
    race.raceName.toLowerCase().includes(query.toLowerCase()) ||
    race.runner.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getTeamTrendData(year?: number): Promise<TeamTrendPoint[]> {
  // Generate demo team trend data
  return [
    {
      date: "2024-09-15",
      raceName: "SSC Mega Meet",
      avg3miSec: 1200,
      participantCount: 6
    }
  ];
}

export async function getTopSevenData(year?: number): Promise<TopSevenEntry[]> {
  const topRunners = await getTopRunners(7);
  return topRunners.map((runner, index) => ({
    runner: runner.runner,
    seasonBest: runner.seasonBest,
    latestTime: runner.latestTime,
    deltaFromLatest: runner.deltaFromLatest
  }));
}

export async function getMostImprovedData(year?: number): Promise<MostImprovedEntry[]> {
  // Generate demo most improved data
  return [
    {
      runner: "Aaron Marquez",
      firstRace: "SSC Mega Meet",
      latestRace: "Mike Kuharic Invitational",
      firstTime: "32:49",
      latestTime: "36:21",
      improvementPct: 10.5
    }
  ];
}

export async function getAvailableYearsData(): Promise<number[]> {
  return [2024, 2025];
}

export async function getUpcomingRacesData(): Promise<{name: string, date: string, location?: string, notes?: string}[]> {
  return demoRaces;
}

export async function getRunnersByYearData(year?: number): Promise<string[]> {
  return demoRunners;
}
