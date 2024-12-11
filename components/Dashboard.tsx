import { useState } from 'react';
import { EntriesChart } from './EntriesChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const years = Object.keys(statistics).map(Number).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const yearlyStats = statistics[selectedYear];

  const totalEntries = Object.values(yearlyStats.entriesByMonth).reduce((a, b) => a + b, 0);
  const totalSaturdayEntries = Object.values(yearlyStats.saturdayEntriesByMonth).reduce((a, b) => a + b, 0);
  const totalEveningEntries = Object.values(yearlyStats.eveningEntriesByMonth).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistics for {selectedYear}</h2>
        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
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
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saturday Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSaturdayEntries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evening Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEveningEntries.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      <EntriesChart data={yearlyStats.entriesByMonth} title="Total Entries by Month" />
      <EntriesChart data={yearlyStats.saturdayEntriesByMonth} title="Saturday Entries by Month" />
      <EntriesChart data={yearlyStats.eveningEntriesByMonth} title="Evening Entries by Month (18:00 - 22:00)" />
    </div>
  );
}

