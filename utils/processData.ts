import Papa from 'papaparse';

interface AttendanceData {
  Date: string;
  Jour: string;
  Entrees: string;
  Sorties: string;
}

interface YearlyStatistics {
  entriesByMonth: { [key: string]: number };
  saturdayEntriesByMonth: { [key: string]: number };
  eveningEntriesByMonth: { [key: string]: number };
}

interface Statistics {
  [year: number]: YearlyStatistics;
}

export function processCSV(csvContent: string): Statistics {
  const { data } = Papa.parse<AttendanceData>(csvContent, { header: true });
  
  const statistics: Statistics = {};

  data.forEach((row) => {
    if (!row.Date || !row.Jour || !row.Entrees || isNaN(Date.parse(row.Date)) || isNaN(parseInt(row.Entrees, 10))) {
      console.warn('Invalid row:', row);
      return;
    }

    const date = new Date(row.Date);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const entries = parseInt(row.Entrees, 10);
    const hour = date.getHours();

    if (!statistics[year]) {
      statistics[year] = {
        entriesByMonth: {},
        saturdayEntriesByMonth: {},
        eveningEntriesByMonth: {},
      };
    }

    // Total entries by month
    statistics[year].entriesByMonth[month] = (statistics[year].entriesByMonth[month] || 0) + entries;

    // Saturday entries by month
    if (row.Jour && row.Jour.toLowerCase() === 'samedi') {
      statistics[year].saturdayEntriesByMonth[month] = (statistics[year].saturdayEntriesByMonth[month] || 0) + entries;
    }

    // Evening entries by month (18:00 - 22:00)
    if (hour >= 18 && hour < 22) {
      statistics[year].eveningEntriesByMonth[month] = (statistics[year].eveningEntriesByMonth[month] || 0) + entries;
    }
  });

  return statistics;
}

