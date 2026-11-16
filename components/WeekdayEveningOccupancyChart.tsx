'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { OccupancyChart } from './OccupancyChart';
import { DataSource } from '@/lib/types';

interface WeekdayEveningOccupancyChartProps {
  occupancyByHour: {
    [date: string]: {
      [timeSlot: string]: number;
    };
  };
  site: DataSource;
  capacity: number;
}

const eveningSlots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export function WeekdayEveningOccupancyChart({ occupancyByHour, site, capacity }: WeekdayEveningOccupancyChartProps) {
  const chartData = useMemo(() => {
    const allDates = Object.keys(occupancyByHour);
    if (allDates.length === 0) return [];

    // First pass: identify dates that are weekday AND have actual evening activity
    const activeDates: string[] = [];
    Object.entries(occupancyByHour).forEach(([dateStr, data]) => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0) return;
      if (site === 'bayonne' && (dayOfWeek === 5 || dayOfWeek === 4)) return;

      const hasEveningActivity = eveningSlots.some((slot) => data[slot] !== undefined && data[slot] > 0);
      if (hasEveningActivity) {
        activeDates.push(dateStr);
      }
    });

    const slotSums: { [slot: string]: number } = {};
    const slotCounts: { [slot: string]: number } = {};

    eveningSlots.forEach((slot) => {
      slotSums[slot] = 0;
      slotCounts[slot] = 0;
    });

    activeDates.forEach((dateStr) => {
      const data = occupancyByHour[dateStr];
      eveningSlots.forEach((slot) => {
        if (data[slot] !== undefined) {
          slotSums[slot] += data[slot];
          slotCounts[slot]++;
        }
      });
    });

    return eveningSlots.map((slot) => ({
      timeSlot: slot,
      occupancy: slotCounts[slot] > 0 ? Math.round(slotSums[slot] / slotCounts[slot]) : 0,
      occupancyRate: slotCounts[slot] > 0 ? ((slotSums[slot] / slotCounts[slot]) / capacity) * 100 : 0,
      dayCount: slotCounts[slot],
    }));
  }, [occupancyByHour, capacity, site]);

  const weightedAvg = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.occupancyRate * item.dayCount, 0);
    const totalCounts = chartData.reduce((sum, item) => sum + item.dayCount, 0);
    return totalCounts > 0 ? Math.round((total / totalCounts) * 10) / 10 : 0;
  }, [chartData]);

  const getChartTitle = () => {
    switch (site) {
      case 'bayonne':
        return 'BU Bayonne — Taux d\'occupation en Soirée (18:00–21:30) — Semaine (excl. jeudi/vendredi)';
      case 'pau':
        return 'BU Pau — Taux d\'occupation en Soirée (18:00–21:30) — Semaine (lundi–vendredi)';
      default:
        return 'Taux d\'occupation en Soirée — Semaine';
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
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
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="h-[300px]"
          >
            <ChartContainer
              config={{
                occupancy: {
                  label: 'Taux d\'occupation',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeSlot" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="occupancy" fill="var(--color-occupancy)" name="Places occupées" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Statistiques pour la soirée en semaine</h3>
              <p className="text-sm text-gray-500">
                Moyenne pondérée du taux d'occupation
              </p>
              <p className="text-xl font-bold">{weightedAvg}%</p>
              <p className="text-sm text-gray-500 mt-2">
                Capacité : {capacity} places
              </p>
            </div>

            <div className="overflow-y-auto max-h-[200px] pr-4">
              <h3 className="text-lg font-semibold mb-2">Détails par Tranche Horaire</h3>
              <ul className="space-y-2">
                {chartData.map(({ timeSlot, occupancy, occupancyRate, dayCount }) => (
                  <li key={timeSlot} className="text-sm">
                    <strong>{timeSlot}:</strong> {occupancy} places ({occupancyRate.toFixed(1)}%) — {dayCount} jours
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
