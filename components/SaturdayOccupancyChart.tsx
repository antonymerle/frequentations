'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OccupancyChart } from './OccupancyChart';
import { DataSource } from '@/lib/types';

interface SaturdayOccupancyChartProps {
  occupancyByHour: {
    [date: string]: {
      [timeSlot: string]: number;
    };
  };
  site: DataSource;
  capacity: number;
}

export function SaturdayOccupancyChart({ occupancyByHour, site, capacity }: SaturdayOccupancyChartProps) {
  const filteredOccupancy = useMemo(() => {
    const filtered: typeof occupancyByHour = {};

    if (site === 'bayonne') {
      const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
      Object.entries(occupancyByHour).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        if (date.getDay() !== 6) return;

        const hasActivity = morningSlots.some((slot) => data[slot] !== undefined && data[slot] > 0);
        if (hasActivity) {
          filtered[dateStr] = data;
        }
      });
    }

    if (site === 'pau') {
      const morningSlots = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
      const afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
      Object.entries(occupancyByHour).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        if (date.getDay() !== 6) return;

        const hasMorningActivity = morningSlots.some((slot) => data[slot] !== undefined && data[slot] > 0);
        const hasAfternoonActivity = afternoonSlots.some((slot) => data[slot] !== undefined && data[slot] > 0);
        if (hasMorningActivity || hasAfternoonActivity) {
          filtered[dateStr] = data;
        }
      });
    }

    return filtered;
  }, [occupancyByHour, site]);

  if (!filteredOccupancy || Object.keys(filteredOccupancy).length === 0) {
    return null;
  }

  const getSaturdayLabel = () => {
    switch (site) {
      case 'bayonne':
        return `BU Bayonne — Taux d'occupation le Samedi (${site ? '' : ''})`;
      case 'pau':
        return `BU Pau — Taux d'occupation le Samedi`;
      default:
        return 'Taux d\'occupation le Samedi';
    }
  };

  if (site === 'bayonne') {
    const bayonneMorningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

    return (
      <OccupancyChart
        occupancyByHour={filteredOccupancy}
        timeSlots={bayonneMorningSlots}
        capacity={capacity}
        title={`${getSaturdayLabel()} — Matin (09:00–13:00)`}
        periodLabel="samedi matin"
        dayFilter={(date) => date.getDay() === 6}
      />
    );
  }

  if (site === 'pau') {
    const pauMorningSlots = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
    const pauAfternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    return (
      <div className="space-y-6">
        <OccupancyChart
          occupancyByHour={filteredOccupancy}
          timeSlots={pauMorningSlots}
          capacity={capacity}
          title={`BU Pau — Taux d'occupation le Samedi — Matin (09:30–13:00)`}
          periodLabel="samedi matin"
          dayFilter={(date) => date.getDay() === 6}
        />
        <OccupancyChart
          occupancyByHour={filteredOccupancy}
          timeSlots={pauAfternoonSlots}
          capacity={capacity}
          title={`BU Pau — Taux d'occupation le Samedi — Après-midi (13:00–16:30)`}
          periodLabel="samedi après-midi"
          dayFilter={(date) => date.getDay() === 6}
        />
      </div>
    );
  }

  return null;
}
