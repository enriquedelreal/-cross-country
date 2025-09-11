export type RaceRow = {
  runner: string;
  raceDate: string; // ISO
  raceName: string;
  timeRaw: string;  // e.g. "15:38.30"
  distanceMi: number; // e.g. 3 or 3.11 or 2.9
  seconds: number;     // parsed seconds from timeRaw
  equiv3miSec: number; // computed if needed
};

export type RunnerSummary = {
  runner: string;
  races: RaceRow[];
  best3miSec: number | null;
  avg3miSec: number | null;
  lastRace?: RaceRow;
  improvementPctFromSeasonStart?: number | null;
};

export type TeamTrendPoint = {
  date: string;
  avg3miSec: number;
  raceName: string;
  participantCount: number;
};

export type TopSevenEntry = {
  runner: string;
  seasonBest: string; // formatted time
  latestTime: string; // formatted time
  deltaFromLatest: number; // seconds
  isLocked?: boolean;
};

export type MostImprovedEntry = {
  runner: string;
  improvementPct: number;
  firstRace: string;
  latestRace: string;
  firstTime: string;
  latestTime: string;
};

export type ComparisonEntry = {
  runner: string;
  seasonBest: string;
  lastRace: string;
  avg3miSec: string;
  improvementPct: number;
};
