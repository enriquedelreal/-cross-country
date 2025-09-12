'use server';

import { 
  getAllRows, 
  getRunners, 
  getRunnerSummary, 
  getManyRunnerSummaries,
  getTopNByBest3Mi,
  searchRaces,
  getTeamTrends,
  getTopSeven,
  getMostImproved,
  getAvailableYears,
  getUpcomingRaces,
  getRacesByYear,
  getRunnersByYear
} from './sheets';
import { RaceRow, RunnerSummary, TeamTrendPoint, TopSevenEntry, MostImprovedEntry } from './types';

export async function getAllRaces(): Promise<RaceRow[]> {
  return getAllRows();
}

export async function getRunnersList(): Promise<string[]> {
  return getRunners();
}

export async function getRunnerData(name: string): Promise<RunnerSummary> {
  return getRunnerSummary(name);
}

export async function getMultipleRunners(names: string[]): Promise<RunnerSummary[]> {
  return getManyRunnerSummaries(names);
}

export async function getTopRunners(n: number = 7): Promise<RunnerSummary[]> {
  return getTopNByBest3Mi(n);
}

export async function searchRacesData(query: string): Promise<RaceRow[]> {
  return searchRaces(query);
}

export async function getTeamTrendData(year?: number): Promise<TeamTrendPoint[]> {
  return getTeamTrends(year);
}

export async function getTopSevenData(year?: number): Promise<TopSevenEntry[]> {
  return getTopSeven(year);
}

export async function getMostImprovedData(year?: number): Promise<MostImprovedEntry[]> {
  return getMostImproved(year);
}

export async function getAvailableYearsData(): Promise<number[]> {
  return getAvailableYears();
}

export async function getUpcomingRacesData(): Promise<{name: string, date: string, location?: string, notes?: string}[]> {
  return getUpcomingRaces();
}

export async function getRunnersByYearData(year?: number): Promise<string[]> {
  return getRunnersByYear(year);
}

export async function getRacesByYearData(year: number): Promise<{name: string, date: string, location?: string, notes?: string}[]> {
  return getRacesByYear(year);
}
