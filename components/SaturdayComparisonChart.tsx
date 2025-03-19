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

interface SaturdayComparisonChartProps {
  morningData: { [key: string]: number };
  afternoonData: { [key: string]: number };
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

export function SaturdayComparisonChart({
  morningData,
  afternoonData,
}: SaturdayComparisonChartProps) {
  const chartData = frenchMonths.map((month) => {
    const morningEntries = morningData[month] || 0;
    const afternoonEntries = afternoonData[month] || 0;
    const totalEntries = morningEntries + afternoonEntries;

    return {
      month,
      morning: morningEntries,
      afternoon: afternoonEntries,
      morningRatio:
        totalEntries > 0
          ? ((morningEntries / totalEntries) * 100).toFixed(1)
          : "0",
      afternoonRatio:
        totalEntries > 0
          ? ((afternoonEntries / totalEntries) * 100).toFixed(1)
          : "0",
    };
  });

  // Calculate totals for the entire period
  const totalMorning = Object.values(morningData).reduce(
    (sum, val) => sum + val,
    0
  );
  const totalAfternoon = Object.values(afternoonData).reduce(
    (sum, val) => sum + val,
    0
  );
  const grandTotal = totalMorning + totalAfternoon;
  const morningRatio =
    grandTotal > 0 ? ((totalMorning / grandTotal) * 100).toFixed(1) : "0";
  const afternoonRatio =
    grandTotal > 0 ? ((totalAfternoon / grandTotal) * 100).toFixed(1) : "0";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Samedis : matin vs après-midi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartContainer
            config={{
              morning: {
                label: "Matin (9:30 - 13:00)",
                color: "hsl(var(--chart-1))",
              },
              afternoon: {
                label: "Après-midi (13:00 - 16:30)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="morning"
                  fill="var(--color-morning)"
                  name="Matin (9:30 - 13:00)"
                />
                <Bar
                  dataKey="afternoon"
                  fill="var(--color-afternoon)"
                  name="Après-midi (13:00 - 16:30)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Répartition des entrées le samedi
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Entrées matin</p>
                  <p className="text-xl font-bold">
                    {totalMorning.toLocaleString()}
                  </p>
                  <p className="text-sm">{morningRatio}% du total</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Entrées après-midi</p>
                  <p className="text-xl font-bold">
                    {totalAfternoon.toLocaleString()}
                  </p>
                  <p className="text-sm">{afternoonRatio}% du total</p>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[200px] pr-4">
              <h3 className="text-lg font-semibold mb-2">Détails par Mois</h3>
              <ul className="space-y-2">
                {chartData.map(
                  ({
                    month,
                    morning,
                    afternoon,
                    morningRatio,
                    afternoonRatio,
                  }) => (
                    <li key={month} className="text-sm">
                      <strong>{month}:</strong> Matin: {morning} ({morningRatio}
                      %), Après-midi: {afternoon} ({afternoonRatio}%)
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
