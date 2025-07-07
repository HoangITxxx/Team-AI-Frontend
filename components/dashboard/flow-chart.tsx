// app/components/dashboard/flow-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', current: 12, previous: 10 },
  { name: 'Feb', current: 19, previous: 15 },
  { name: 'Mar', current: 15, previous: 20 },
  { name: 'Apr', current: 10, previous: 22 },
  { name: 'May', current: 18, previous: 14 },
  { name: 'Jun', current: 24, previous: 16 },
];

export default function FlowChart() {
  return (
    <Card className="bg-white/10 border-0 text-foreground h-full min-h-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-medium ">Flow In/Out</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total <span className="text-foreground font-semibold">120</span></span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-chart-2 rounded-full"></span>
              Current Week <span className="text-foreground font-semibold">58</span>
            </span>
            <span className="flex items-center gap-2 pr-16">
              <span className="h-0.5 w-3 bg-foreground"></span>
              Previous Week <span className="text-foreground font-semibold">68</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))'
              }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}