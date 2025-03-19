"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataSource } from "@/lib/types";

interface EveningTimeSlotsChartProps {
  eveningTimeSlots: {
    [date: string]: {
      [timeSlot: string]: number;
    };
  };
  site: DataSource;
}

const timeSlots = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

export function EveningTimeSlotsChart({
  eveningTimeSlots,
  site,
}: EveningTimeSlotsChartProps) {
  // Get all available dates
  const allDates = useMemo(() => {
    return Object.keys(eveningTimeSlots).sort();
  }, [eveningTimeSlots]);

  // Set default date range (start: earliest date, end: latest date)
  const [startDate, setStartDate] = useState<Date | undefined>(
    allDates.length > 0 ? new Date(allDates[0]) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    allDates.length > 0 ? new Date(allDates[allDates.length - 1]) : undefined
  );

  // Calculate mean entries for each time slot within the selected date range
  const chartData = useMemo(() => {
    if (!startDate || !endDate || allDates.length === 0) return [];

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Initialize counters for each time slot
    const slotSums: { [slot: string]: number } = {};
    const slotCounts: { [slot: string]: number } = {};

    timeSlots.forEach((slot) => {
      slotSums[slot] = 0;
      slotCounts[slot] = 0;
    });

    // Calculate sums and counts for each time slot
    Object.entries(eveningTimeSlots).forEach(([dateStr, data]) => {
      const date = new Date(dateStr);

      // Check if date is within range and is not a weekend
      if (
        dateStr >= startDateStr &&
        dateStr <= endDateStr &&
        date.getDay() !== 0 && // Sunday
        date.getDay() !== 6 && // Saturday
        (site == "bayonne" ? date.getDay() !== 4 && date.getDay() !== 5 : true)
      ) {
        timeSlots.forEach((slot) => {
          if (data[slot] !== undefined) {
            slotSums[slot] += data[slot];
            slotCounts[slot]++;
          }
        });
      }
    });

    // Calculate means
    return timeSlots.map((slot) => ({
      timeSlot: slot,
      meanEntries:
        slotCounts[slot] > 0
          ? Math.round(slotSums[slot] / slotCounts[slot])
          : 0,
    }));
  }, [startDate, endDate, eveningTimeSlots, allDates]);

  // Calculate total mean entries
  const totalMeanEntries = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.meanEntries, 0);
  }, [chartData]);

  if (allDates.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Moyenne des Entrées en Soirée (18:00 - 22:00)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aucune donnée disponible pour cette période.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Moyenne des Entrées en Soirée (18:00 - 22:00)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Date de début</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates after end date or dates not in the dataset
                    return (
                      (endDate ? date > endDate : false) ||
                      !allDates.includes(date.toISOString().split("T")[0])
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">Date de fin</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates before start date or dates not in the dataset
                    return (
                      (startDate ? date < startDate : false) ||
                      !allDates.includes(date.toISOString().split("T")[0])
                    );
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartContainer
            config={{
              meanEntries: {
                label: "Moyenne des Entrées",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeSlot" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="meanEntries"
                  fill="var(--color-meanEntries)"
                  name="Moyenne des Entrées"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Statistiques pour la période sélectionnée
              </h3>
              <p className="text-sm text-gray-500">
                Moyenne totale des entrées en soirée (hors week-ends)
              </p>
              <p className="text-xl font-bold">
                {totalMeanEntries.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">Période</p>
              <p className="text-sm">
                {startDate && endDate ? (
                  <>
                    Du {format(startDate, "PPP", { locale: fr })} au{" "}
                    {format(endDate, "PPP", { locale: fr })}
                  </>
                ) : (
                  "Période non sélectionnée"
                )}
              </p>
            </div>

            <div className="overflow-y-auto max-h-[200px] pr-4">
              <h3 className="text-lg font-semibold mb-2">
                Détails par Tranche Horaire
              </h3>
              <ul className="space-y-2">
                {chartData.map(({ timeSlot, meanEntries }) => (
                  <li key={timeSlot} className="text-sm">
                    <strong>{timeSlot}:</strong> {meanEntries} entrées en
                    moyenne
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// "use client";

// import { useState, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Bar,
//   BarChart,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface EveningTimeSlotsChartProps {
//   eveningTimeSlots: {
//     [date: string]: {
//       [timeSlot: string]: number;
//       hasAttendanceAfter20: boolean;
//     };
//   };
// }

// export function EveningTimeSlotsChart({
//   eveningTimeSlots,
// }: EveningTimeSlotsChartProps) {
//   // Get all dates with late attendance
//   const datesWithLateAttendance = useMemo(() => {
//     return Object.entries(eveningTimeSlots)
//       .filter(([_, data]) => data.hasAttendanceAfter20)
//       .map(([date, _]) => {
//         const dateObj = new Date(date);
//         return {
//           value: date,
//           label: dateObj.toLocaleDateString("fr-FR", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//         };
//       })
//       .sort(
//         (a, b) => new Date(b.value).getTime() - new Date(a.value).getTime()
//       );
//   }, [eveningTimeSlots]);

//   const [selectedDate, setSelectedDate] = useState<string>(
//     datesWithLateAttendance.length > 0 ? datesWithLateAttendance[0].value : ""
//   );

//   // Prepare chart data for the selected date
//   const chartData = useMemo(() => {
//     if (!selectedDate || !eveningTimeSlots[selectedDate]) return [];

//     const timeSlots = [
//       "18:00",
//       "18:30",
//       "19:00",
//       "19:30",
//       "20:00",
//       "20:30",
//       "21:00",
//       "21:30",
//     ];

//     return timeSlots.map((slot) => ({
//       timeSlot: slot,
//       entries: eveningTimeSlots[selectedDate][slot] || 0,
//     }));
//   }, [selectedDate, eveningTimeSlots]);

//   // Calculate total entries for the selected date
//   const totalEntries = useMemo(() => {
//     if (!selectedDate || !eveningTimeSlots[selectedDate]) return 0;

//     return Object.entries(eveningTimeSlots[selectedDate])
//       .filter(([key, _]) => key !== "hasAttendanceAfter20")
//       .reduce((sum, [_, value]) => sum + value, 0);
//   }, [selectedDate, eveningTimeSlots]);

//   if (datesWithLateAttendance.length === 0) {
//     return (
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>Fréquentation en Soirée (18:00 - 22:00)</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p>Aucune journée avec fréquentation après 20:00 n'a été trouvée.</p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Fréquentation en Soirée (18:00 - 22:00)</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="mb-4">
//           <Select value={selectedDate} onValueChange={setSelectedDate}>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Sélectionner une date" />
//             </SelectTrigger>
//             <SelectContent>
//               {datesWithLateAttendance.map((date) => (
//                 <SelectItem key={date.value} value={date.value}>
//                   {date.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <ChartContainer
//             config={{
//               entries: {
//                 label: "Entrées",
//                 color: "hsl(var(--chart-1))",
//               },
//             }}
//             className="h-[300px]"
//           >
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="timeSlot" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Legend />
//                 <Bar
//                   dataKey="entries"
//                   fill="var(--color-entries)"
//                   name="Entrées"
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartContainer>

//           <div className="space-y-4">
//             <div className="bg-gray-100 p-4 rounded-lg">
//               <h3 className="text-lg font-semibold mb-2">
//                 Statistiques pour{" "}
//                 {new Date(selectedDate).toLocaleDateString("fr-FR", {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </h3>
//               <p className="text-sm text-gray-500">
//                 Total des entrées en soirée
//               </p>
//               <p className="text-xl font-bold">
//                 {totalEntries.toLocaleString()}
//               </p>
//             </div>

//             <div className="overflow-y-auto max-h-[200px] pr-4">
//               <h3 className="text-lg font-semibold mb-2">
//                 Détails par Tranche Horaire
//               </h3>
//               <ul className="space-y-2">
//                 {chartData.map(({ timeSlot, entries }) => (
//                   <li key={timeSlot} className="text-sm">
//                     <strong>{timeSlot}:</strong> {entries} entrées
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
