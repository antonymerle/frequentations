'use client';

import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { DataSource } from '@/lib/types';
import { AttendanceDay, annualOccupancy, calculateOccupancy } from '@/utils/occupancy';

interface OccupancyChartProps {
  year: number;
  days: Record<string, AttendanceDay>;
  site: DataSource;
  mode: 'evening' | 'saturday';
}

export function OccupancyChart({ days, site, mode, year }: OccupancyChartProps) {
  const [uploadSite, setUploadSite] = useState<'bayonne' | 'pau' | ''>('');
  const library = site === 'bayonne' || site === 'pau' ? site : uploadSite;
  const points = useMemo(() => library ? calculateOccupancy(days, library, mode) : [], [days, library, mode]);
  const chartData = points.map(point => ({ ...point,
    morning: point.period === 'Matin' ? point.rate : null,
    afternoon: point.period === 'Après-midi' ? point.rate : null,
    evening: point.period === 'Soirée' ? point.rate : null,
  }));
  const mean = annualOccupancy(points);
  const maximum = Math.max(0.1, ...points.map(point => point.rate ?? 0)) * 1.15;
  const formatRate = (rate: number) => `${rate.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`;
  const ticks = Array.from({ length: 6 }, (_, index) => maximum * index / 5);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupation moyenne estimée — {mode === 'evening' ? 'soirées' : 'samedis'} · {year}</CardTitle>
        {library && <p className="text-sm text-muted-foreground">
          BU {library === 'bayonne' ? 'Bayonne · 196' : 'Pau · 840'} places · {mode === 'evening'
            ? `18:00–22:00 · ${library === 'bayonne' ? 'lundi à mercredi' : 'lundi à vendredi'}`
            : library === 'bayonne' ? '09:00–13:00' : 'Matin : 09:30–13:00 · Après-midi : 13:00–16:30'}
        </p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {site !== 'bayonne' && site !== 'pau' && <label className="flex items-center gap-3 text-sm">
          Bibliothèque du fichier importé
          <select className="rounded-md border bg-background p-2" value={uploadSite} onChange={event => setUploadSite(event.target.value as 'bayonne' | 'pau' | '')}>
            <option value="">Choisir la bibliothèque</option>
            <option value="bayonne">Bayonne (196 places)</option>
            <option value="pau">Pau (840 places)</option>
          </select>
        </label>}
        {library && (points.some(point => point.rate !== null) ? <>
          <div className="rounded-lg bg-muted p-4 space-y-1">
            <p className="text-sm">Moyenne annuelle {year} · {mode === 'evening' ? 'soirées ouvertes' : 'samedis ouverts'}</p>
            <p className="text-2xl font-semibold">{mean === null ? 'Aucune donnée' : formatRate(mean)}</p>
            {mode === 'saturday' && library === 'pau' && <p className="text-sm">
              {['Matin', 'Après-midi'].map(period => {
                const average = annualOccupancy(points.filter(point => point.period === period));
                return `${period} : ${average === null ? 'aucune donnée' : formatRate(average)}`;
              }).join(' · ')}
            </p>}
          </div>
          <p className="text-sm text-muted-foreground">Chaque point représente la moyenne du créneau sur toute l’année sélectionnée. Échelle verticale adaptée aux taux observés.</p>
          <ChartContainer config={{
            morning: { label: 'Matin', color: 'hsl(var(--chart-1))' },
            afternoon: { label: 'Après-midi', color: 'hsl(var(--chart-2))' },
            evening: { label: 'Soirée', color: 'hsl(var(--chart-1))' },
          }} className="h-[320px] w-full">
            <LineChart data={chartData} margin={{ top: 15, right: 20, bottom: 65, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" interval="preserveStartEnd" minTickGap={8} angle={-45} textAnchor="end" tickMargin={10} />
              <YAxis domain={[0, maximum]} ticks={ticks} tickFormatter={formatRate} width={65} />
              {mean !== null && <ReferenceLine y={mean} stroke="hsl(var(--foreground))" strokeDasharray="5 5" label={{ value: 'Moyenne annuelle', position: 'insideTopRight', fontSize: 11 }} />}
              <ChartTooltip content={({ active, payload }) => {
                const label = payload?.[0]?.payload?.label;
                const point = points.find(item => item.label === label);
                return active && point && point.rate !== null ? <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                  <p className="font-semibold">{point.period} · {point.label}</p>
                  <p>Estimation : {formatRate(point.rate)}</p>
                  <p>{point.days.toLocaleString('fr-FR')} jours retenus</p>
                </div> : null;
              }} />
              {(mode === 'evening' ? ['evening'] : ['morning', 'afternoon']).map(key => <Line key={key} type="linear" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />)}
            </LineChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-4 text-sm">
            {(mode === 'evening' ? ['Soirée'] : library === 'pau' ? ['Matin', 'Après-midi'] : ['Matin']).map(period => <span key={period}>
              {period} : {Math.max(...points.filter(point => point.period === period).map(point => point.days)).toLocaleString('fr-FR')} jours retenus
            </span>)}
          </div>
        </> : <p>Aucune plage ouverte exploitable pour cette année.</p>)}
        <p className="text-sm text-muted-foreground">
          Présence estimée par cumul des entrées moins les sorties depuis le début de chaque journée, puis moyenne par demi-heure rapportée à la capacité.
          Seules les plages avec des entrées ou sorties sont retenues ; les samedis doivent dépasser 5 entrées sur les horaires d’ouverture.
          À Pau, le matin et l’après-midi sont sélectionnés séparément. Les demi-heures sans mouvement d’une plage retenue restent incluses ; les observations manquantes sont exclues.
        </p>
        <p className="text-sm text-muted-foreground">
          Taux calculés sans arrondi par palier ni minimum imposé ; affichage à deux décimales. La moyenne annuelle utilise toutes les demi-heures disponibles des plages ouvertes de l’année, pondérées par leur nombre de jours observés. Une absence de données ne vaut pas zéro.
          Le survol indique le taux calculé et le nombre de jours. Les compteurs de passage donnent une estimation de présence, pas une mesure des places assises occupées.
        </p>
      </CardContent>
    </Card>
  );
}
