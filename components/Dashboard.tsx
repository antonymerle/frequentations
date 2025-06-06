'use client';

import { useState, useMemo } from 'react';
import { EntriesChart } from './EntriesChart';
import { EveningTimeSlotsChart } from './EveningTimeSlotsChart';
import { SaturdayComparisonChart } from './SaturdayComparisonChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataSource } from '@/lib/types';

interface YearlyStatistics {
  entriesByMonth: { [key: string]: number };
  saturdayEntriesByMonth: { [key: string]: number };
  eveningEntriesByMonth: { [key: string]: number };
  saturdayMorningEntriesByMonth: { [key: string]: number };
  saturdayAfternoonEntriesByMonth: { [key: string]: number };
  openedSaturdaysCount: number;
  eveningTimeSlots: {
    [date: string]: {
      [timeSlot: string]: number;
    };
  };
}

interface DashboardProps {
  statistics: {
    [year: number]: YearlyStatistics;
  };
  site: DataSource;
  onReset: () => void;
}

export function Dashboard({ statistics, site, onReset }: DashboardProps) {
  const years = useMemo(
    () =>
      Object.keys(statistics)
        .map(Number)
        .sort((a, b) => b - a),
    [statistics]
  );
  const [selectedYear, setSelectedYear] = useState<number>(years[0]);

  const yearlyStats = statistics[selectedYear];

  const totalEntries = Object.values(yearlyStats.entriesByMonth).reduce((a, b) => a + b, 0);
  const totalSaturdayEntries = Object.values(yearlyStats.saturdayEntriesByMonth).reduce(
    (a, b) => a + b,
    0
  );
  const totalEveningEntries = Object.values(yearlyStats.eveningEntriesByMonth).reduce(
    (a, b) => a + b,
    0
  );

  const openedSaturdaysCount = yearlyStats.openedSaturdaysCount || 0;

  const getTitle = () => {
    switch (site) {
      case 'bayonne':
        return `BU Bayonne : statistiques pour ${selectedYear}`;
      case 'pau':
        return `BU Pau : statistiques pour ${selectedYear}`;
      default:
        return `Statistiques pour ${selectedYear}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <Select onValueChange={(value) => setSelectedYear(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Changer l'année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onReset} variant="outline">
          Réinitialiser
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Totales le Samedi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSaturdayEntries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Samedis Ouverts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openedSaturdaysCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées Totales en Soirée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEveningEntries.toLocaleString()}</div>
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
      {/* l'analyse des données de l'après midi ne concerne que Pau */}
      {site === 'pau' && (
        <SaturdayComparisonChart
          morningData={yearlyStats.saturdayMorningEntriesByMonth}
          afternoonData={yearlyStats.saturdayAfternoonEntriesByMonth}
        />
      )}
      <EntriesChart
        data={yearlyStats.eveningEntriesByMonth}
        title="Entrées en Soirée par Mois (18:00 - 22:00)"
        type="evening"
      />
      <EveningTimeSlotsChart eveningTimeSlots={yearlyStats.eveningTimeSlots} site={site} />
    </div>
  );
}
