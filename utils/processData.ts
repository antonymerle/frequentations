import Papa from "papaparse";

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

const frenchMonths = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function parseDateTime(dateTimeString: string): Date | null {
  try {
    const [datePart, timePart] = dateTimeString.split(" ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    // Additional validation
    if (
      isNaN(month) ||
      isNaN(day) ||
      isNaN(year) ||
      isNaN(hours) ||
      isNaN(minutes)
    ) {
      throw new Error("Invalid date or time format");
    }

    return new Date(year, month - 1, day, hours, minutes);
  } catch (error) {
    console.error("Error parsing datetime:", error);
    return null;
  }
}

export function processCSV(csvContent: string): Statistics {
  const { data } = Papa.parse<AttendanceData>(csvContent, { header: true });

  const statistics: Statistics = {};
  let errorCount = 0;

  data.forEach((row, i) => {
    if (
      !row.Date ||
      row.Date.length !== 16 || // "25/12/2024 12:00" => 16 characters
      !row.Jour ||
      !row.Entrees //||
      // isNaN(Date.parse(row.Date)) ||
      //  isNaN(parseInt(row.Entrees, 10))
    ) {
      console.warn("Invalid row:", row, i);
      errorCount++;
      return;
    }
    // console.log("raw Date", row.Date);

    // convert date format to "YYYY-MM-DD"
    // const formattedDate = row.Date.split("/").reverse().join("/");

    // const timestamp = Date.parse(formattedDate);
    // const date = new Date(formattedDate);
    const date = parseDateTime(row.Date);
    if (!date) {
      console.warn("Invalid date:", row.Date);
      errorCount++;
      return;
    }
    // console.log({ date });

    const year = date.getFullYear();
    // console.log({ year });

    const month = frenchMonths[date.getMonth()];
    // console.log({ month });
    const entries = parseInt(row.Entrees);
    const hour = date.getHours();

    if (!statistics[year]) {
      statistics[year] = {
        entriesByMonth: {},
        saturdayEntriesByMonth: {},
        eveningEntriesByMonth: {},
      };
    }

    // Ensure each month is initialized
    if (!statistics[year].entriesByMonth[month]) {
      statistics[year].entriesByMonth[month] = 0;
    }
    if (!statistics[year].saturdayEntriesByMonth[month]) {
      statistics[year].saturdayEntriesByMonth[month] = 0;
    }
    if (!statistics[year].eveningEntriesByMonth[month]) {
      statistics[year].eveningEntriesByMonth[month] = 0;
    }

    // Total entries by month
    statistics[year].entriesByMonth[month] =
      (statistics[year].entriesByMonth[month] || 0) + entries;

    // Saturday entries by month
    if (row.Jour && row.Jour.toLowerCase() === "samedi") {
      statistics[year].saturdayEntriesByMonth[month] =
        (statistics[year].saturdayEntriesByMonth[month] || 0) + entries;
    }

    // Evening entries by month (18:00 - 22:00)
    if (hour >= 18 && hour < 22) {
      statistics[year].eveningEntriesByMonth[month] =
        (statistics[year].eveningEntriesByMonth[month] || 0) + entries;
    }
  });
  console.log({ errorCount });

  console.log({ statistics });

  return statistics;
}
