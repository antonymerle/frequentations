// import {
//   Bar,
//   BarChart,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// interface EntriesChartProps {
//   data: { [key: string]: number };
//   title: string;
//   type: "total" | "saturday" | "evening";
// }

// const frenchMonths = [
//   "Janvier",
//   "Février",
//   "Mars",
//   "Avril",
//   "Mai",
//   "Juin",
//   "Juillet",
//   "Août",
//   "Septembre",
//   "Octobre",
//   "Novembre",
//   "Décembre",
// ];

// export function EntriesChart({ data, title, type }: EntriesChartProps) {
//   const chartData = frenchMonths.map((month) => ({
//     month,
//     entries: data[month] || 0,
//   }));

//   const getListItemText = (month: string, entries: number) => {
//     switch (type) {
//       case "total":
//         return `${month} : ${entries} entrées`;
//       case "saturday":
//         return `Samedis ${month} : ${entries} entrées`;
//       case "evening":
//         return `Entrées en soirée pour ${month} : ${entries}`;
//       default:
//         return `${month} : ${entries}`;
//     }
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
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
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Legend />
//                 <Bar dataKey="entries" fill="var(--color-entries)" />
//               </BarChart>
//             </ResponsiveContainer>
//           </ChartContainer>
//           <div className="overflow-y-auto max-h-[300px] pr-4">
//             <ul className="space-y-1">
//               {chartData.map(({ month, entries }) => (
//                 <li key={month} className="text-sm">
//                   {getListItemText(month, entries)}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface EntriesChartProps {
  data: { [key: string]: number };
  title: string;
  type: "total" | "saturday" | "evening";
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

export function EntriesChart({ data, title, type }: EntriesChartProps) {
  const chartData = frenchMonths.map((month) => ({
    month,
    entries: data[month] || 0,
  }));

  const getListItemText = (month: string, entries: number) => {
    switch (type) {
      case "total":
        return `${month} : ${entries} entrées`;
      case "saturday":
        return `Samedis ${month} : ${entries} entrées`;
      case "evening":
        return `Entrées en soirée pour ${month} : ${entries}`;
      default:
        return `${month} : ${entries}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartContainer
            config={{
              entries: {
                label: "Entrées",
                color: "hsl(var(--chart-1))",
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
                <Bar dataKey="entries" fill="var(--color-entries)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="overflow-y-auto max-h-[300px] pr-4">
            <ul className="space-y-1">
              {chartData.map(({ month, entries }) => (
                <li key={month} className="text-sm">
                  {getListItemText(month, entries)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
