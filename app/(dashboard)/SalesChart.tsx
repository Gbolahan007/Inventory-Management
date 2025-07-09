import { ChartContainer } from "@/app/components/ui/ChartContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  LabelList,
} from "recharts";
import { groupSalesByMonth } from "../_lib/groupSalesPerMonth";
import { FormatCurrency } from "../hooks/useFormatCurrency";

interface SalesChartProps {
  monthlySales?: any[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 backdrop-blur-sm">
        <p className="font-semibold text-card-foreground mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-sm text-muted-foreground">Sales:</span>
          <span className="font-bold text-primary">
            {FormatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom label component for bars
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 8}
        fill="hsl(var(--muted-foreground))"
        textAnchor="middle"
        fontSize="10"
        fontWeight="500"
      >
        {value > 0 ? `₦${(value / 1000).toFixed(0)}k` : ""}
      </text>
    </g>
  );
};

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
};

export function SalesChart({ monthlySales }: SalesChartProps) {
  const chartData = groupSalesByMonth(monthlySales);

  // Create color array for gradient effect
  const getBarColor = (index: number, total: number) => {
    const intensity = 0.3 + (index / total) * 0.7;
    return `hsl(var(--primary) / ${intensity})`;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Sales Overview
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Monthly sales performance for the current year
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs bg-primary/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="font-medium">Monthly Revenue</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] sm:h-[350px] lg:h-[450px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 30, right: 20, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.6}
                  />
                </linearGradient>
                <filter
                  id="shadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="hsl(var(--primary))"
                    floodOpacity="0.2"
                  />
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                }}
                tickLine={false}
                axisLine={false}
                className="sm:text-xs"
                interval={0}
              />
              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₦${value / 1000}k`}
                className="sm:text-xs"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "hsl(var(--primary))",
                  fillOpacity: 0.1,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />
              <Bar
                dataKey="sales"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                filter="url(#shadow)"
                strokeWidth={1}
                stroke="hsl(var(--primary))"
                strokeOpacity={0.1}
              >
                <LabelList content={<CustomLabel />} />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(index, chartData.length)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
