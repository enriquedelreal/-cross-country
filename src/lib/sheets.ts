import { getSheetsClient } from './google';
import { RaceRow, RunnerSummary, TeamTrendPoint, TopSevenEntry, MostImprovedEntry } from './types';
import { parseTimeToSeconds, calculate3MiEquivalent, calculateImprovementPct, formatTime } from './format';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const WORKSHEET_NAME = process.env.GOOGLE_SHEETS_WORKSHEET || 'Sheet1';

if (!SPREADSHEET_ID) {
  throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is required');
}

// Simple in-memory cache with 30 second TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }
  
  return fetcher().then(data => {
    cache.set(key, { data, timestamp: now });
    return data;
  });
}

/**
 * Fetch all race data from Google Sheets
 */
export async function getAllRows(): Promise<RaceRow[]> {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${WORKSHEET_NAME}!A:K`, // Read columns A-K to get all data
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return [];
    }


    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows
      .map((row, index) => {
        try {
          // Based on your spreadsheet: A=Runner, B=Race Date, C=Race Name, D=Time, E=Seconds, F=Distance, G=Pace, H=Projected 3-mile, I=Improvement, J=3-mi equiv, K=Prev 3-mi equiv
          const [runner, raceDate, raceName, timeRaw, secondsRaw, distanceMi, paceRaw, projected3mi, improvement, equiv3miSecRaw, prevEquiv3miSecRaw] = row;
          
          if (!runner || !raceDate || !raceName || !timeRaw) {
            console.warn(`Skipping incomplete row ${index + 2}:`, row);
            return null;
          }

          // Use the Seconds column (E) if available, otherwise parse the Time column (D)
          let seconds: number;
          if (secondsRaw && !isNaN(parseFloat(secondsRaw.replace(/,/g, '')))) {
            // Remove commas from numbers like "2,181.69"
            seconds = parseFloat(secondsRaw.replace(/,/g, ''));
          } else {
            seconds = parseTimeToSeconds(timeRaw);
            if (isNaN(seconds)) {
              console.warn(`Invalid time format in row ${index + 2}:`, timeRaw);
              return null;
            }
          }

          // Parse distance - the data looks correct (3, 3.106855961, etc.)
          let distance: number;
          if (distanceMi && !isNaN(parseFloat(distanceMi))) {
            distance = parseFloat(distanceMi);
            // Check if it's reasonable for a cross country race (0.5 to 10 miles)
            if (distance < 0.5 || distance > 10) {
              console.warn(`Distance seems unreasonable in row ${index + 2}:`, distanceMi, 'skipping');
              return null;
            }
          } else {
            console.warn(`Invalid distance in row ${index + 2}:`, distanceMi);
            return null;
          }

          // Use provided 3-mile equivalent or calculate it
          let equiv3miSec: number;
          if (equiv3miSecRaw && !isNaN(parseFloat(equiv3miSecRaw.replace(/,/g, '')))) {
            // Remove commas from numbers like "2,181.69"
            equiv3miSec = parseFloat(equiv3miSecRaw.replace(/,/g, ''));
          } else {
            equiv3miSec = calculate3MiEquivalent(seconds, distance);
          }

          return {
            runner: runner.trim(),
            raceDate: new Date(raceDate).toISOString(),
            raceName: raceName.trim(),
            timeRaw: timeRaw.trim(),
            distanceMi: distance,
            seconds,
            equiv3miSec,
          };
        } catch (error) {
          console.warn(`Error parsing row ${index + 2}:`, error);
          return null;
        }
      })
      .filter((row): row is RaceRow => row !== null)
      .sort((a, b) => new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime());
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw new Error('Failed to fetch race data');
  }
}

/**
 * Get unique runner names
 */
export async function getRunners(): Promise<string[]> {
  const rows = await getAllRows();
  const runners = new Set(rows.map(row => row.runner));
  return Array.from(runners).sort();
}

/**
 * Get summary for a specific runner
 */
export async function getRunnerSummary(name: string): Promise<RunnerSummary> {
  const rows = await getAllRows();
  const runnerRaces = rows.filter(row => row.runner === name);
  
  if (runnerRaces.length === 0) {
    return {
      runner: name,
      races: [],
      best3miSec: null,
      avg3miSec: null,
    };
  }

  const best3miSec = Math.min(...runnerRaces.map(race => race.equiv3miSec));
  const avg3miSec = runnerRaces.reduce((sum, race) => sum + race.equiv3miSec, 0) / runnerRaces.length;
  const lastRace = runnerRaces[runnerRaces.length - 1];
  
  // Calculate improvement from first to latest race
  const firstRace = runnerRaces[0];
  const improvementPctFromSeasonStart = calculateImprovementPct(
    firstRace.equiv3miSec,
    lastRace.equiv3miSec
  );

  return {
    runner: name,
    races: runnerRaces,
    best3miSec,
    avg3miSec,
    lastRace,
    improvementPctFromSeasonStart,
  };
}

/**
 * Get summaries for multiple runners
 */
export async function getManyRunnerSummaries(names: string[]): Promise<RunnerSummary[]> {
  const promises = names.map(name => getRunnerSummary(name));
  return Promise.all(promises);
}

/**
 * Get top N runners by best 3-mile equivalent
 */
export async function getTopNByBest3Mi(n: number): Promise<RunnerSummary[]> {
  const rows = await getAllRows();
  const runnerMap = new Map<string, RaceRow[]>();
  
  // Group races by runner
  rows.forEach(race => {
    if (!runnerMap.has(race.runner)) {
      runnerMap.set(race.runner, []);
    }
    runnerMap.get(race.runner)!.push(race);
  });

  // Calculate best times and create summaries
  const summaries: RunnerSummary[] = [];
  for (const [runner, races] of runnerMap) {
    const best3miSec = Math.min(...races.map(race => race.equiv3miSec));
    const avg3miSec = races.reduce((sum, race) => sum + race.equiv3miSec, 0) / races.length;
    const lastRace = races[races.length - 1];
    
    const firstRace = races[0];
    const improvementPctFromSeasonStart = calculateImprovementPct(
      firstRace.equiv3miSec,
      lastRace.equiv3miSec
    );

    summaries.push({
      runner,
      races,
      best3miSec,
      avg3miSec,
      lastRace,
      improvementPctFromSeasonStart,
    });
  }

  // Sort by best 3-mile equivalent and return top N
  return summaries
    .sort((a, b) => (a.best3miSec || Infinity) - (b.best3miSec || Infinity))
    .slice(0, n);
}

/**
 * Search races by query string
 */
export async function searchRaces(query: string): Promise<RaceRow[]> {
  const rows = await getAllRows();
  const lowerQuery = query.toLowerCase();
  
  return rows.filter(race => 
    race.raceName.toLowerCase().includes(lowerQuery) ||
    race.runner.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get team trend data (average 3-mile equivalent by meet date)
 */
export async function getTeamTrends(year?: number): Promise<TeamTrendPoint[]> {
  const rows = await getAllRows();
  const meetMap = new Map<string, { total: number; count: number; raceName: string }>();
  
  rows.forEach(race => {
    // Filter by year if specified
    if (year && new Date(race.raceDate).getFullYear() !== year) {
      return;
    }
    
    const dateKey = race.raceDate.split('T')[0]; // Use date only
    if (!meetMap.has(dateKey)) {
      meetMap.set(dateKey, { total: 0, count: 0, raceName: race.raceName });
    }
    const meet = meetMap.get(dateKey)!;
    meet.total += race.equiv3miSec;
    meet.count += 1;
  });

  return Array.from(meetMap.entries())
    .map(([date, data]) => ({
      date,
      avg3miSec: data.total / data.count,
      raceName: data.raceName,
      participantCount: data.count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get top N runners by best 3-mile equivalent for a specific year
 */
export async function getTopNByBest3MiForYear(n: number, year: number): Promise<RunnerSummary[]> {
  const rows = await getAllRows();
  const runnerMap = new Map<string, RaceRow[]>();
  
  // Filter rows by year and group by runner
  rows.forEach(race => {
    const raceYear = new Date(race.raceDate).getFullYear();
    if (raceYear === year) {
      if (!runnerMap.has(race.runner)) {
        runnerMap.set(race.runner, []);
      }
      runnerMap.get(race.runner)!.push(race);
    }
  });

  // Calculate summaries for each runner
  const summaries: RunnerSummary[] = Array.from(runnerMap.entries()).map(([runner, races]) => {
    const sortedRaces = races.sort((a, b) => new Date(a.raceDate).getTime() - new Date(b.raceDate).getTime());
    const equiv3miTimes = sortedRaces.map(race => race.equiv3miSec).filter(time => time > 0);
    
    const best3miSec = equiv3miTimes.length > 0 ? Math.min(...equiv3miTimes) : null;
    const avg3miSec = equiv3miTimes.length > 0 ? equiv3miTimes.reduce((sum, time) => sum + time, 0) / equiv3miTimes.length : null;
    const lastRace = sortedRaces[sortedRaces.length - 1];
    
    return {
      runner,
      totalRaces: races.length,
      best3miSec,
      avg3miSec,
      lastRace,
      races: sortedRaces,
    };
  });

  // Sort by best 3-mile equivalent and return top N
  return summaries
    .filter(summary => summary.best3miSec !== null)
    .sort((a, b) => (a.best3miSec || Infinity) - (b.best3miSec || Infinity))
    .slice(0, n);
}

/**
 * Get available years from the data
 */
export async function getAvailableYears(): Promise<number[]> {
  return getCachedData('available-years', async () => {
    const rows = await getAllRows();
    const years = new Set<number>();
    
    rows.forEach(race => {
      const year = new Date(race.raceDate).getFullYear();
      years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  });
}

export async function getUpcomingRaces(): Promise<{name: string, date: string, location?: string, notes?: string}[]> {
  return getCachedData('upcoming-races', async () => {
    try {
      const sheets = getSheetsClient();
      
      // Read from "Race Dates" sheet, columns A:D
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Race Dates!A:D',
      });
      
      const rows = response.data.values;
      
      if (!rows || rows.length <= 1) {
        return []; // No data or just headers
      }
      
      // Skip header row, map to race objects
      const races = rows.slice(1).map((row: string[]) => ({
        name: row[0] || '',
        date: row[1] || '',
        location: row[2] || '',
        notes: row[3] || ''
      })).filter(race => race.name && race.date); // Only include races with name and date
      
      // Sort by date (upcoming first)
      return races.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error fetching upcoming races:', error);
      return [];
    }
  });
}

export async function getRunnersByYear(year?: number): Promise<string[]> {
  if (!year) return getRunners(); // Fallback to all runners if no year
  
  const rows = await getAllRows();
  const runners = new Set<string>();
  
  rows.forEach(race => {
    if (new Date(race.raceDate).getFullYear() === year) {
      runners.add(race.runner);
    }
  });
  
  return Array.from(runners).sort();
}

/**
 * Get top seven entries for dashboard
 */
export async function getTopSeven(year?: number): Promise<TopSevenEntry[]> {
  const topSeven = year 
    ? await getTopNByBest3MiForYear(7, year)
    : await getTopNByBest3Mi(7);
  
  return topSeven.map(summary => {
    const seasonBest = summary.best3miSec ? formatTime(summary.best3miSec) : 'N/A';
    const latestTime = summary.lastRace ? formatTime(summary.lastRace.equiv3miSec) : 'N/A';
    const deltaFromLatest = summary.best3miSec && summary.lastRace 
      ? summary.lastRace.equiv3miSec - summary.best3miSec 
      : 0;

    return {
      runner: summary.runner,
      seasonBest,
      latestTime,
      deltaFromLatest,
    };
  });
}

/**
 * Get most improved runners
 */
export async function getMostImproved(year?: number): Promise<MostImprovedEntry[]> {
  const rows = await getAllRows();
  const runnerMap = new Map<string, RaceRow[]>();
  
  // Group races by runner, filtering by year if specified
  rows.forEach(race => {
    // Filter by year if specified
    if (year && new Date(race.raceDate).getFullYear() !== year) {
      return;
    }
    
    if (!runnerMap.has(race.runner)) {
      runnerMap.set(race.runner, []);
    }
    runnerMap.get(race.runner)!.push(race);
  });

  const improved: MostImprovedEntry[] = [];
  
  for (const [runner, races] of runnerMap) {
    if (races.length < 2) continue; // Need at least 2 races to calculate improvement
    
    const firstRace = races[0];
    const lastRace = races[races.length - 1];
    const improvementPct = calculateImprovementPct(firstRace.equiv3miSec, lastRace.equiv3miSec);
    
    if (improvementPct > 0) { // Only include runners who improved
      improved.push({
        runner,
        improvementPct,
        firstRace: firstRace.raceName,
        latestRace: lastRace.raceName,
        firstTime: formatTime(firstRace.equiv3miSec),
        latestTime: formatTime(lastRace.equiv3miSec),
      });
    }
  }

  return improved
    .sort((a, b) => b.improvementPct - a.improvementPct)
    .slice(0, 3);
}
