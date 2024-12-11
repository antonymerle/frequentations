import { useState } from "react";
import { EntriesChart } from "./EntriesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearlyStatistics {
  entriesByMonth: { [key: string]: number };
  saturdayEntriesByMonth: { [key: string]: number };
  eveningEntriesByMonth: { [key: string]: number };
}

interface DashboardProps {
  statistics: {
    [year: number]: YearlyStatistics;
  };
}

export function Dashboard({ statistics }: DashboardProps) {
  const years = Object.keys(statistics)
    .map(Number)
    .sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const yearlyStats = statistics[selectedYear];

  const totalEntries = Object.values(yearlyStats.entriesByMonth).reduce(
    (a, b) => a + b,
    0
  );
  const totalSaturdayEntries = Object.values(
    yearlyStats.saturdayEntriesByMonth
  ).reduce((a, b) => a + b, 0);
  const totalEveningEntries = Object.values(
    yearlyStats.eveningEntriesByMonth
  ).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistiques pour {selectedYear}</h2>
        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner l'année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrées Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEntries.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrées Totales le Samedi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSaturdayEntries.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrées Totales en Soirée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEveningEntries.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      <EntriesChart
        data={yearlyStats.entriesByMonth}
        title="Entrées Totales par Mois"
        type="total"
      />
      <EntriesChart
        data={yearlyStats.saturdayEntriesByMonth}
        title="Entrées le Samedi par Mois"
        type="saturday"
      />
      <EntriesChart
        data={yearlyStats.eveningEntriesByMonth}
        title="Entrées en Soirée par Mois (18:00 - 22:00)"
        type="evening"
      />
    </div>
  );
}
