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
  saturdayMorningEntriesByMonth: { [key: string]: number }
  saturdayAfternoonEntriesByMonth: { [key: string]: number }
  eveningTimeSlots: {
    [date: string]: {
      [timeSlot: string]: number
    }
  }
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

// Time slots for evening hours (18:00 to 22:00)
const eveningTimeSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

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
  const cleanedContent = csvContent.replace(/^sep=.*\r?\n/, ""); // Papa Parse is having trouble parsing the CSV due to the sep=, line. This line is a special instruction for some spreadsheet software but isn't part of the actual CSV data.

  const { data } = Papa.parse<AttendanceData>(cleanedContent, {
    header: true,
    skipEmptyLines: true, // Skip completely empty lines
    // Add these options to handle quotes and potential formatting issues
    quoteChar: '"',
    delimiter: ",",
  });

  const statistics: Statistics = {};
  let errorCount = 0;

    // First pass: collect all data and identify days with attendance after 20:00
    const daysWithLateAttendance = new Set<string>()

  data.forEach((row, i) => {
    if (
      !row.Date ||
      typeof row.Date !== "string" ||
      row.Date.length < 16 ||
      !row.Entrees
    ) {
      console.warn("Invalid row:", row, i);
      errorCount++;
      return;
    }

    const date = parseDateTime(row.Date);
    if (!date) {
      console.warn("Invalid date:", row.Date);
      errorCount++;
      return;
    }


    // const year = date.getFullYear();

    // const month = frenchMonths[date.getMonth()];

    // const entries = parseInt(row.Entrees);
    // const hour = date.getHours();

     // Check if this is after 20:00 and has entries
    //  if (hour >= 20 && entries > 0) {
    //   const dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD format
    //   daysWithLateAttendance.add(dateKey)
    // }


  //  // Second pass: process all data
  //  data.forEach((row, i) => {
  //   if (!row.Date || typeof row.Date !== "string" || row.Date.length < 16 || !row.Entrees) {
  //     return // Already logged in first pass
  //   }

  //   const date = parseDateTime(row.Date)
  //   if (!date) {
  //     return // Already logged in first pass
  //   }

    const year = date.getFullYear()
    const month = frenchMonths[date.getMonth()]
    const entries = Number.parseInt(row.Entrees)
    const hour = date.getHours()
    const minute = date.getMinutes()
    const dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD format
    const timeSlot = `${hour.toString().padStart(2, "0")}:${minute >= 30 ? "30" : "00"}`

    if (!statistics[year]) {
      statistics[year] = {
        entriesByMonth: {},
        saturdayEntriesByMonth: {},
        eveningEntriesByMonth: {},
        saturdayMorningEntriesByMonth: {},
        saturdayAfternoonEntriesByMonth: {},
        eveningTimeSlots: {},
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
    if (!statistics[year].saturdayMorningEntriesByMonth[month]) {
      statistics[year].saturdayMorningEntriesByMonth[month] = 0
    }
    if (!statistics[year].saturdayAfternoonEntriesByMonth[month]) {
      statistics[year].saturdayAfternoonEntriesByMonth[month] = 0
    } 

    // Total entries by month
    statistics[year].entriesByMonth[month] =
      (statistics[year].entriesByMonth[month] || 0) + entries;

    // Saturday entries by month
    if (row.Jour && row.Jour.toLowerCase() === "samedi") {
      statistics[year].saturdayEntriesByMonth[month] =
        (statistics[year].saturdayEntriesByMonth[month] || 0) + entries;

          // Saturday morning (9:30 - 13:00) vs afternoon (13:00 - 16:30)
      if (hour >= 9 && (hour < 13 || (hour === 13))) {
        statistics[year].saturdayMorningEntriesByMonth[month || 0] += entries
      } else if (hour >= 13 && hour < 17) {
        statistics[year].saturdayAfternoonEntriesByMonth[month || 0] += entries
      }
    }

    // Evening entries by month (18:00 - 22:00)
    if (hour >= 18 && hour < 22) {
      statistics[year].eveningEntriesByMonth[month] =
        (statistics[year].eveningEntriesByMonth[month] || 0) + entries;

      //   // Track evening time slots for days with attendance after 20:00
      // if (daysWithLateAttendance.has(dateKey)) {

       // Track evening time slots for all days
       if (hour >= 18 && hour <= 22 && eveningTimeSlots.includes(timeSlot)) {
        if (!statistics[year].eveningTimeSlots[dateKey]) {
          // statistics[year].eveningTimeSlots[dateKey] = {
          //   hasAttendanceAfter20: false,
          // }
          statistics[year].eveningTimeSlots[dateKey] = {}


          // Initialize all time slots for this day
          eveningTimeSlots.forEach((slot) => {
            statistics[year].eveningTimeSlots[dateKey][slot] = 0
          })
        }

          statistics[year].eveningTimeSlots[dateKey][timeSlot] += entries
      }
    }
  });
  console.log({ errorCount });

  console.log({ statistics });

  return statistics;
}
